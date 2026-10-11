import { randomUUID } from 'node:crypto';
import { isNetworkError, type NetworkType } from '@siar/networks';
import { Prisma } from '../generated/prisma/client.js';
import { requirePermission, type Actor } from '../platform/auth.js';
import { prisma } from '../platform/db.js';
import { AppError, badRequest, conflict, notFound, validation, type Issue } from '../platform/errors.js';
import { listOf } from '../platform/http.js';
import { logger } from '../platform/logger.js';
import { adapter, loadAccount, mediaRef, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import { limitsFor } from '../domain/plans.js';
import { accountKey, consumeAccountMonth } from '../domain/quota.js';
import { networkFailure } from './accounts.js';
import { sendPrivateReply, sendToConversation, setConversationStatus, uploadMedia } from './messaging-conversations.js';
import {
  before, conversationOf, encodeCursor, execution, flow as flowShape, gate, isMessagingType, issue, META_KEY, messagingOf, pageArgs,
  providerSetting, releaseAccountMonth, socialAccountIn, teamIn,
} from './messaging-shared.js';

/**
 * Automations: flows (draft → published versions), the execution engine and Meta provider settings
 * (persistent menu / ice breakers).
 *
 *   trigger event ──match published flows──▶ AutomationExecution QUEUED (idempotencyKey = flow + event)
 *        └─ run quota consumed in the same transaction (over quota → SKIPPED)
 *   job automation.run ──claim QUEUED→RUNNING (conditional UPDATE)──▶ steps in order ──▶ COMPLETED | FAILED
 *
 * One trigger event runs a flow at most once (unique idempotencyKey). A flow's draft is edited in
 * place; publishing copies it into a new immutable version that executions point at.
 */

export type TriggerType = 'COMMENT_CREATED' | 'DM_RECEIVED' | 'QUICK_REPLY_CLICKED' | 'BUTTON_CLICKED' | 'MANUAL_TEST';
const COMMENT_STEPS = new Set(['SEND_PRIVATE_REPLY', 'SEND_PUBLIC_COMMENT_REPLY', 'LIKE_COMMENT']);
const CONVERSATION_STEPS = new Set(['SEND_MESSAGE', 'ARCHIVE_CONVERSATION', 'OPEN_CONVERSATION']);

export interface TriggerEvent {
  type: Exclude<TriggerType, 'MANUAL_TEST'>;
  teamId: string;
  organizationId: string;
  platform: string;
  socialAccountId: string;
  /** Unique per event (message id, comment id) — the flow id is added to make the idempotency key. */
  eventKey: string;
  conversationId?: string | null;
  conversationMessageId?: string | null;
  fetchedCommentId?: string | null;
  senderExternalId?: string | null;
  externalMessageId?: string | null;
  text?: string | null;
  payload?: string | null;
  postId?: string | null;
  importedPostId?: string | null;
  externalPostId?: string | null;
}

// ───────────────────────────── definitions ─────────────────────────────

interface Definition { trigger: Record<string, any>; steps: Record<string, any>[] }

const defOf = (v: { definition: unknown } | null | undefined): Definition | null => {
  const d = v?.definition as any;
  return d?.trigger ? { trigger: d.trigger, steps: Array.isArray(d.steps) ? d.steps : [] } : null;
};
const scopeAllows = (scope: string, platform: string) => (scope === 'BOTH' ? platform === 'INSTAGRAM' || platform === 'FACEBOOK' : scope === platform);

/** Check a definition against the team (accounts, uploads) and the network's rules; assign missing ids. */
async function normalizeDefinition(actor: Actor, teamId: string, scope: string, def: Definition, path: string[] = ['definition']): Promise<Definition> {
  const issues: Issue[] = [];
  const trigger: Record<string, any> = { ...def.trigger, id: def.trigger.id ?? randomUUID() };
  if (Array.isArray(trigger.keywords)) trigger.keywords = trigger.keywords.map((k: string) => String(k).trim()).filter(Boolean);
  if (!scopeAllows(scope, trigger.platform)) issues.push(issue([...path, 'trigger', 'platform'], `trigger.platform ${trigger.platform} is outside the flow's platformScope ${scope}.`));
  const account = await prisma.socialAccount.findFirst({ where: { id: trigger.socialAccountId, teamId, deletedAt: null } });
  if (!account) issues.push(issue([...path, 'trigger', 'socialAccountId'], 'trigger.socialAccountId is not a connected account of this team.', 'not_found'));
  else if (account.type !== trigger.platform) issues.push(issue([...path, 'trigger', 'socialAccountId'], `trigger.socialAccountId is a ${account.type} account but trigger.platform is ${trigger.platform}.`));
  const ids = new Set<string>();
  let privateReplies = 0;
  const uploadIds: { id: string; at: (string | number)[] }[] = [];
  const steps = def.steps.map((s, i) => {
    const step: Record<string, any> = { ...s, id: s.id ?? randomUUID() };
    if (ids.has(step.id)) issues.push(issue([...path, 'steps', i, 'id'], `Step id ${step.id} is used twice.`));
    ids.add(step.id);
    const commentTrigger = trigger.type === 'COMMENT_CREATED' || trigger.type === 'MANUAL_TEST';
    if (COMMENT_STEPS.has(step.type) && !commentTrigger) issues.push(issue([...path, 'steps', i, 'type'], `${step.type} needs a comment, so it only works with a COMMENT_CREATED trigger.`));
    if (step.type === 'SEND_MESSAGE' && trigger.type === 'COMMENT_CREATED') issues.push(issue([...path, 'steps', i, 'type'], 'Meta does not allow a DM to someone who only commented until they reply. Use SEND_PRIVATE_REPLY on comment triggers.'));
    if (step.type === 'SEND_PRIVATE_REPLY') {
      privateReplies++;
      if (!step.message?.text?.trim()) issues.push(issue([...path, 'steps', i, 'message', 'text'], 'A private reply needs text.', 'required'));
    }
    if (step.type === 'SEND_MESSAGE' || step.type === 'SEND_PRIVATE_REPLY') {
      const m = step.message ?? {};
      if (!m.text?.trim() && !m.attachments?.length && !m.carousel?.cards?.length) issues.push(issue([...path, 'steps', i, 'message'], 'The message needs text, attachments or a carousel.', 'required'));
      (m.attachments ?? []).forEach((a: any, j: number) => uploadIds.push({ id: a.uploadId, at: [...path, 'steps', i, 'message', 'attachments', j, 'uploadId'] }));
      (m.carousel?.cards ?? []).forEach((c: any, j: number) => c.imageUploadId && uploadIds.push({ id: c.imageUploadId, at: [...path, 'steps', i, 'message', 'carousel', 'cards', j, 'imageUploadId'] }));
    }
    return step;
  });
  if (privateReplies > 1) issues.push(issue([...path, 'steps'], 'Meta allows one private reply per comment, so a flow can have at most one SEND_PRIVATE_REPLY step.'));
  if (uploadIds.length) {
    const found = new Set((await prisma.upload.findMany({ where: { id: { in: uploadIds.map(u => u.id) }, organizationId: actor.organizationId, deletedAt: null }, select: { id: true } })).map(u => u.id));
    for (const u of uploadIds) if (!found.has(u.id)) issues.push(issue(u.at, `Upload ${u.id} does not exist or was deleted.`, 'not_found'));
  }
  if (issues.length) throw validation(issues, `Validation failed: ${issues[0].message}`);
  return { trigger, steps };
}

// ───────────────────────────── flows ─────────────────────────────

async function withVersions<T extends { draftVersionId: string | null; publishedVersionId: string | null }>(f: T) {
  const ids = [f.draftVersionId, f.publishedVersionId].filter(Boolean) as string[];
  return { ...f, versions: ids.length ? await prisma.automationFlowVersion.findMany({ where: { id: { in: ids } } }) : [] };
}

async function flowOf(actor: Actor, id: string) {
  const f = await prisma.automationFlow.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null } });
  if (!f) throw notFound('Automation flow');
  return f;
}

