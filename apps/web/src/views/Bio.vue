<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ArrowDown, ArrowUp, ExternalLink, Link2, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import CopyField from '@/components/CopyField.vue';
import LineChart from '@/components/LineChart.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Select from '@/components/ui/Select.vue';
import Toggle from '@/components/ui/Toggle.vue';
import Modal from '@/components/ui/Modal.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, session } from '@/lib/store';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

interface Item { id: string; type: 'LINK' | 'HEADER' | 'SOCIAL' | 'TEXT'; title?: string | null; url?: string | null; icon?: string | null; position?: number; active?: boolean; clicks?: number }
interface BioPage { id: string; teamId: string; slug: string; title?: string | null; description?: string | null; avatarUrl?: string | null; theme?: { accent?: string } | null; published?: boolean; items?: Item[] }

const bios = useQuery(() => api.get<{ items: BioPage[] }>('/bio', { teamId: session.teamId }), { deps: [() => session.teamId], enabled: () => !!session.teamId });
const bio = computed(() => bios.data.value?.items[0] ?? null);
const stats = useQuery(() => api.get<{ views: number; clicks: number; days: { day: string; views: number; clicks: number }[] }>('/bio-analytics', { bioId: bio.value!.id }), { deps: [() => bio.value?.id], enabled: () => !!bio.value });

// create
const create = reactive({ slug: '', title: '' }); const errs = ref<Record<string, string>>({}); const busy = ref<string | null>(null);
watch(() => currentTeam.value?.name, (n) => { if (n && !create.title) create.title = n; }, { immediate: true });
async function createBio() {
  busy.value = 'create'; errs.value = {};
  try { await api.post('/bio', { teamId: session.teamId, slug: create.slug.trim().toLowerCase(), title: create.title.trim() }); await bios.reload(); toast.success('Bio page created'); }
  catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}

// edit settings
const f = reactive({ slug: '', title: '', description: '', avatarUrl: '', accent: '#161615', published: false });
watch(bio, (b) => { if (b) Object.assign(f, { slug: b.slug, title: b.title ?? '', description: b.description ?? '', avatarUrl: b.avatarUrl ?? '', accent: b.theme?.accent ?? '#161615', published: !!b.published }); }, { immediate: true });
const frame = ref(0);
async function saveSettings(extra: Record<string, unknown> = {}) {
  if (!bio.value) return;
  busy.value = 'save'; errs.value = {};
  try {
    await api.patch(`/bio/${bio.value.id}`, { slug: f.slug.trim().toLowerCase(), title: f.title, description: f.description, avatarUrl: f.avatarUrl.trim() || null, theme: { ...(bio.value.theme ?? {}), accent: f.accent }, published: f.published, ...extra });
    await bios.reload(); frame.value++; toast.success('Saved');
  } catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); await bios.reload(); } finally { busy.value = null; }
}
async function removeBio() {
  if (!bio.value || !(await confirm({ title: 'Delete this bio page?', message: `The link /b/${bio.value.slug} stops working.`, confirmLabel: 'Delete page', danger: true }))) return;
  try { await api.del(`/bio/${bio.value.id}`); await bios.reload(); toast.success('Deleted'); } catch (e) { toast.fail(e); }
}
const publicUrl = computed(() => (bio.value ? `${location.origin}/b/${bio.value.slug}` : ''));

