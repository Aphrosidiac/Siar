<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ImagePlus, Send, Save, CalendarClock, X, TriangleAlert, Film, FileText } from 'lucide-vue-next';
import postSchema from 'virtual:post-schema';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import SchemaFields from '@/components/SchemaFields.vue';
import TikTokPanel from '@/components/TikTokPanel.vue';
import MediaPicker from '@/components/MediaPicker.vue';
import Card from '@/components/ui/Card.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';
import DateTimeInput from '@/components/ui/DateTimeInput.vue';
import { api, isApiError, type Issue } from '@/lib/api';
import { currentTeam, session, timezone } from '@/lib/store';
import { useQuery } from '@/lib/query';
import { META, countChars, needsChannel, textLimit } from '@/lib/networks';
import { kindOf } from '@/lib/schema';
import { humanize, handle } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType, Post, SocialAccount, Upload } from '@/lib/types';

const route = useRoute(); const router = useRouter();
const editId = computed(() => (route.params.id as string | undefined) ?? null);

// ── form state ──
const form = reactive({
  title: '', text: '',
  types: [] as NetworkType[],
  media: [] as Upload[],
  net: {} as Record<string, Record<string, any>>,
  ownText: {} as Record<string, string | undefined>, // set when a network has its own text
  firstComment: {} as Record<string, string>,
  when: 'schedule' as 'now' | 'schedule' | 'draft',
  date: null as string | null,
});
const tab = ref('main');
const issues = ref<Issue[]>([]);
const saving = ref(false);
const picker = ref(false);

function defaultDate() { const d = new Date(Date.now() + 3600_000); d.setMinutes(0, 0, 0); return d.toISOString(); }
form.date = defaultDate();

const accounts = computed(() => currentTeam.value?.socialAccounts ?? []);
const accountOf = (t: string): SocialAccount | null => accounts.value.find((a) => a.type === t) ?? null;
const blocked = (a: SocialAccount) => (a.connectionState === 'NEEDS_RECONNECT' ? 'Needs reconnect' : needsChannel(a) ? 'Choose a channel first' : null);

function toggleType(a: SocialAccount) {
  const i = form.types.indexOf(a.type);
  if (i >= 0) { form.types.splice(i, 1); if (tab.value === a.type) tab.value = 'main'; return; }
  form.types.push(a.type);
  form.net[a.type] ??= {};
  if (a.type === 'TIKTOK' && form.net.TIKTOK!.disableComments === undefined) Object.assign(form.net.TIKTOK!, { disableComments: true, disableDuet: true, disableStitch: true });
}

// ── effective text per network ──
const textOf = (t: string) => form.ownText[t] ?? form.text;
function setNetText(t: string, v: string) { form.ownText[t] = v; }
function resetNetText(t: string) { delete form.ownText[t]; }

