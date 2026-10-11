#!/usr/bin/env node
/**
 * siar — JSON-first CLI for the Siar API. JSON on stdout, status on stderr, no prompts.
 * Exit codes: 0 ok · 2 usage · 3 auth · 4 not found · 5 validation · 6 rate limited · 7 server/network.
 */
import { Siar, SiarError, composePost, type OperationId } from '@siar/sdk';
import { parseArgs, UsageError, type FlagSpec } from './args.js';
import { readFile } from 'node:fs/promises';

const out = (v: unknown) => process.stdout.write(JSON.stringify(v, null, 2) + '\n');
const log = (s: string) => process.stderr.write(s + '\n');
const COMMON: FlagSpec = { 'api-key': 'string', 'base-url': 'string', help: 'boolean' };

type Cmd = { help: string; flags?: FlagSpec; run: (s: Siar, f: Record<string, any>, p: string[]) => Promise<unknown> };
const need = (f: Record<string, any>, k: string) => { if (f[k] === undefined || f[k] === '') throw new UsageError(`--${k} is required.`); return f[k]; };
const json = async (v?: string) => (v ? JSON.parse(v.startsWith('@') ? await readFile(v.slice(1), 'utf8') : v) : undefined);
const call = (s: Siar, id: OperationId, args: { body?: unknown; query?: object; path?: object } = {}) => s.request(id, args as any);