const shapeOf = async (id: string) => flowShape(await withVersions(await prisma.automationFlow.findUniqueOrThrow({ where: { id } })));

/** Save a definition into the flow's draft: edit the draft in place, or start a new draft after a publish. */
async function saveDraft(flowId: string, def: Definition) {
  const f = await prisma.automationFlow.findUniqueOrThrow({ where: { id: flowId } });
  const draft = f.draftVersionId ? await prisma.automationFlowVersion.findUnique({ where: { id: f.draftVersionId } }) : null;
  if (draft && !draft.publishedAt && draft.id !== f.publishedVersionId) {
    await prisma.automationFlowVersion.update({ where: { id: draft.id }, data: { definition: def as object } });
    return draft.id;
  }
  const max = await prisma.automationFlowVersion.aggregate({ where: { flowId }, _max: { version: true } });
  const v = await prisma.automationFlowVersion.create({ data: { flowId, version: (max._max.version ?? 0) + 1, definition: def as object } });
  await prisma.automationFlow.update({ where: { id: flowId }, data: { draftVersionId: v.id } });
  return v.id;
}

async function cancelQueued(flowId: string, reason: string) {
  const rows = await prisma.automationExecution.findMany({ where: { flowId, status: 'QUEUED' }, select: { id: true, socialAccountId: true, isTest: true } });
  for (const r of rows) {
    const n = await prisma.automationExecution.updateMany({ where: { id: r.id, status: 'QUEUED' }, data: { status: 'CANCELED', completedAt: new Date(), error: { code: 'CANCELED', message: reason, retryable: false } } });
    if (n.count && !r.isTest) await refundRun(r.socialAccountId);
  }
}

async function refundRun(socialAccountId: string) {
  const a = await prisma.socialAccount.findUnique({ where: { id: socialAccountId } });
  if (a) await releaseAccountMonth(prisma, accountKey(a.type, a.providerPageId, a.id), 'automationRuns');
}