// ── schema ──
const dataSchema = postSchema.data as Record<string, any>;
const netSchema = (t: string): Record<string, any> => dataSchema[t]?.properties ?? {};
const netRequired = (t: string): string[] => dataSchema[t]?.required ?? [];
const HIDDEN = new Set(['text', 'uploadIds', 'mediaItems', 'carouselItems']);
const CURATED: Record<string, string[]> = {
  TWITTER: ['replySettings', 'isAiGenerated'], PINTEREST: ['boardName', 'description', 'link', 'altText'],
  FACEBOOK: ['type', 'link', 'mediaTitle'], INSTAGRAM: ['type', 'shareToFeed', 'altText', 'collaborators', 'locationId'],
  THREADS: ['topicTag', 'replyControl', 'linkAttachment'], LINKEDIN: ['privacy', 'link'],
  YOUTUBE: ['type', 'privacy', 'description', 'madeForKids'], REDDIT: ['sr', 'description', 'link', 'nsfw', 'flairId'],
  DISCORD: ['channelId', 'username', 'avatarUrl'], SLACK: ['channelId', 'username', 'avatarUrl'], MASTODON: ['privacy', 'spoiler'],
  BLUESKY: ['tags', 'externalUrl'], GOOGLE_BUSINESS: ['topicType', 'callToActionType', 'callToActionUrl'], SNAPCHAT: ['type', 'storyDuration'],
};
const keyFields = (t: string) => (CURATED[t] ?? []).filter((k) => netSchema(t)[k]);
const moreFields = (t: string) => Object.keys(netSchema(t)).filter((k) => !HIDDEN.has(k) && !(CURATED[t] ?? []).includes(k));
const LABELS: Record<string, Record<string, string>> = {
  PINTEREST: { description: 'Description', boardName: 'Board', link: 'Destination link' }, REDDIT: { sr: 'Subreddit', description: 'Body text' }, YOUTUBE: { description: 'Description' },
  DISCORD: { channelId: 'Channel' }, SLACK: { channelId: 'Channel' }, THREADS: { linkAttachment: 'Link attachment' }, BLUESKY: { externalUrl: 'Link card URL' },
};
const MULTILINE = ['description', 'spoiler', 'note'];
const firstCommentMax = (t: string) => (postSchema.firstComment as Record<string, number | null>)[t];
const inlineKeys = (t: string) => t === 'TIKTOK' ? new Set(['text', 'firstComment', 'type', 'privacy', 'photoCoverIndex']) : new Set(['text', 'firstComment', ...Object.entries(netSchema(t)).filter(([k, s]) => !HIDDEN.has(k) && kindOf(s) !== 'json').map(([k]) => k)]);

// ── issues mapped onto fields ──
const issuesFor = computed(() => {
  const by: Record<string, Record<string, string>> = {};
  const general: string[] = [];
  for (const i of issues.value) {
    const p = i.path ?? [];
    if (p[0] === 'data' && typeof p[1] === 'string') { const k = p.slice(2).join('.') || '_'; (by[p[1]] ??= {})[k] ??= i.message; }
    else if (p[0] === 'firstComment' && typeof p[1] === 'string') (by[p[1]] ??= {}).firstComment ??= i.message;
    else if (p[0] === 'postDate') by._schedule = { postDate: i.message };
    else general.push(i.message);
  }
  return { by, general };
});
const netIssues = (t: string) => issuesFor.value.by[t] ?? {};
const orphanIssues = (t: string) => Object.entries(netIssues(t)).filter(([k]) => !inlineKeys(t).has(k.split('.')[0]!)).map(([k, m]) => ({ k, m }));
const moreHasIssue = (t: string) => moreFields(t).some((k) => netIssues(t)[k]);

// ── media ──
const mediaIds = computed(() => form.media.map((u) => u.id));
const hasImages = computed(() => form.media.some((u) => u.type === 'image'));
const hasVideo = computed(() => form.media.some((u) => u.type === 'video'));
/** Set by TikTokPanel from creator_info: the creator cannot post right now, or the video is over their limit. */
const tiktokBlock = ref<string | null>(null);
const tiktokHold = computed(() => (form.when !== 'draft' && form.types.includes('TIKTOK') ? tiktokBlock.value : null));
function setMedia(items: Upload[]) { form.media = items; picker.value = false; }
const needMedia = computed(() => form.types.filter((t) => META[t].media === 'required').map((t) => META[t].name));

// ── counters ──
function counter(t: NetworkType) {
  const limit = textLimit(t, accountOf(t));
  const n = countChars(textOf(t));
  return { n, limit, over: !!limit && n > limit };
}