const CMDS: Record<string, Cmd> = {
  'teams:list': { help: 'List teams', run: s => call(s, 'team.getList', { query: { limit: 100 } }) },
  'teams:create': { help: 'Create a team: --name', flags: { name: 'string' }, run: (s, f) => call(s, 'team.createTeam', { body: { name: need(f, 'name') } }) },
  'teams:get': { help: 'Get a team: <id>', run: (s, _f, p) => call(s, 'team.getTeam', { path: { id: p[0] ?? need({}, 'id') } }) },
  'teams:delete': { help: 'Delete a team: <id>', run: (s, _f, p) => call(s, 'team.deleteTeam', { path: { id: p[0] } }) },
  'accounts:list': { help: 'Connected accounts of a team: --team', flags: { team: 'string' }, run: async (s, f) => ((await call(s, 'team.getTeam', { path: { id: need(f, 'team') } })) as any).socialAccounts },
  'accounts:connect': { help: 'Print an OAuth URL: --team --network --redirect [--server]', flags: { team: 'string', network: 'string', redirect: 'string', server: 'string' },
    run: (s, f) => call(s, 'socialAccount.connect', { body: { teamId: need(f, 'team'), type: String(need(f, 'network')).toUpperCase(), redirectUrl: need(f, 'redirect'), ...(f.server ? { serverUrl: f.server } : {}) } }) },
  'uploads:create': { help: 'Upload a file or URL: <path|url> [--team]', flags: { team: 'string' },
    run: (s, f, p) => { const src = p[0] ?? need({}, 'path'); return /^https?:\/\//.test(src) ? s.uploads.fromUrl(src, { teamId: f.team }) : s.uploads.fromFile(src, { teamId: f.team }); } },
  'posts:create': {
    help: 'Create a post: --team --networks A,B (--text) (--media file…) (--at ISO | --now | --draft) [--title --reference-key --data @file.json --first-comment]',
    flags: { team: 'string', networks: 'string', text: 'string', media: 'multi', at: 'string', now: 'boolean', draft: 'boolean', title: 'string', 'reference-key': 'string', data: 'string', 'first-comment': 'string' },
    run: async (s, f) => {
      const uploadIds: string[] = [];
      for (const m of (f.media as string[] | undefined) ?? []) { log(`uploading ${m}`); const u: any = /^https?:\/\//.test(m) ? await s.uploads.fromUrl(m, { teamId: f.team }) : await s.uploads.fromFile(m, { teamId: f.team }); uploadIds.push(u.id); }
      const body: any = composePost({ teamId: need(f, 'team'), networks: need(f, 'networks'), text: f.text, uploadIds, at: f.at, now: f.now, draft: f.draft, title: f.title, referenceKey: f['reference-key'], data: await json(f.data) });
      if (f['first-comment']) body.firstComment = Object.fromEntries(body.socialAccountTypes.map((t: string) => [t, f['first-comment']]));
      return call(s, 'post.create', { body });
    },
  },
  'posts:list': { help: 'List posts: --team [--status --limit]', flags: { team: 'string', status: 'string', limit: 'number' }, run: (s, f) => call(s, 'post.getList', { query: { teamId: need(f, 'team'), status: f.status, limit: f.limit ?? 20 } }) },
  'posts:get': { help: 'Get a post: <id>', run: (s, _f, p) => call(s, 'post.get', { path: { id: p[0] } }) },
  'posts:retry': { help: 'Retry a failed post: <id>', run: (s, _f, p) => call(s, 'post.retry', { path: { id: p[0] } }) },
  'posts:delete': { help: 'Delete a post: <id>', run: (s, _f, p) => call(s, 'post.delete', { path: { id: p[0] } }) },
  'comments:create': { help: 'Comment on a post: --team --post --networks A,B --text', flags: { team: 'string', post: 'string', networks: 'string', text: 'string' },
    run: (s, f) => { const types = String(need(f, 'networks')).toUpperCase().split(','); return call(s, 'comment.create', { body: { teamId: need(f, 'team'), internalPostId: need(f, 'post'), title: 'Comment', postDate: new Date().toISOString(), status: 'SCHEDULED', socialAccountTypes: types, data: Object.fromEntries(types.map(t => [t, { text: need(f, 'text') }])) } }); } },
  'comments:list': { help: 'List comments: --team [--post]', flags: { team: 'string', post: 'string' }, run: (s, f) => call(s, 'comment.getList', { query: { teamId: need(f, 'team'), postId: f.post } }) },
  'analytics:account': { help: 'Account analytics: --team --network', flags: { team: 'string', network: 'string' }, run: (s, f) => call(s, 'analytics.getSocialAccountAnalytics', { query: { teamId: need(f, 'team'), platformType: String(need(f, 'network')).toUpperCase() } }) },
  'analytics:post': { help: 'Post analytics: --post --network', flags: { post: 'string', network: 'string' }, run: (s, f) => call(s, 'analytics.getPostAnalytics', { query: { postId: need(f, 'post'), platformType: String(need(f, 'network')).toUpperCase() } }) },
  usage: { help: 'Monthly usage (posts, comments, uploads)', run: async s => ({ posts: await call(s, 'organization.getPostsUsage'), comments: await call(s, 'organization.getCommentsUsage'), uploads: await call(s, 'organization.getUploadsUsage') }) },
  'webhooks:list': { help: 'List webhooks', run: s => call(s, 'webhook.list') },
  'webhooks:create': { help: 'Create a webhook: --url --events a,b', flags: { url: 'string', events: 'string' }, run: (s, f) => call(s, 'webhook.create', { body: { url: need(f, 'url'), events: String(need(f, 'events')).split(',') } }) },
  'webhooks:delete': { help: 'Delete a webhook: <id>', run: (s, _f, p) => call(s, 'webhook.delete', { path: { id: p[0] } }) },
  'credits:balance': { help: 'X credit balance', run: s => call(s, 'credit.getCreditBalance') },
  call: { help: 'Any operation: <operationId> [--body json|@file] [--query json] [--path json]', flags: { body: 'string', query: 'string', path: 'string' },
    run: async (s, f, p) => call(s, (p[0] ?? need({}, 'operationId')) as OperationId, { body: await json(f.body), query: await json(f.query), path: await json(f.path) }) },
};

function usage() {
  log('siar <command> [options]   (auth: SIAR_API_KEY or --api-key; base: SIAR_API_URL or --base-url)\n');
  for (const [k, c] of Object.entries(CMDS)) log(`  ${k.padEnd(18)} ${c.help}`);
}

async function main() {
  const [name, ...rest] = process.argv.slice(2);
  if (!name || name === 'help' || name === '--help') { usage(); return 0; }
  const cmd = CMDS[name];
  if (!cmd) { log(`Unknown command "${name}".`); usage(); return 2; }
  const { flags, positionals } = parseArgs(rest, { ...COMMON, ...(cmd.flags ?? {}) });
  if (flags.help) { log(`${name}: ${cmd.help}`); return 0; }
  const s = new Siar({ apiKey: flags['api-key'] as string | undefined, baseUrl: flags['base-url'] as string | undefined });
  if (!s.key) { log('Set SIAR_API_KEY or pass --api-key.'); return 3; }
  out(await cmd.run(s, flags, positionals));
  return 0;
}

main().then(code => process.exit(code)).catch(err => {
  if (err instanceof UsageError || err instanceof TypeError || err instanceof SyntaxError) { log(err.message); process.exit(2); }
  if (err instanceof SiarError) {
    out({ error: { statusCode: err.statusCode, message: err.message, issues: (err as any).issues } });
    const c = err.statusCode;
    process.exit(c === 401 || c === 403 ? 3 : c === 404 ? 4 : c === 400 || c === 409 || c === 422 ? 5 : c === 429 ? 6 : 7);
  }
  log(String(err?.message ?? err)); process.exit(7);
});
