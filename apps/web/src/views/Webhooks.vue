<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Pencil, Plus, RefreshCw, Trash2, Webhook as WebhookIcon, Zap, KeyRound } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import CopyField from '@/components/CopyField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Toggle from '@/components/ui/Toggle.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Modal from '@/components/ui/Modal.vue';
import Drawer from '@/components/ui/Drawer.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { formatDateTime } from '@/lib/format';
import { timezone } from '@/lib/store';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

interface Hook { id: string; url: string; events: string[]; active: boolean; secret?: string | null; createdAt?: string | null }
interface Delivery { id: string; event: string; attempt?: number; status: string; responseCode?: number | null; responseBody?: string | null; durationMs?: number | null; nextAttemptAt?: string | null; createdAt?: string | null; payload?: unknown }
const GROUPS: { title: string; events: string[] }[] = [
  { title: 'Posts and comments', events: ['post.published', 'comment.published', 'comment.received'] },
  { title: 'Social accounts', events: ['social-account.created', 'social-account.updated', 'social-account.deleted'] },
  { title: 'Teams', events: ['team.created', 'team.updated', 'team.deleted'] },
  { title: 'Inbox', events: ['conversation.created', 'conversation.updated', 'conversation.message.created', 'conversation.message.updated', 'conversation.read.updated'] },
  { title: 'Credit', events: ['credit.low-balance', 'credit.exhausted'] },
];
const offset = ref(0); const limit = 20;
const list = useQuery(() => api.get<{ items: Hook[]; total: number }>('/webhook', { limit, offset: offset.value }), { deps: [offset] });

// create / edit
const open = ref(false); const busy = ref<string | null>(null); const errs = ref<Record<string, string>>({});
const f = reactive({ id: '', url: '', events: new Set<string>(), active: true });
function edit(h?: Hook) { Object.assign(f, { id: h?.id ?? '', url: h?.url ?? '', events: new Set(h?.events ?? ['post.published']), active: h?.active ?? true }); errs.value = {}; open.value = true; }
function toggleEvent(e: string, on: boolean) { if (on) f.events.add(e); else f.events.delete(e); }
const secretShown = ref<string | null>(null);
async function save() {
  busy.value = 'save'; errs.value = {};
  try {
    const body = { url: f.url.trim(), events: [...f.events], active: f.active };
    if (f.id) await api.patch(`/webhook/${f.id}`, body);
    else { const h = await api.post<Hook>('/webhook', body); if (h.secret) secretShown.value = h.secret; }
    open.value = false; await list.reload(); toast.success(f.id ? 'Webhook updated' : 'Webhook created');
  } catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}