// items
const items = computed(() => [...(bio.value?.items ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
const editing = ref<Partial<Item> | null>(null); const itemErr = ref<Record<string, string>>({});
const TYPES = [{ value: 'LINK', label: 'Link button' }, { value: 'HEADER', label: 'Heading' }, { value: 'TEXT', label: 'Text' }, { value: 'SOCIAL', label: 'Social link' }];
async function saveItem() {
  const it = editing.value; if (!it || !bio.value) return;
  busy.value = 'item'; itemErr.value = {};
  try {
    if (it.id) await api.patch(`/bio-item/${it.id}`, { title: it.title ?? '', url: it.url || null, icon: it.icon || null });
    else await api.post('/bio-item', { bioId: bio.value.id, type: it.type, title: it.title ?? '', ...(it.url ? { url: it.url } : {}), ...(it.icon ? { icon: it.icon } : {}) });
    editing.value = null; await bios.reload(); frame.value++;
  } catch (e) { if (isApiError(e)) itemErr.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}
async function toggleItem(i: Item) { try { await api.patch(`/bio-item/${i.id}`, { active: !i.active }); await bios.reload(); frame.value++; } catch (e) { toast.fail(e); } }
async function delItem(i: Item) {
  if (!(await confirm({ title: 'Remove this item?', message: i.title ?? '', confirmLabel: 'Remove', danger: true }))) return;
  try { await api.del(`/bio-item/${i.id}`); await bios.reload(); frame.value++; } catch (e) { toast.fail(e); }
}
async function move(i: number, d: number) {
  if (!bio.value) return;
  const ids = items.value.map((x) => x.id); const j = i + d; if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  try { await api.post('/bio-item/reorder', { bioId: bio.value.id, ids }); await bios.reload(); frame.value++; } catch (e) { toast.fail(e); }
}
</script>

<template>
  <div class="page wide">
    <PageHead title="Link in bio" subtitle="One public page of links for this team, with view and click counts.">
      <Button v-if="bio?.published" :icon="ExternalLink" :href="publicUrl">Open page</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <QueryState v-else :loading="bios.loading.value" :error="bios.error.value" :status="bios.status.value" :has-data="!!bios.data.value" feature="Link in bio" @retry="bios.reload">
      <!-- create -->
      <Card v-if="!bio" title="Create the bio page" subtitle="Pick the address people will visit.">
        <form class="stack-16" style="max-width: 420px" @submit.prevent="createBio">
          <Input v-model="create.title" label="Page title" required :error="errs.title" />
          <Input v-model="create.slug" label="Address" required prefix="/b/" placeholder="my-brand" :error="errs.slug" help="3 to 40 characters: lowercase letters, numbers and dashes." />
          <div><Button type="submit" variant="primary" :icon="Link2" :loading="busy === 'create'">Create page</Button></div>
        </form>
      </Card>

      <div v-else class="bio">
        <div class="stack-16" style="min-width: 0">
          <Card title="Page">
            <template #actions><Badge :tone="bio.published ? 'success' : 'neutral'" dot>{{ bio.published ? 'Published' : 'Draft' }}</Badge></template>
            <form class="stack-16" @submit.prevent="saveSettings()">
              <div class="grid-2"><Input v-model="f.title" label="Title" :error="errs.title" /><Input v-model="f.slug" label="Address" prefix="/b/" :error="errs.slug" /></div>
              <Textarea v-model="f.description" label="Description" :rows="2" :error="errs.description" />
              <div class="grid-2"><Input v-model="f.avatarUrl" label="Avatar URL" type="url" placeholder="https://…" :error="errs.avatarUrl" />
                <div class="field"><label class="field-label" for="accent">Accent colour</label><div class="row"><input id="accent" v-model="f.accent" type="color" class="swatch" /><code>{{ f.accent }}</code></div></div></div>
              <Toggle v-model="f.published" label="Published" help="Unpublished pages return 404." />
              <CopyField v-if="bio?.published" :value="publicUrl" label="Public link" />
              <div class="row"><Button type="submit" variant="primary" :loading="busy === 'save'">Save changes</Button><span class="spacer" /><Button variant="danger-ghost" :icon="Trash2" @click="removeBio">Delete page</Button></div>
            </form>
          </Card>

          <Card title="Items" :subtitle="`${items.length} on the page`">
            <template #actions><Button size="sm" variant="primary" :icon="Plus" @click="editing = { type: 'LINK', title: '', url: '' }">Add item</Button></template>
            <EmptyState v-if="!items.length" compact title="Nothing here yet" description="Add a link button, a heading or some text." />
            <div v-else class="panel-list">
              <div v-for="(i, n) in items" :key="i.id" class="item" :class="{ off: i.active === false }">
                <div class="stack-4"><Button iconOnly size="sm" variant="ghost" label="Move up" :icon="ArrowUp" :disabled="n === 0" @click="move(n, -1)" /><Button iconOnly size="sm" variant="ghost" label="Move down" :icon="ArrowDown" :disabled="n === items.length - 1" @click="move(n, 1)" /></div>
                <div class="grow" style="min-width: 0"><div class="row"><Badge size="sm">{{ i.type.toLowerCase() }}</Badge><span class="strong truncate">{{ i.title || i.url }}</span></div><div v-if="i.url" class="tiny muted truncate">{{ i.url }}</div></div>
                <span v-if="i.type === 'LINK' || i.type === 'SOCIAL'" class="small muted nowrap">{{ i.clicks ?? 0 }} clicks</span>
                <Toggle :model-value="i.active !== false" aria-label="Show on page" @update:model-value="toggleItem(i)" />
                <Button iconOnly size="sm" variant="ghost" label="Edit item" :icon="Pencil" @click="editing = { ...i }" />
                <Button iconOnly size="sm" variant="danger-ghost" label="Remove item" :icon="Trash2" @click="delItem(i)" />
              </div>
            </div>
          </Card>

          <Card title="Last 30 days">
            <QueryState :loading="stats.loading.value" :error="stats.error.value" :status="stats.status.value" :has-data="!!stats.data.value" feature="Bio analytics" skeleton="block" @retry="stats.reload">
              <div class="grid-2 mb-16"><div class="stat"><div class="l">Views</div><div class="v">{{ stats.data.value?.views ?? 0 }}</div></div><div class="stat"><div class="l">Clicks</div><div class="v">{{ stats.data.value?.clicks ?? 0 }}</div></div></div>
              <LineChart :series="[{ name: 'Views', points: (stats.data.value?.days ?? []).map((d) => ({ x: d.day, y: d.views })) }, { name: 'Clicks', points: (stats.data.value?.days ?? []).map((d) => ({ x: d.day, y: d.clicks })) }]" :height="200" />
            </QueryState>
          </Card>
        </div>

        <aside class="preview">
          <div class="phone">
            <iframe v-if="bio?.published" :key="frame + (bio?.slug ?? '')" :src="`/b/${bio?.slug}`" title="Bio page preview" />
            <div v-else class="muted small" style="padding: 24px; text-align: center">Publish the page to see a live preview.</div>
          </div>
        </aside>
      </div>
    </QueryState>

    <Modal :open="!!editing" :title="editing?.id ? 'Edit item' : 'Add item'" size="sm" @close="editing = null">
      <form v-if="editing" class="stack-16" @submit.prevent="saveItem">
        <Select v-if="!editing.id" v-model="editing.type" label="Type" :options="TYPES" />
        <Input v-model="editing.title" :label="editing.type === 'SOCIAL' ? 'Label' : editing.type === 'TEXT' ? 'Text' : editing.type === 'HEADER' ? 'Heading' : 'Button text'" :error="itemErr.title" required autofocus />
        <Input v-if="editing.type === 'LINK' || editing.type === 'SOCIAL'" v-model="editing.url" type="url" label="URL" placeholder="https://…" required :error="itemErr.url" />
        <Input v-if="editing?.type === 'LINK' || editing?.type === 'SOCIAL'" v-model="editing!.icon" label="Icon (optional)" help="An emoji or a short name." />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="editing = null">Cancel</Button><Button type="submit" variant="primary" :loading="busy === 'item'">{{ editing?.id ? 'Save' : 'Add' }}</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.bio { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
@media (max-width: 1100px) { .bio { grid-template-columns: minmax(0, 1fr); } .preview { display: none; } }
.preview { position: sticky; top: calc(var(--topbar) + 16px); }
.phone { border: 8px solid var(--text); border-radius: 32px; overflow: hidden; height: 600px; background: var(--bg-elevated); }
.phone iframe { width: 100%; height: 100%; border: 0; }
.off { opacity: 0.55; }
.swatch { width: 40px; height: 36px; padding: 2px; border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-elevated); cursor: pointer; }
</style>