// ── payload ──
function buildPayload() {
  const data: Record<string, any> = {};
  for (const t of form.types) {
    const d: Record<string, any> = {};
    for (const [k, v] of Object.entries(form.net[t] ?? {})) if (!k.startsWith('__') && v !== undefined && v !== '' && v !== null) d[k] = v;
    const text = textOf(t);
    if (text.trim()) d.text = text; else delete d.text;
    if (mediaIds.value.length && netSchema(t).uploadIds) d.uploadIds = mediaIds.value;
    if (t === 'TIKTOK' && d.type === undefined && form.media.length) d.type = hasVideo.value ? 'VIDEO' : 'IMAGE';
    data[t] = d;
  }
  const firstComment: Record<string, string> = {};
  for (const t of form.types) if (form.firstComment[t]?.trim() && firstCommentMax(t) !== undefined) firstComment[t] = form.firstComment[t]!.trim();
  const firstLine = form.text.trim().split('\n')[0] ?? '';
  const title = (form.title.trim() || firstLine || textOf(form.types[0] ?? '').trim() || 'Untitled post').slice(0, 60);
  const postDate = form.when === 'now' ? new Date().toISOString() : form.date ?? defaultDate();
  return { title, postDate, status: form.when === 'draft' ? 'DRAFT' : 'SCHEDULED', socialAccountTypes: [...form.types], data, ...(Object.keys(firstComment).length ? { firstComment } : {}) };
}

async function submit() {
  issues.value = [];
  if (!session.teamId) return;
  if (!form.types.length) { toast.error('Pick at least one network'); return; }
  if (form.when !== 'draft' && form.types.includes('TIKTOK') && tiktokBlock.value) { tab.value = 'TIKTOK'; toast.error('TikTok can’t take this post', tiktokBlock.value); return; }
  if (form.when === 'now' && !(await confirm({ title: `Publish now to ${form.types.length} network${form.types.length === 1 ? '' : 's'}?`, message: form.types.map((t) => META[t].name).join(', ') + '. This goes live immediately.', confirmLabel: 'Publish now' }))) return;
  saving.value = true;
  try {
    const body = buildPayload();
    const post = editId.value ? await api.patch<Post>(`/post/${editId.value}`, body) : await api.post<Post>('/post/', { teamId: session.teamId, ...body });
    toast.success(form.when === 'draft' ? 'Draft saved' : form.when === 'now' ? 'Publishing started' : 'Post scheduled');
    await router.push(`/posts/${post.id}`);
  } catch (e) {
    if (isApiError(e) && e.issues.length) {
      issues.value = e.issues;
      toast.error('Fix the highlighted fields', e.message.replace(/^Validation failed:\s*/, ''));
      const first = e.issues.find((i) => i.path?.[0] === 'data' && form.types.includes(i.path[1] as NetworkType));
      if (first) tab.value = String(first.path[1]);
    } else toast.fail(e);
  } finally { saving.value = false; }
}

// ── edit mode ──
const loaded = useQuery(async () => {
  const p = await api.get<Post>(`/post/${editId.value}`);
  const types = (p.socialAccounts ?? []).map((t) => t.socialAccount?.type).filter(Boolean) as NetworkType[];
  form.types = types; form.title = p.title ?? '';
  const texts = types.map((t) => (p.data?.[t]?.text as string | undefined) ?? '');
  form.text = texts[0] ?? '';
  form.net = {}; form.ownText = {};
  for (const t of types) {
    const { text, uploadIds, ...rest } = (p.data?.[t] ?? {}) as Record<string, any>;
    form.net[t] = rest;
    if ((text ?? '') !== form.text) form.ownText[t] = text ?? '';
  }
  form.firstComment = Object.fromEntries(Object.entries(p.firstComment ?? {}).filter(([, v]) => v).map(([k, v]) => [k, String(v)]));
  form.media = (p.uploads ?? []).map((u) => u.upload).filter(Boolean) as Upload[];
  form.when = p.status === 'DRAFT' ? 'draft' : 'schedule';
  form.date = p.postDate ?? defaultDate();
  return p;
}, { enabled: () => !!editId.value });
const locked = computed(() => !!loaded.data.value && !['DRAFT', 'SCHEDULED', 'ERROR'].includes(loaded.data.value.status));

onMounted(() => {
  const d = route.query.date;
  if (typeof d === 'string' && !editId.value) { const t = new Date(d); if (!isNaN(t.getTime())) form.date = t.toISOString(); }
});
watch(() => session.teamId, (n, o) => { if (o && n !== o && !editId.value) { form.types = []; form.net = {}; form.media = []; tab.value = 'main'; } });