// ───────────────────────────── trigger matching ─────────────────────────────

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function keywordHit(text: string, kw: string, caseSensitive: boolean) {
  // Whole words for word-like keywords ("hi" does not match "this"); plain substring otherwise.
  if (/^[\p{L}\p{N}_ '-]+$/u.test(kw)) return new RegExp(`(^|[^\\p{L}\\p{N}_])${esc(kw)}($|[^\\p{L}\\p{N}_])`, caseSensitive ? 'u' : 'iu').test(text);
  return caseSensitive ? text.includes(kw) : text.toLowerCase().includes(kw.toLowerCase());
}

export function triggerMatches(t: Record<string, any>, e: Pick<TriggerEvent, 'type' | 'platform' | 'socialAccountId' | 'text' | 'payload' | 'senderExternalId' | 'postId' | 'importedPostId' | 'externalPostId'>) {
  if (t.type !== e.type || t.platform !== e.platform || t.socialAccountId !== e.socialAccountId) return false;
  const kws: string[] = (t.keywords ?? []).filter(Boolean);
  if (kws.length) {
    const text = e.text ?? '';
    const hits = kws.map(k => keywordHit(text, k, !!t.caseSensitive));
    if ((t.matchMode ?? 'ANY') === 'ALL' ? !hits.every(Boolean) : !hits.some(Boolean)) return false;
  }
  if (t.senderExternalIds?.length && !t.senderExternalIds.includes(e.senderExternalId ?? '')) return false;
  if (t.payloads?.length && (e.type === 'QUICK_REPLY_CLICKED' || e.type === 'BUTTON_CLICKED') && !t.payloads.includes(e.payload ?? '')) return false;
  if (t.postId && e.type === 'COMMENT_CREATED' && ![e.postId, e.importedPostId, e.externalPostId].includes(t.postId)) return false;
  return true;
}

/** Called by the webhook ingestion for every new inbound message / comment. Returns created execution ids. */
export async function dispatchTriggers(e: TriggerEvent) {
  const flows = await prisma.automationFlow.findMany({ where: { teamId: e.teamId, status: 'ACTIVE', deletedAt: null, publishedVersionId: { not: null } } });
  if (!flows.length) return [];
  const versions = await prisma.automationFlowVersion.findMany({ where: { id: { in: flows.map(f => f.publishedVersionId!) } } });
  const out: string[] = [];
  for (const f of flows) {
    const v = versions.find(x => x.id === f.publishedVersionId);
    const def = defOf(v);
    if (!def || !scopeAllows(f.platformScope, e.platform) || !triggerMatches(def.trigger, e)) continue;
    const id = await createExecution({ flowId: f.id, teamId: f.teamId, organizationId: e.organizationId, versionId: v!.id, trigger: def.trigger, isTest: false, idempotencyKey: `${f.id}:${e.eventKey}`, input: inputOf(e), delaySeconds: def.trigger.actionDelaySeconds ?? 0 });
    if (id) out.push(id);
  }
  return out;
}

const inputOf = (e: Partial<TriggerEvent> & { type: TriggerType }) => ({
  type: e.type, platform: e.platform ?? null, socialAccountId: e.socialAccountId ?? null, postId: e.postId ?? null, conversationId: e.conversationId ?? null,
  conversationMessageId: e.conversationMessageId ?? null, fetchedCommentId: e.fetchedCommentId ?? null, senderExternalId: e.senderExternalId ?? null,
  externalMessageId: e.externalMessageId ?? null, text: e.text ?? null, payload: e.payload ?? null,
});

interface NewExecution {
  flowId: string; teamId: string; organizationId: string; versionId: string; trigger: Record<string, any>; isTest: boolean;
  idempotencyKey: string; input: ReturnType<typeof inputOf>; delaySeconds: number;
}

/**
 * Record an execution (idempotent on idempotencyKey) and consume the per-account monthly run quota in
 * the same transaction. Over quota → the execution is stored as SKIPPED with the reason.
 */
async function createExecution(n: NewExecution): Promise<string | null> {
  if (await prisma.automationExecution.findUnique({ where: { idempotencyKey: n.idempotencyKey }, select: { id: true } })) return null;
  const socialAccountId = n.input.socialAccountId ?? n.trigger.socialAccountId;
  const account = await prisma.socialAccount.findUnique({ where: { id: socialAccountId } });
  if (!account) return null;
  const dueAt = new Date(Date.now() + Math.max(0, n.delaySeconds) * 1000);
  let row;
  try {
    row = await prisma.$transaction(async tx => {
      let skipped: { code: string; message: string; retryable: boolean } | null = null;
      if (!n.isTest) {
        const org = await tx.organization.findUniqueOrThrow({ where: { id: n.organizationId } });
        try { await consumeAccountMonth(tx, accountKey(account.type, account.providerPageId, account.id), 'automationRuns', 1, limitsFor(org).automationRunsPerAccount, 'Monthly automation run'); }
        catch (err) { if (err instanceof AppError) skipped = { code: 'QUOTA_EXCEEDED', message: err.message, retryable: false }; else throw err; }
      }
      return tx.automationExecution.create({
        data: {
          teamId: n.teamId, organizationId: n.organizationId, flowId: n.flowId, flowVersionId: n.versionId, triggerId: n.trigger.id ?? null, platform: account.type,
          socialAccountId: account.id, conversationId: n.input.conversationId, conversationMessageId: n.input.conversationMessageId, fetchedCommentId: n.input.fetchedCommentId,
          senderExternalId: n.input.senderExternalId, status: skipped ? 'SKIPPED' : 'QUEUED', idempotencyKey: n.idempotencyKey, input: n.input, isTest: n.isTest,
          output: { scheduledFor: dueAt.toISOString() }, error: skipped ?? undefined, completedAt: skipped ? new Date() : null,
        },
      });
    });
  } catch (err) {
    if ((err as any)?.code === 'P2002') return null; // the same event raced in twice
    throw err;
  }
  if (row.status === 'QUEUED' && !n.isTest) await scheduleExecution(row.id, dueAt);
  return row.id;
}

async function scheduleExecution(id: string, dueAt: Date) {
  const queued = await enqueue(JOBS.runAutomation, { kind: 'execute', executionId: id }, { singletonKey: `auto:${id}`, startAfter: dueAt.getTime() > Date.now() + 1000 ? dueAt : undefined, retryLimit: 0 });
  // No queue (tests/scripts) or a failed enqueue: run in-process when due.
  if (!queued) setTimeout(() => void runExecution(id).catch(err => logger.error({ err, id }, 'automation run failed')), Math.max(0, dueAt.getTime() - Date.now()));
}

/** Safety net for executions whose job was lost (restart between insert and enqueue). */
export async function kickStaleExecutions() {
  const rows = await prisma.automationExecution.findMany({ where: { status: 'QUEUED', isTest: false, createdAt: { lt: new Date(Date.now() - 2 * 60_000) } }, select: { id: true, output: true }, take: 200 });
  for (const r of rows) {
    const due = new Date((r.output as any)?.scheduledFor ?? 0);
    if (due.getTime() < Date.now() - 60_000) await enqueue(JOBS.runAutomation, { kind: 'execute', executionId: r.id }, { singletonKey: `auto:${r.id}:sweep`, retryLimit: 0 });
  }
}

// ───────────────────────────── the engine ─────────────────────────────

interface StepLog {
  id: string; executionId: string; stepId: string | null; type?: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'; attemptCount: number;
  input: Record<string, unknown>; output: Record<string, unknown>; error: { code: string; message: string; retryable: boolean } | null;
  startedAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string;
}

class StepFailure extends Error { constructor(readonly code: string, message: string, readonly retryable = false) { super(message); } }

function errorOf(err: unknown) {
  if (err instanceof StepFailure) return { code: err.code, message: err.message, retryable: err.retryable };
  if (isNetworkError(err)) return { code: err.code, message: err.message, retryable: err.retryability === 'retryable' };
  if (err instanceof AppError) return { code: err.statusCode === 403 ? 'NOT_ALLOWED' : err.statusCode === 409 ? 'CONFLICT' : err.statusCode === 404 ? 'NOT_FOUND' : 'REJECTED', message: err.message, retryable: false };
  return { code: 'INTERNAL', message: (err as Error)?.message ?? String(err), retryable: false };
}

function conditionHolds(c: Record<string, any>, input: Record<string, any>) {
  const field = c.field === 'TEXT' ? input.text : c.field === 'PAYLOAD' ? input.payload : c.field === 'PLATFORM' ? input.platform : input.senderExternalId;
  const norm = (s: string) => (c.caseSensitive ? s : s.toLowerCase());
  const v = norm(String(field ?? ''));
  const want = norm(String(c.value));
  if (c.operator === 'EQUALS') return v === want;
  if (c.operator === 'CONTAINS') return v.includes(want);
  // MATCHES_ANY: value is a comma/newline separated list; any entry contained in the field.
  return want.split(/[,\n]/).map(s => s.trim()).filter(Boolean).some(w => v.includes(w));
}

/** Upload ids in a rich message → MediaRefs + a wire carousel with image URLs. */
async function richContent(orgId: string, m: Record<string, any>) {
  const media = await uploadMedia(orgId, m.attachments ?? []);
  let carousel: any = null;
  if (m.carousel?.cards?.length) {
    const ids = m.carousel.cards.map((c: any) => c.imageUploadId).filter(Boolean);
    const ups = ids.length ? await prisma.upload.findMany({ where: { id: { in: ids }, organizationId: orgId, deletedAt: null } }) : [];
    carousel = { cards: m.carousel.cards.map(({ imageUploadId, ...c }: any) => { const u = ups.find(x => x.id === imageUploadId); return { ...c, imageUrl: u?.path ? mediaRef(u).url : null }; }) };
  }
  const attachments = media.map((x, i) => ({ type: m.attachments[i].type, url: x.url, externalId: null, mimeType: x.mime, name: null }));
  return { text: m.text ?? null, media, attachments, quickReplies: m.quickReplies, buttons: m.buttons, carousel };
}

/** Run one execution. Safe to call twice: only the caller that flips QUEUED → RUNNING proceeds. */
export async function runExecution(id: string) {
  const claimed = await prisma.automationExecution.updateMany({ where: { id, status: 'QUEUED' }, data: { status: 'RUNNING', startedAt: new Date() } });
  if (!claimed.count) return 'skipped';
  const ex = await prisma.automationExecution.findUniqueOrThrow({ where: { id } });
  const f = await prisma.automationFlow.findUniqueOrThrow({ where: { id: ex.flowId } });
  const finish = async (status: 'COMPLETED' | 'FAILED' | 'CANCELED', data: Record<string, unknown>) => {
    await prisma.automationExecution.update({ where: { id }, data: { status, completedAt: new Date(), ...data } });
    return status;
  };
  if (!ex.isTest && (f.status !== 'ACTIVE' || f.deletedAt)) {
    await refundRun(ex.socialAccountId);
    return finish('CANCELED', { error: { code: 'FLOW_NOT_ACTIVE', message: `The flow is ${f.deletedAt ? 'deleted' : f.status.toLowerCase()}, so this run was canceled.`, retryable: false } });
  }
  const def = defOf(await prisma.automationFlowVersion.findUnique({ where: { id: ex.flowVersionId } }));
  if (!def) return finish('FAILED', { error: { code: 'NO_DEFINITION', message: 'The flow version has no definition.', retryable: false } });

  const input = (ex.input ?? {}) as Record<string, any>;
  const orgId = ex.organizationId ?? f.organizationId!;
  const state = { conversationId: ex.conversationId as string | null, fetchedCommentId: ex.fetchedCommentId as string | null, messagesSent: 0 };
  const logs: StepLog[] = [];
  const now = () => new Date().toISOString();
  const save = (currentStepId: string | null) => prisma.automationExecution.update({ where: { id }, data: { steps: logs as object[], currentStepId, conversationId: state.conversationId } });
  const marker = { automationExecutionId: id, automationFlowId: f.id };
  let stopped: string | null = null;

  for (const step of def.steps) {
    const log: StepLog = { id: randomUUID(), executionId: id, stepId: step.id ?? null, type: step.type, status: 'RUNNING', attemptCount: 1, input, output: {}, error: null, startedAt: now(), completedAt: null, createdAt: now(), updatedAt: now() };
    logs.push(log);
    if (stopped) { Object.assign(log, { status: 'SKIPPED', startedAt: null, output: { reason: stopped } }); continue; }
    await save(step.id ?? null);
    try {
      log.output = await runStep(step, { ex, orgId, input, state, marker });
      log.status = 'COMPLETED';
      if (step.type === 'CONDITION' && log.output.matched === false) stopped = 'CONDITION_NOT_MET';
    } catch (err) {
      log.status = 'FAILED'; log.error = errorOf(err);
      log.completedAt = log.updatedAt = now();
      await save(step.id ?? null);
      return finish('FAILED', { error: log.error, output: { scheduledFor: (ex.output as any)?.scheduledFor ?? null, failedStepId: step.id ?? null, messagesSent: state.messagesSent } });
    }
    log.completedAt = log.updatedAt = now();
  }
  await save(null);
  return finish('COMPLETED', { output: { scheduledFor: (ex.output as any)?.scheduledFor ?? null, messagesSent: state.messagesSent, ...(stopped ? { stoppedBy: stopped } : {}) } });
}

interface StepCtx { ex: { id: string; socialAccountId: string; teamId: string }; orgId: string; input: Record<string, any>; state: { conversationId: string | null; fetchedCommentId: string | null; messagesSent: number }; marker: Record<string, string> }

async function runStep(step: Record<string, any>, c: StepCtx): Promise<Record<string, unknown>> {
  const conv = async () => {
    if (!c.state.conversationId) throw new StepFailure('NO_CONVERSATION', `${step.type} needs a conversation, and this trigger has none.`);
    const row = await prisma.conversation.findFirst({ where: { id: c.state.conversationId, teamId: c.ex.teamId } });
    if (!row) throw new StepFailure('NO_CONVERSATION', 'The conversation no longer exists.');
    return row;
  };
  const comment = async () => {
    if (!c.state.fetchedCommentId) throw new StepFailure('NO_COMMENT', `${step.type} needs a comment, and this trigger has none.`);
    const row = await prisma.fetchedComment.findFirst({ where: { id: c.state.fetchedCommentId, teamId: c.ex.teamId, deletedAt: null } });
    if (!row) throw new StepFailure('NO_COMMENT', 'The comment no longer exists.');
    return row;
  };
  switch (step.type) {
    case 'CONDITION': {
      const results = (step.conditions ?? []).map((x: any) => ({ id: x.id ?? null, field: x.field, operator: x.operator, matched: conditionHolds(x, c.input) }));
      return { matched: results.every((r: any) => r.matched), conditions: results };
    }
    case 'SEND_MESSAGE': {
      const content = await richContent(c.orgId, step.message ?? {});
      const r = await sendToConversation(await conv(), content, { source: 'DM', consumeQuota: false, platformData: c.marker });
      c.state.messagesSent++;
      return { conversationId: r.conversation.id, messageId: r.message.id, externalMessageId: r.message.externalMessageId };
    }
    case 'SEND_PRIVATE_REPLY': {
      const content = await richContent(c.orgId, step.message ?? {});
      if (!content.text) throw new StepFailure('INVALID_STEP', 'A private reply needs text.');
      const r = await sendPrivateReply(await comment(), { text: content.text, carousel: content.carousel }, { source: 'PRIVATE_REPLY', consumeQuota: false, platformData: c.marker });
      c.state.conversationId = r.conversation.id;
      c.state.messagesSent++;
      return { conversationId: r.conversation.id, messageId: r.message.id, externalMessageId: r.message.externalMessageId };
    }
    case 'SEND_PUBLIC_COMMENT_REPLY': {
      const cm = await comment();
      const ad = adapter(cm.platform as NetworkType);
      if (!ad.comment) throw new StepFailure('NOT_SUPPORTED', `${ad.displayName} comment replies are not available on this server yet.`);
      if (!cm.externalPostId) throw new StepFailure('NO_COMMENT', 'The comment has no post id, so it cannot be replied to.');
      const r = await ad.comment(networkContext(cm.platform as NetworkType), { account: await loadAccount(cm.socialAccountId), externalPostId: cm.externalPostId, parentExternalId: cm.externalId, text: step.text, media: [], data: {} });
      await prisma.fetchedComment.update({ where: { id: cm.id }, data: { repliesCount: { increment: 1 } } });
      return { externalCommentId: r.externalId, permalink: r.permalink ?? null };
    }
    case 'LIKE_COMMENT': {
      const cm = await comment();
      const ad = adapter(cm.platform as NetworkType);
      if (!ad.commentAction) throw new StepFailure('NOT_SUPPORTED', `${ad.displayName} comment likes are not available on this server yet.`);
      await ad.commentAction(networkContext(cm.platform as NetworkType), await loadAccount(cm.socialAccountId), { externalId: cm.externalId, externalPostId: cm.externalPostId }, 'LIKE');
      await prisma.fetchedComment.update({ where: { id: cm.id }, data: { liked: true, platformData: { ...((cm.platformData as object) ?? {}), likedByMe: true, likedByAutomation: true } } });
      return { liked: true };
    }
    case 'ARCHIVE_CONVERSATION':
    case 'OPEN_CONVERSATION': {
      const r = await setConversationStatus(await conv(), step.type === 'ARCHIVE_CONVERSATION' ? 'ARCHIVED' : 'OPEN');
      return { conversationId: r.id, status: r.status };
    }
    default:
      throw new StepFailure('INVALID_STEP', `Unknown step type ${step.type}.`);
  }
}

async function executionShape(e: any) {
  const [f, v, conversation, message, comment, account] = await Promise.all([
    prisma.automationFlow.findUnique({ where: { id: e.flowId } }).then(x => (x ? withVersions(x) : null)),
    prisma.automationFlowVersion.findUnique({ where: { id: e.flowVersionId } }),
    e.conversationId ? prisma.conversation.findUnique({ where: { id: e.conversationId }, include: { socialAccount: true } }) : null,
    e.conversationMessageId ? prisma.conversationMessage.findUnique({ where: { id: e.conversationMessageId } }) : null,
    e.fetchedCommentId ? prisma.fetchedComment.findUnique({ where: { id: e.fetchedCommentId } }) : null,
    prisma.socialAccount.findUnique({ where: { id: e.socialAccountId } }),
  ]);
  return execution(e, { flow: f, version: v, conversation, message, comment, account });
}

// ───────────────────────────── handlers ─────────────────────────────

define({
  'automation.getFlows': async ({ actor, query }) => {
    await gate(actor);
    await teamIn(actor, query.teamId);
    const p = pageArgs(query);
    const where: any = {
      teamId: query.teamId, organizationId: actor.organizationId, deletedAt: null,
      ...(query.status ? { status: query.status } : {}), ...(query.platformScope ? { platformScope: query.platformScope } : {}),
      ...(query.socialAccountId ? { versions: { some: { definition: { path: ['trigger', 'socialAccountId'], equals: query.socialAccountId } } } } : {}),
    };
    const [rows, total] = await Promise.all([prisma.automationFlow.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: p.skip, take: p.take }), prisma.automationFlow.count({ where })]);
    return listOf(await Promise.all(rows.map(async f => flowShape(await withVersions(f)))), total);
  },

  'automation.createFlow': async ({ actor, body }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    await teamIn(actor, body.teamId);
    const def = body.definition ? await normalizeDefinition(actor, body.teamId, body.platformScope, body.definition) : null;
    const f = await prisma.automationFlow.create({ data: { teamId: body.teamId, organizationId: actor.organizationId, name: body.name, platformScope: body.platformScope, status: 'DRAFT', createdByUserId: actor.userId ?? null } });
    if (def) await saveDraft(f.id, def);
    return shapeOf(f.id);
  },

  'automation.copyFlows': async ({ actor, body }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    await teamIn(actor, body.sourceTeamId);
    await teamIn(actor, body.targetTeamId);
    const sources = await prisma.automationFlow.findMany({ where: { teamId: body.sourceTeamId, organizationId: actor.organizationId, deletedAt: null, ...(body.flowId ? { id: body.flowId } : {}) }, orderBy: { createdAt: 'asc' } });
    if (body.flowId && !sources.length) throw notFound('Automation flow');
    const targetAccounts = await prisma.socialAccount.findMany({ where: { teamId: body.targetTeamId, deletedAt: null } });
    const out = [];
    for (const s of sources) {
      const src = await withVersions(s);
      const def = defOf(src.versions.find(v => v.id === s.draftVersionId) ?? src.versions.find(v => v.id === s.publishedVersionId));
      const f = await prisma.automationFlow.create({ data: { teamId: body.targetTeamId, organizationId: actor.organizationId, name: s.name, platformScope: s.platformScope, status: 'DRAFT', createdByUserId: actor.userId ?? null } });
      if (def) {
        // Point the trigger at the target team's account of the same network (when it has one).
        const acc = targetAccounts.find(a => a.type === def.trigger.platform);
        await saveDraft(f.id, { trigger: { ...def.trigger, id: randomUUID(), socialAccountId: acc?.id ?? def.trigger.socialAccountId }, steps: def.steps });
      }
      out.push(await shapeOf(f.id));
    }
    return listOf(out, out.length);
  },

  'automation.getFlow': async ({ actor, params }) => { await gate(actor); return shapeOf((await flowOf(actor, params.id)).id); },

  'automation.updateFlow': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    const f = await flowOf(actor, params.id);
    if (f.status === 'ARCHIVED') throw conflict('Archived flows are read-only. Copy the flow to edit it.');
    const scope = body.platformScope ?? f.platformScope;
    if (body.definition) await saveDraft(f.id, await normalizeDefinition(actor, f.teamId, scope, body.definition));
    else if (body.platformScope && body.platformScope !== f.platformScope) {
      const def = defOf((await withVersions(f)).versions.find(v => v.id === f.draftVersionId));
      if (def && !scopeAllows(scope, def.trigger.platform)) throw badRequest(`The draft's trigger is ${def.trigger.platform}, which is outside platformScope ${scope}.`, [issue(['platformScope'], 'Does not cover the trigger platform')]);
    }
    await prisma.automationFlow.update({ where: { id: f.id }, data: { ...(body.name ? { name: body.name } : {}), ...(body.platformScope ? { platformScope: body.platformScope } : {}) } });
    return shapeOf(f.id);
  },

  'automation.deleteFlow': async ({ actor, params }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    const f = await flowOf(actor, params.id);
    await prisma.automationFlow.update({ where: { id: f.id }, data: { deletedAt: new Date(), status: f.status === 'ACTIVE' ? 'PAUSED' : f.status } });
    await cancelQueued(f.id, 'The flow was deleted.');
    return shapeOf(f.id);
  },

  'automation.publishFlow': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'automationRuns');
    const f = await flowOf(actor, params.id);
    if (f.status === 'ARCHIVED') throw conflict('Archived flows cannot be published. Copy the flow instead.');
    if (body?.definition) await saveDraft(f.id, await normalizeDefinition(actor, f.teamId, f.platformScope, body.definition));
    const fresh = await withVersions(await prisma.automationFlow.findUniqueOrThrow({ where: { id: f.id } }));
    const draft = defOf(fresh.versions.find(v => v.id === fresh.draftVersionId));
    if (!draft) throw badRequest('The flow has no draft to publish. Save a definition (trigger and steps) first.');
    // Re-check against today's team (accounts may have been disconnected since the draft was saved).
    const def = await normalizeDefinition(actor, f.teamId, f.platformScope, draft);
    if (!def.steps.length) throw badRequest('A flow needs at least one step before it can be published.', [issue(['definition', 'steps'], 'At least one step is required', 'required')]);
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'flow-publish:' + f.id}))`;
      const max = await tx.automationFlowVersion.aggregate({ where: { flowId: f.id }, _max: { version: true } });
      const v = await tx.automationFlowVersion.create({ data: { flowId: f.id, version: (max._max.version ?? 0) + 1, definition: { ...def, [META_KEY]: { publishedByUserId: actor.userId ?? null, fromVersionId: fresh.draftVersionId } } as object, publishedAt: new Date() } });
      await tx.automationFlow.update({ where: { id: f.id }, data: { publishedVersionId: v.id, status: f.status === 'DRAFT' ? 'ACTIVE' : f.status } });
    });
    return shapeOf(f.id);
  },

  'automation.pauseFlow': async ({ actor, params }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    const f = await flowOf(actor, params.id);
    if (f.status === 'ARCHIVED') throw conflict('Archived flows cannot be paused.');
    await prisma.automationFlow.update({ where: { id: f.id }, data: { status: 'PAUSED' } });
    await cancelQueued(f.id, 'The flow was paused.');
    return shapeOf(f.id);
  },

  'automation.activateFlow': async ({ actor, params }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'automationRuns');
    const f = await flowOf(actor, params.id);
    if (!f.publishedVersionId) throw conflict('Publish the flow before activating it.');
    await prisma.automationFlow.update({ where: { id: f.id }, data: { status: 'ACTIVE' } });
    return shapeOf(f.id);
  },

  'automation.archiveFlow': async ({ actor, params }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    const f = await flowOf(actor, params.id);
    await prisma.automationFlow.update({ where: { id: f.id }, data: { status: 'ARCHIVED' } });
    await cancelQueued(f.id, 'The flow was archived.');
    return shapeOf(f.id);
  },

  'automation.getFlowExecutions': async ({ actor, params, query }) => {
    await gate(actor);
    const f = await flowOf(actor, params.id);
    if (query.teamId !== f.teamId) throw notFound('Automation flow');
    const p = pageArgs(query);
    const where: any = { flowId: f.id };
    for (const k of ['flowVersionId', 'triggerId', 'socialAccountId', 'platform', 'status', 'conversationId', 'fetchedCommentId']) if (query[k]) where[k] = query[k];
    const [rows, total] = await Promise.all([
      prisma.automationExecution.findMany({ where: { ...where, ...before('createdAt', p.cursor) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: p.skip, take: p.take + 1 }),
      prisma.automationExecution.count({ where }),
    ]);
    const more = rows.length > p.take;
    const items = rows.slice(0, p.take);
    const last = items[items.length - 1];
    return { ...listOf(await Promise.all(items.map(executionShape)), total), nextCursor: more && last ? encodeCursor(last.createdAt, last.id) : null };
  },

  'automation.getExecution': async ({ actor, params }) => {
    await gate(actor);
    const e = await prisma.automationExecution.findFirst({ where: { id: params.id, organizationId: actor.organizationId } });
    if (!e) throw notFound('Automation execution');
    return executionShape(e);
  },

  'automation.testFlow': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'automationRuns');
    const f = await withVersions(await flowOf(actor, params.id));
    const version = f.versions.find(v => v.id === f.draftVersionId) ?? f.versions.find(v => v.id === f.publishedVersionId);
    const def = defOf(version);
    if (!version || !def) throw badRequest('The flow has no definition to test. Save a trigger and steps first.');
    const i = (body?.input ?? {}) as Record<string, any>;
    const socialAccountId = i.socialAccountId ?? def.trigger.socialAccountId;
    const account = await socialAccountIn(actor, socialAccountId, f.teamId);
    if (i.conversationId) { const cv = await conversationOf(actor, i.conversationId); if (cv.teamId !== f.teamId) throw notFound('Conversation'); }
    if (i.fetchedCommentId && !(await prisma.fetchedComment.findFirst({ where: { id: i.fetchedCommentId, teamId: f.teamId } }))) throw notFound('Comment');
    if (i.conversationMessageId && !(await prisma.conversationMessage.findFirst({ where: { id: i.conversationMessageId, teamId: f.teamId } }))) throw notFound('Message');
    const input = inputOf({ ...i, type: i.type ?? 'MANUAL_TEST', platform: i.platform ?? account.type, socialAccountId: account.id });
    const id = await createExecution({ flowId: f.id, teamId: f.teamId, organizationId: actor.organizationId, versionId: version.id, trigger: def.trigger, isTest: true, idempotencyKey: `test:${f.id}:${randomUUID()}`, input, delaySeconds: 0 });
    await runExecution(id!);
    return executionShape(await prisma.automationExecution.findUniqueOrThrow({ where: { id: id! } }));
  },

  'automation.getProviderSettings': async ({ actor, query }) => {
    await gate(actor);
    await teamIn(actor, query.teamId);
    const p = pageArgs(query);
    const where: any = { teamId: query.teamId };
    for (const k of ['platform', 'socialAccountId', 'type', 'status']) if (query[k]) where[k] = query[k];
    const [rows, total] = await Promise.all([prisma.automationProviderSetting.findMany({ where, include: { socialAccount: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: p.skip, take: p.take }), prisma.automationProviderSetting.count({ where })]);
    return listOf(rows.map(providerSetting), total);
  },

  'automation.upsertProviderSetting': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    await teamIn(actor, body.teamId);
    const a = await socialAccountIn(actor, params.socialAccountId, body.teamId);
    const need = params.type === 'FACEBOOK_PERSISTENT_MENU' ? 'FACEBOOK' : 'INSTAGRAM';
    if (a.type !== need) throw badRequest(`${params.type} is only available for ${need} accounts; this is a ${a.type} account.`, [issue(['type'], 'Wrong network for this setting')]);
    if (body.platform !== a.type) throw badRequest(`platform ${body.platform} does not match the account (${a.type}).`, [issue(['platform'], 'Does not match the account')]);
    const config = body.config ?? {};
    if (params.type === 'FACEBOOK_PERSISTENT_MENU' && (config as any).iceBreakers) throw badRequest('A persistent menu takes items, not iceBreakers.', [issue(['config'], 'Wrong config shape')]);
    if (params.type === 'INSTAGRAM_ICE_BREAKERS' && ((config as any).items || (config as any).getStartedPayload)) throw badRequest('Ice breakers take iceBreakers, not menu items.', [issue(['config'], 'Wrong config shape')]);
    const row = await prisma.automationProviderSetting.upsert({
      where: { socialAccountId_type: { socialAccountId: a.id, type: params.type } },
      update: { config, status: body.status ?? 'DRAFT' },
      create: { teamId: a.teamId, organizationId: actor.organizationId, platform: a.type, socialAccountId: a.id, type: params.type, config, status: body.status ?? 'DRAFT' },
      include: { socialAccount: true },
    });
    return providerSetting(row);
  },

  'automation.syncProviderSetting': async ({ actor, params }) => {
    requirePermission(actor, 'content');
    await gate(actor);
    const s = await prisma.automationProviderSetting.findFirst({ where: { id: params.id, socialAccount: { team: { organizationId: actor.organizationId } } }, include: { socialAccount: true } });
    if (!s) throw notFound('Provider setting');
    if (s.socialAccount.deletedAt || s.socialAccount.state !== 'CONNECTED') throw new AppError(409, 'Reconnect this account before syncing its settings.');
    const m = messagingOf(s.platform);
    let row;
    try {
      // DISABLED removes the menu / ice breakers on the network (config null).
      const res = await m.syncProviderSetting(networkContext(s.platform as NetworkType), await loadAccount(s.socialAccountId), { type: s.type, config: s.status === 'DISABLED' ? null : s.config });
      row = await prisma.automationProviderSetting.update({ where: { id: s.id }, data: { status: s.status === 'DISABLED' ? 'DISABLED' : 'SYNCED', providerResponse: res == null ? Prisma.DbNull : (res as object), lastSyncedAt: new Date(), lastSyncError: Prisma.DbNull }, include: { socialAccount: true } });
    } catch (err) {
      if (!isNetworkError(err)) throw err;
      row = await prisma.automationProviderSetting.update({ where: { id: s.id }, data: { status: 'SYNC_FAILED', lastSyncError: { code: err.code, message: err.message, retryable: err.retryability === 'retryable' } }, include: { socialAccount: true } });
    }
    return providerSetting(row);
  },

  'automation.sendRichMessage': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'dms');
    const conv = await conversationOf(actor, params.conversationId);
    if (body.teamId && body.teamId !== conv.teamId) throw notFound('Conversation');
    if (!isMessagingType(conv.platform)) throw badRequest('Rich messages are only available for Instagram and Facebook conversations.');
    const content = await richContent(actor.organizationId, body.message ?? {});
    const r = await sendToConversation(conv, content, { source: actor.kind === 'API_KEY' ? 'API' : 'DM', consumeQuota: true }).catch(err => (isNetworkError(err) ? networkFailure(err) : Promise.reject(err)));
    return { conversationId: r.conversation.id, messageId: r.message.id, externalMessageId: r.message.externalMessageId ?? null };
  },
});

export const _test = { keywordHit, conditionHolds };