async function remove(h: Hook) {
  if (!(await confirm({ title: 'Delete this webhook?', message: h.url, confirmLabel: 'Delete', danger: true }))) return;
  try { await api.del(`/webhook/${h.id}`); await list.reload(); toast.success('Webhook deleted'); } catch (e) { toast.fail(e); }
}
async function rotate(h: Hook) {
  if (!(await confirm({ title: 'Rotate the signing secret?', message: 'Your endpoint must switch to the new secret to keep verifying signatures.', confirmLabel: 'Rotate', danger: true }))) return;
  try { const r = await api.post<{ secret?: string }>(`/webhook/${h.id}/rotate-secret`); secretShown.value = r.secret ?? null; await list.reload(); } catch (e) { toast.fail(e); }
}
async function test(h: Hook) {
  busy.value = h.id;
  try { const d = await api.post<Delivery>(`/webhook/${h.id}/test`); if (d.status === 'SUCCESS') toast.success('Test delivered', `Your endpoint answered ${d.responseCode}.`); else toast.error('Test delivery failed', d.responseCode ? `Your endpoint answered ${d.responseCode}.` : d.responseBody ?? 'No response.'); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// deliveries
const watching = ref<Hook | null>(null); const dOffset = ref(0);
const deliveries = useQuery(() => api.get<{ items: Delivery[]; total: number }>(`/webhook/${watching.value!.id}/deliveries`, { limit: 20, offset: dOffset.value }), { deps: [() => watching.value?.id, dOffset], enabled: () => !!watching.value });
const expanded = ref<string | null>(null);
async function resend(d: Delivery) {
  try { await api.post(`/webhook/${watching.value!.id}/deliveries/${d.id}/resend`); toast.success('Delivery re-sent'); await deliveries.reload(); } catch (e) { toast.fail(e); }
}
const cols = [{ key: 'url', label: 'Endpoint' }, { key: 'events', label: 'Events', hideSm: true }, { key: 'active', label: 'State', width: '110px' }, { key: 'actions', label: '', width: '230px', align: 'right' as const }];
const dcols = [{ key: 'event', label: 'Event' }, { key: 'status', label: 'Status', width: '110px' }, { key: 'responseCode', label: 'HTTP', width: '70px' }, { key: 'createdAt', label: 'Sent', width: '150px' }];
</script>

<template>
  <div class="page wide">
    <PageHead title="Webhooks" subtitle="Get an HTTPS call when something happens. Every request is signed with the endpoint’s secret.">
      <Button variant="primary" :icon="Plus" @click="edit()">Add endpoint</Button>
    </PageHead>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Webhooks" @retry="list.reload">
      <Table :columns="cols" :rows="list.data.value?.items ?? []" :loading="list.loading.value">
        <template #cell-url="{ row }"><span class="strong" style="word-break: break-all">{{ row.url }}</span></template>
        <template #cell-events="{ row }"><div class="chip-row"><Badge v-for="e in row.events.slice(0, 3)" :key="e" size="sm">{{ e }}</Badge><Badge v-if="row.events.length > 3" size="sm" tone="accent">+{{ row.events.length - 3 }}</Badge></div></template>
        <template #cell-active="{ row }"><Badge :tone="row.active ? 'success' : 'neutral'" dot size="sm">{{ row.active ? 'Active' : 'Paused' }}</Badge></template>
        <template #cell-actions="{ row }">
          <div class="row" style="justify-content: flex-end">
            <Button size="sm" variant="ghost" :icon="Zap" :loading="busy === row.id" @click="test(row)">Test</Button>
            <Button size="sm" variant="ghost" @click="watching = row; dOffset = 0">Deliveries</Button>
            <Button iconOnly size="sm" variant="ghost" label="Rotate secret" :icon="KeyRound" @click="rotate(row)" />
            <Button iconOnly size="sm" variant="ghost" label="Edit" :icon="Pencil" @click="edit(row)" />
            <Button iconOnly size="sm" variant="danger-ghost" label="Delete" :icon="Trash2" @click="remove(row)" />
          </div>
        </template>
        <template #empty><EmptyState :icon="WebhookIcon" title="No webhooks" description="Add an endpoint to react to published posts, new comments and connection changes."><Button variant="primary" :icon="Plus" @click="edit()">Add endpoint</Button></EmptyState></template>
      </Table>
      <Pager v-if="list.data.value" :total="list.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
    </QueryState>

    <Modal :open="open" :title="f.id ? 'Edit endpoint' : 'Add endpoint'" size="lg" @close="open = false">
      <form class="stack-16" @submit.prevent="save">
        <Input v-model="f.url" label="Endpoint URL" type="url" placeholder="https://example.com/siar-webhook" required autofocus :error="errs.url" />
        <div class="stack">
          <div class="field-label">Events</div>
          <div v-for="g in GROUPS" :key="g.title" class="stack-4"><div class="tiny muted strong">{{ g.title }}</div><div class="evs"><Checkbox v-for="e in g.events" :key="e" :model-value="f.events.has(e)" :label="e" @update:model-value="toggleEvent(e, $event)" /></div></div>
          <div v-if="errs.events" class="field-error">{{ errs.events }}</div>
        </div>
        <Toggle v-model="f.active" label="Active" help="Paused endpoints receive nothing." />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="open = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy === 'save'" :disabled="!f.url.trim() || !f.events.size">{{ f.id ? 'Save' : 'Add endpoint' }}</Button></div>
      </form>
    </Modal>

    <Modal :open="!!secretShown" title="Signing secret" size="md" :dismissable="false" @close="secretShown = null">
      <div class="stack-16"><div class="callout warn">Copy the secret now. It is how your endpoint verifies that a request came from Siar.</div><CopyField :value="secretShown ?? ''" label="Secret" /><div class="row" style="justify-content: flex-end"><Button variant="primary" @click="secretShown = null">Done</Button></div></div>
    </Modal>

    <Drawer :open="!!watching" title="Deliveries" :width="680" @close="watching = null">
      <div v-if="watching" class="stack-16">
        <div class="small muted" style="word-break: break-all">{{ watching.url }}</div>
        <QueryState :loading="deliveries.loading.value" :error="deliveries.error.value" :status="deliveries.status.value" :has-data="!!deliveries.data.value" feature="Deliveries" @retry="deliveries.reload">
          <Table :columns="dcols" :rows="deliveries.data.value?.items ?? []" clickable @row-click="(d) => (expanded = expanded === d.id ? null : d.id)">
            <template #cell-status="{ row }"><StatusBadge :status="row.status" size="sm" /></template>
            <template #cell-responseCode="{ row }">{{ row.responseCode ?? '—' }}</template>
            <template #cell-createdAt="{ row }"><span class="small">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
            <template #empty><EmptyState compact title="No deliveries yet" description="Send a test to see one here." /></template>
          </Table>
          <div v-for="d in (deliveries.data.value?.items ?? []).filter((x) => x.id === expanded)" :key="d.id" class="stack mt-16">
            <div class="row"><h3 class="grow">{{ d.event }}</h3><Button size="sm" :icon="RefreshCw" @click="resend(d)">Resend</Button></div>
            <div class="small muted">Attempt {{ d.attempt ?? 1 }} · {{ d.durationMs ?? '—' }} ms<template v-if="d.nextAttemptAt"> · next try {{ formatDateTime(d.nextAttemptAt, timezone) }}</template></div>
            <div v-if="d.responseBody" class="stack-4"><div class="tiny muted strong">Response</div><pre class="secret prewrap">{{ d.responseBody }}</pre></div>
            <div class="stack-4"><div class="tiny muted strong">Payload</div><pre class="secret prewrap">{{ JSON.stringify(d.payload, null, 2) }}</pre></div>
          </div>
          <Pager v-if="deliveries.data.value" :total="deliveries.data.value.total" :limit="20" v-model:offset="dOffset" class="mt-16" />
        </QueryState>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.evs { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 6px 16px; }
</style>