const tabs = computed(() => [{ value: 'main', label: 'Main' }, ...form.types.map((t) => ({ value: t, label: META[t].name, badge: Object.keys(netIssues(t)).length || (counter(t).over ? '!' : null), tone: 'danger' as const }))]);
const submitLabel = computed(() => (form.when === 'now' ? 'Publish now' : form.when === 'draft' ? 'Save draft' : editId.value ? 'Update schedule' : 'Schedule post'));
// a scheduled post can't be in the past; refreshed each minute so the picker's earliest time keeps up
const earliest = ref(new Date().toISOString());
const tick = window.setInterval(() => { earliest.value = new Date().toISOString(); }, 60_000);
onBeforeUnmount(() => window.clearInterval(tick));
</script>

<template>
  <div class="page wide">
    <PageHead :title="editId ? 'Edit post' : 'Composer'" :subtitle="currentTeam ? `Writing for ${currentTeam.name}` : ''" />
    <NoTeam v-if="!currentTeam" />
    <QueryState v-else :loading="loaded.loading.value" :error="loaded.error.value" :status="loaded.status.value" :has-data="!editId || !!loaded.data.value" skeleton="block" @retry="loaded.reload">
      <div v-if="locked" class="callout warn mb-16"><TriangleAlert :size="16" />This post is already {{ loaded.data.value?.status.toLowerCase() }} and can no longer be edited.</div>
      <div class="cmp">
        <div class="stack-16" style="min-width: 0">
          <Card title="Networks" :subtitle="accounts.length ? 'Tap an account to include it.' : ''">
            <div v-if="!accounts.length" class="callout info">No accounts are connected to this team yet. <router-link to="/social-accounts">Connect an account</router-link> to start posting.</div>
            <div v-else class="chips">
              <button v-for="a in accounts" :key="a.id" type="button" class="chip" :class="{ on: form.types.includes(a.type) }" :disabled="!!blocked(a) && !form.types.includes(a.type)" :aria-pressed="form.types.includes(a.type)" :title="blocked(a) ?? undefined" @click="toggleType(a)">
                <NetworkIcon :type="a.type" :size="24" :title="false" />
                <span class="grow" style="text-align: left"><span class="strong">{{ META[a.type].name }}</span><span class="tiny muted d-block truncate">{{ blocked(a) ?? (a.username ? handle(a.username) : a.displayName) }}</span></span>
              </button>
            </div>
          </Card>

          <Card title="Content">
            <template #actions><Tabs v-model="tab" :tabs="tabs" size="sm" /></template>
            <div v-if="issuesFor.general.length" class="callout danger mb-16" role="alert"><div><div v-for="m in issuesFor.general" :key="m">{{ m }}</div></div></div>

            <!-- MAIN -->
            <div v-show="tab === 'main'" class="stack-16">
              <Textarea v-model="form.text" label="Post text" :rows="6" placeholder="What do you want to say?" help="Shared by every network until you give a network its own text in its tab." :disabled="locked" />
              <div v-if="form.types.length" class="row wrap">
                <span v-for="t in form.types" :key="t" class="cnt" :class="{ over: counter(t).over }"><NetworkIcon :type="t" :size="16" :title="false" />{{ counter(t).n.toLocaleString() }}<template v-if="counter(t).limit"> / {{ counter(t).limit!.toLocaleString() }}</template></span>
              </div>
              <Input v-model="form.title" label="Internal title (optional)" placeholder="Shown in your post list only" :max="60" help="Defaults to the first line of the text." />

              <div class="stack">
                <div class="field-label">Media</div>
                <div class="row wrap">
                  <div v-for="(u, i) in form.media" :key="u.id" class="att">
                    <img v-if="u.thumbnailUrl || (u.type === 'image' && u.url)" :src="(u.thumbnailUrl || u.url)!" alt="" />
                    <span v-else class="ph"><Film v-if="u.type === 'video'" :size="20" /><FileText v-else :size="20" /></span>
                    <button type="button" class="rm" :aria-label="`Remove attachment ${i + 1}`" @click="form.media.splice(i, 1)"><X :size="12" /></button>
                  </div>
                  <Button :icon="ImagePlus" :disabled="locked" @click="picker = true">{{ form.media.length ? 'Change media' : 'Add media' }}</Button>
                </div>
                <div v-if="needMedia.length && !form.media.length" class="small muted">{{ needMedia.join(', ') }} {{ needMedia.length === 1 ? 'needs' : 'need' }} media.</div>
              </div>
              <div v-if="!form.types.length" class="muted small">Choose at least one network above, then fine-tune each network in its tab.</div>
            </div>

            <!-- NETWORK TABS -->
            <template v-for="t in form.types" :key="t">
              <div v-show="tab === t" class="stack-16">
                <div class="row"><NetworkIcon :type="t" :size="28" /><h3>{{ META[t].name }}</h3><span class="muted small">{{ accountOf(t)?.username ? handle(accountOf(t)!.username) : '' }}</span></div>
                <div v-if="orphanIssues(t).length" class="callout danger" role="alert"><div><div v-for="o in orphanIssues(t)" :key="o.k"><span v-if="o.k !== '_'" class="strong">{{ o.k.startsWith('uploadIds') ? 'Media' : humanize(o.k) }}: </span>{{ o.m }}</div></div></div>

                <div class="stack-4">
                  <Textarea :model-value="textOf(t)" :label="META[t].textLabel" :rows="t === 'TWITTER' || META[t].textMax! <= 500 ? 4 : 6" :max="textLimit(t, accountOf(t))" :count="counter(t).n" :error="netIssues(t).text" :required="netRequired(t).includes('text')" :disabled="locked" @update:model-value="setNetText(t, $event)" />
                  <div v-if="form.ownText[t] !== undefined" class="row small"><span class="muted">This network has its own text.</span><button type="button" class="link-btn" @click="resetNetText(t)">Use main text</button></div>
                </div>

                <TikTokPanel v-if="t === 'TIKTOK'" :account="accountOf('TIKTOK')" :values="form.net.TIKTOK ?? {}" :issues="netIssues('TIKTOK')" :has-images="hasImages" :has-video="hasVideo" :video-length="form.media.find((u) => u.type === 'video')?.videoLength ?? null" :media="form.media" :caption="textOf('TIKTOK')" @set="(k, v) => (form.net.TIKTOK![k] = v)" @block="tiktokBlock = $event" />
                <template v-else>
                  <SchemaFields :schema="netSchema(t)" :keys="keyFields(t)" :values="form.net[t] ?? {}" :issues="netIssues(t)" :required="netRequired(t)" :labels="LABELS[t]" :multiline="MULTILINE" @set="(k, v) => (form.net[t]![k] = v)">
                    <template v-if="(t === 'DISCORD' || t === 'SLACK') && accountOf(t)?.channels?.length" #field-channelId>
                      <Select :model-value="form.net[t]?.channelId ?? null" :label="`${META[t].name} channel`" required placeholder="Choose a channel" :options="accountOf(t)!.channels!.map((c) => ({ value: c.id, label: c.name ?? c.id }))" :error="netIssues(t).channelId" @update:model-value="form.net[t]!.channelId = $event ?? undefined" />
                    </template>
                    <template v-if="t === 'PINTEREST' && accountOf(t)?.channels?.length" #field-boardName>
                      <Select :model-value="form.net[t]?.boardName ?? null" label="Board" required placeholder="Choose a board" :options="accountOf(t)!.channels!.map((c) => ({ value: c.name ?? c.id, label: c.name ?? c.id }))" :error="netIssues(t).boardName" @update:model-value="form.net[t]!.boardName = $event ?? undefined" />
                    </template>
                  </SchemaFields>
                  <details v-if="moreFields(t).length" class="more" :open="moreHasIssue(t) || undefined">
                    <summary>More {{ META[t].name }} options</summary>
                    <div class="mt-16"><SchemaFields :schema="netSchema(t)" :keys="moreFields(t)" :values="form.net[t] ?? {}" :issues="netIssues(t)" :required="netRequired(t)" :multiline="MULTILINE" @set="(k, v) => (form.net[t]![k] = v)" /></div>
                  </details>
                </template>

                <Textarea v-if="firstCommentMax(t) !== undefined" v-model="form.firstComment[t]" label="First comment (optional)" :rows="2" :max="firstCommentMax(t) ?? null" :error="netIssues(t).firstComment" help="Posted right after the post goes live." :disabled="locked" />
              </div>
            </template>
          </Card>
        </div>

        <aside class="stack-16 sticky">
          <Card title="Publish">
            <div class="stack-16">
              <div class="pill-toggle" role="group" aria-label="When to publish">
                <button type="button" :class="{ on: form.when === 'schedule' }" @click="form.when = 'schedule'">Schedule</button>
                <button type="button" :class="{ on: form.when === 'now' }" @click="form.when = 'now'">Publish now</button>
                <button type="button" :class="{ on: form.when === 'draft' }" @click="form.when = 'draft'">Draft</button>
              </div>
              <DateTimeInput v-if="form.when !== 'now'" v-model="form.date" :timezone="timezone" :label="form.when === 'draft' ? 'Planned for' : 'Publish at'" :min="form.when === 'schedule' ? earliest : null" :error="issuesFor.by._schedule?.postDate" />
              <div v-else class="small muted">Goes out as soon as you confirm.</div>
              <span class="block" :title="tiktokHold ?? undefined"><Button variant="primary" block size="lg" :icon="form.when === 'now' ? Send : form.when === 'draft' ? Save : CalendarClock" :loading="saving" :disabled="locked || !form.types.length || !!tiktokHold" @click="submit">{{ submitLabel }}</Button></span>
              <p v-if="!form.types.length" class="tiny muted">Pick a network to enable publishing.</p>
              <p v-else-if="tiktokHold" class="tiny danger-text" data-testid="publish-held">TikTok: {{ tiktokHold }}</p>
            </div>
          </Card>
          <Card v-if="form.types.length" title="Going to">
            <ul class="list-plain stack">
              <li v-for="t in form.types" :key="t" class="row"><NetworkIcon :type="t" :size="20" :title="false" /><span class="grow small">{{ META[t].name }}</span><span class="tiny" :class="counter(t).over ? 'danger-text' : 'muted'">{{ counter(t).n }}{{ counter(t).limit ? ` / ${counter(t).limit}` : '' }}</span></li>
            </ul>
          </Card>
        </aside>
      </div>
    </QueryState>

    <MediaPicker :open="picker" :selected="form.media" @close="picker = false" @confirm="setMedia" />
  </div>
</template>

<style scoped>
.cmp { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
.sticky { position: sticky; top: calc(var(--topbar) + 16px); }
@media (max-width: 1100px) { .cmp { grid-template-columns: minmax(0, 1fr); } .sticky { position: static; } }
.chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
.chip { position: relative; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); cursor: pointer; color: var(--text); min-width: 0; }
.chip { transition: border-color var(--t-micro), box-shadow var(--t-micro), background var(--t-micro); }
.chip:hover:not(:disabled) { border-color: var(--border-strong); }
.chip.on { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); }
.chip.on::after { content: ''; position: absolute; top: 50%; right: 12px; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: var(--text); }
.chip:disabled { opacity: 0.55; cursor: not-allowed; }
.d-block { display: block; }
.cnt { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: var(--fs-12); line-height: 18px; padding: 2px 8px; background: var(--bg-muted); border-radius: var(--radius-sm); color: var(--text-muted); font-variant-numeric: tabular-nums; }
.cnt.over { color: var(--danger-soft-text); background: var(--danger-soft); }
.att { position: relative; width: 64px; height: 64px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); background: var(--bg-muted); }
.att img { width: 100%; height: 100%; object-fit: cover; }
.att .ph { width: 100%; height: 100%; display: grid; place-items: center; color: var(--text-subtle); }
.rm { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.65); color: #fff; display: grid; place-items: center; cursor: pointer; }
.more > summary { cursor: pointer; font-size: var(--fs-13); font-weight: 500; color: var(--text-muted); }
</style>
