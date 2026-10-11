<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import PostDrawer from '@/components/PostDrawer.vue';
import Button from '@/components/ui/Button.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session, timezone } from '@/lib/store';
import { dayKey, formatTime, fromZoned, pad, zonedParts } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { Paged, Post } from '@/lib/types';

/**
 * Month grid in the team's timezone. Click a day to see its agenda on the right, click a post to
 * open it in place, drag a scheduled post or draft onto another day to move it (time kept).
 */
const route = useRoute();
const router = useRouter();
const tz = computed(() => timezone.value);
const now = zonedParts(new Date(), tz.value);
const cur = ref({ y: now.y, m: now.m });
const selected = ref<string>(dayKey(new Date(), tz.value));
const todayKey = computed(() => dayKey(new Date(), tz.value));
const monthLabel = computed(() => new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
function shift(d: number) { const t = new Date(Date.UTC(cur.value.y, cur.value.m - 1 + d, 1)); cur.value = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 }; }
function today() { const z = zonedParts(new Date(), tz.value); cur.value = { y: z.y, m: z.m }; selected.value = todayKey.value; }

// 6 weeks starting on Monday
const cells = computed(() => {
  const first = new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1 - lead + i));
    const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    return { key, day: d.getUTCDate(), inMonth: d.getUTCMonth() === cur.value.m - 1, past: key < todayKey.value };
  });
});
const ymd = (key: string) => key.split('-').map(Number) as [number, number, number];
const range = computed(() => {
  const [ay, am, ad] = ymd(cells.value[0]!.key); const [by, bm, bd] = ymd(cells.value[41]!.key);
  return { from: fromZoned(ay, am, ad, 0, 0, tz.value), to: fromZoned(by, bm, bd + 1, 0, 0, tz.value) };
});

const q = useQuery(async () => {
  const items: Post[] = [];
  for (let offset = 0; offset < 500; offset += 100) {
    const page = await api.get<Paged<Post>>('/post/', { teamId: session.teamId, postDateFrom: range.value.from.toISOString(), postDateTo: range.value.to.toISOString(), orderBy: 'postDate', order: 'ASC', limit: 100, offset });
    items.push(...page.items);
    if (items.length >= page.total || !page.items.length) break;
  }
  return items;
}, { deps: [range, () => session.teamId], enabled: () => !!session.teamId });

const when = (p: Post) => p.postedDate ?? p.postDate!;
const byDay = computed(() => {
  const m = new Map<string, Post[]>();
  for (const p of q.data.value ?? []) {
    if (p.status === 'DELETED') continue;
    const k = dayKey(new Date(when(p)), tz.value);
    (m.get(k) ?? m.set(k, []).get(k)!).push(p);
  }
  return m;
});
const selectedPosts = computed(() => byDay.value.get(selected.value) ?? []);
const selectedPast = computed(() => selected.value < todayKey.value);
const selectedLabel = computed(() => new Date(`${selected.value}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }));
const types = (p: Post) => [...new Set((p.socialAccounts ?? []).map((t) => t.socialAccount?.type).filter(Boolean) as string[])];
const tone = (s: string) => (s === 'POSTED' ? 'ok' : s === 'ERROR' ? 'bad' : s === 'DRAFT' ? 'draft' : s === 'PROCESSING' ? 'wait' : 'sched');

// New post on a day: 09:00, or the next whole hour when that has already passed today.
function newOn(key: string) {
  const [y, m, d] = ymd(key);
  let at = fromZoned(y, m, d, 9, 0, tz.value);
  if (at.getTime() < Date.now() + 10 * 60000) { const z = zonedParts(new Date(Date.now() + 70 * 60000), tz.value); at = fromZoned(z.y, z.m, z.d, z.h, 0, tz.value); }
  void router.push({ path: '/compose', query: { date: at.toISOString() } });
}

// Post detail opens in place (?post=id keeps it linkable).
const openId = computed(() => (route.query.post as string | undefined) ?? null);
function openPost(p: Post) { void router.replace({ query: { ...route.query, post: p.id } }); }
function closePost() { const { post: _p, ...rest } = route.query; void router.replace({ query: rest }); }

// Drag a draft or scheduled post to another day; the time of day stays the same.
const movable = (p: Post) => p.status === 'SCHEDULED' || p.status === 'DRAFT';
const dragging = ref<Post | null>(null);
const over = ref<string | null>(null);
function onDragStart(e: DragEvent, p: Post) { dragging.value = p; e.dataTransfer?.setData('text/plain', p.id); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; }
function onDragEnd() { dragging.value = null; over.value = null; }
async function onDrop(key: string) {
  const p = dragging.value; onDragEnd();
  if (!p || dayKey(new Date(when(p)), tz.value) === key) return;
  const t = zonedParts(new Date(p.postDate!), tz.value);
  const [y, m, d] = ymd(key);
  const at = fromZoned(y, m, d, t.h, t.min, tz.value);
  if (at.getTime() < Date.now()) { toast.error('That time has already passed', 'Drop it on today or a later day.'); return; }
  try {
    await api.patch(`/post/${p.id}`, { postDate: at.toISOString() });
    toast.success(`Moved to ${new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}, ${formatTime(at.toISOString(), tz.value)}`);
    selected.value = key; await q.reload();
  } catch (e) { toast.fail(e); }
}

// Arrow keys move the selected day; Enter opens the composer on it.
const grid = ref<HTMLElement | null>(null);
async function onKey(e: KeyboardEvent, key: string) {
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (e.key === 'Enter') { selected.value = key; return; }
  if (!step) return;
  e.preventDefault();
  const [y, m, d] = ymd(key);
  const n = new Date(Date.UTC(y, m - 1, d + step));
  const nk = `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`;
  selected.value = nk;
  if (!cells.value.some((c) => c.key === nk)) cur.value = { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1 };
  await nextTick();
  grid.value?.querySelector<HTMLElement>(`[data-key="${nk}"]`)?.focus();
}
const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const legend = [{ t: 'sched', l: 'Scheduled' }, { t: 'ok', l: 'Published' }, { t: 'bad', l: 'Failed' }, { t: 'draft', l: 'Draft' }];
</script>

<template>
  <div class="page wide">
    <PageHead title="Calendar" :subtitle="`Posts by day in ${tz.replace(/_/g, ' ')} time. Drag a scheduled post to move it.`">
      <Button variant="primary" :icon="Plus" @click="newOn(selected < todayKey ? todayKey : selected)">New post</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <template v-else>
      <div class="toolbar">
        <div class="nav">
          <Button iconOnly size="sm" label="Previous month" :icon="ChevronLeft" @click="shift(-1)" />
          <Button iconOnly size="sm" label="Next month" :icon="ChevronRight" @click="shift(1)" />
        </div>
        <h2 class="mlabel">{{ monthLabel }}</h2>
        <Button size="sm" @click="today">Today</Button>
        <span class="spacer" />
        <div class="legend">
          <span v-for="x in legend" :key="x.t" class="lg"><i class="sw" :class="x.t" />{{ x.l }}</span>
        </div>
      </div>
      <QueryState :loading="q.loading.value" :error="q.error.value" :status="q.status.value" :has-data="!!q.data.value" feature="The calendar" skeleton="block" @retry="q.reload">
        <div class="layout">
          <div ref="grid" class="cal" :class="{ busy: q.loading.value }" role="grid" :aria-label="monthLabel">
            <div v-for="d in dow" :key="d" class="dow" role="columnheader">{{ d }}</div>
            <div
              v-for="c in cells"
              :key="c.key"
              :data-key="c.key"
              class="cell"
              :class="{ out: !c.inMonth, past: c.past, today: c.key === todayKey, sel: c.key === selected, over: over === c.key && !c.past }"
              role="gridcell"
              :aria-selected="c.key === selected"
              :tabindex="c.key === selected ? 0 : -1"
              @click="selected = c.key"
              @keydown="onKey($event, c.key)"
              @dragover.prevent="over = c.key"
              @dragleave="over === c.key && (over = null)"
              @drop.prevent="onDrop(c.key)"
            >
              <div class="head"><span class="dn">{{ c.day }}</span><button v-if="!c.past" type="button" class="add" :aria-label="`New post on ${c.key}`" title="New post on this day" @click.stop="newOn(c.key)"><Plus :size="14" /></button></div>
              <button
                v-for="p in (byDay.get(c.key) ?? []).slice(0, 3)"
                :key="p.id"
                type="button"
                class="chip"
                :class="[tone(p.status), { drag: movable(p), lifting: dragging?.id === p.id }]"
                :draggable="movable(p)"
                :title="`${formatTime(when(p), tz)} · ${p.title ?? 'Untitled post'}`"
                @click.stop="openPost(p)"
                @dragstart="onDragStart($event, p)"
                @dragend="onDragEnd"
              >
                <span class="tm">{{ formatTime(when(p), tz) }}</span><span class="ti">{{ p.title || 'Untitled post' }}</span>
              </button>
              <button v-if="(byDay.get(c.key)?.length ?? 0) > 3" type="button" class="more" @click.stop="selected = c.key">+{{ byDay.get(c.key)!.length - 3 }} more</button>
              <span v-if="byDay.get(c.key)?.length" class="dots"><i v-for="p in byDay.get(c.key)!.slice(0, 4)" :key="p.id" class="d" :class="tone(p.status)" /></span>
            </div>
          </div>

          <aside class="agenda" aria-live="polite">
            <div class="ag-head">
              <div><div class="label">{{ selected === todayKey ? 'Today' : selectedPast ? 'Past day' : 'Selected day' }}</div><h3>{{ selectedLabel }}</h3></div>
              <Button v-if="!selectedPast" size="sm" :icon="Plus" @click="newOn(selected)">Post</Button>
            </div>
            <div v-if="!selectedPosts.length" class="ag-empty muted small">{{ selectedPast ? 'Nothing was published on this day.' : 'Nothing scheduled yet.' }}</div>
            <button v-for="p in selectedPosts" v-else :key="p.id" type="button" class="ag-item" @click="openPost(p)">
              <span class="tm2 num">{{ formatTime(when(p), tz) }}</span>
              <span class="grow body"><span class="t">{{ p.title || 'Untitled post' }}</span><span class="nets"><NetworkIcon v-for="t in types(p)" :key="t" :type="t" :size="16" /></span></span>
              <StatusBadge :status="p.status" size="sm" />
            </button>
          </aside>
        </div>
      </QueryState>
    </template>
    <PostDrawer :id="openId" @close="closePost" @changed="q.reload" />
  </div>
</template>

<style scoped>
.nav { display: inline-flex; gap: 4px; }
.mlabel { min-width: 150px; font-size: var(--fs-18); }
.legend { display: flex; gap: 14px; flex-wrap: wrap; }
.lg { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-12); color: var(--text-subtle); }
.sw { width: 8px; height: 8px; border-radius: 50%; background: var(--text); }
.sw.ok { background: var(--success); } .sw.bad { background: var(--danger); } .sw.draft { background: var(--text-faint); }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 20px; align-items: start; }
.cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-elevated); transition: opacity 200ms; }
.cal.busy { opacity: .6; }
.dow { padding: 8px 10px; font-family: var(--mono); font-size: var(--fs-11); line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--text-subtle); border-bottom: 1px solid var(--border); }
.cell { min-height: 116px; padding: 6px; border-right: 1px solid var(--border-soft); border-bottom: 1px solid var(--border-soft); display: flex; flex-direction: column; gap: 3px; cursor: pointer; min-width: 0; outline: none; container-type: inline-size; transition: background 160ms, box-shadow 160ms; }
/* narrow days: the title matters more than the time (the agenda and tooltip carry it) */
@container (max-width: 135px) { .tm { display: none; } }
.cell:nth-child(7n) { border-right: 0; }
.cell:nth-last-child(-n + 7) { border-bottom: 0; }
.cell:hover { background: var(--bg-hover); }
.cell.out { background: var(--bg-subtle); }
.cell.out .dn, .cell.past .dn { color: var(--text-faint); }
.cell.sel { box-shadow: inset 0 0 0 1.5px var(--text); }
.cell:focus-visible { box-shadow: inset 0 0 0 2px var(--text); }
.cell.over { background: var(--bg-muted); box-shadow: inset 0 0 0 1.5px dashed var(--text); outline: 1.5px dashed var(--text); outline-offset: -4px; }
.cell.today .dn { background: var(--text); color: var(--bg); }
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
.dn { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 5px; border-radius: 12px; font-size: var(--fs-13); font-weight: 500; font-variant-numeric: tabular-nums; }
.add { opacity: 0; border: 0; background: none; color: var(--text-subtle); cursor: pointer; border-radius: 50%; width: 24px; height: 24px; display: grid; place-items: center; transition: opacity 160ms, background 160ms; }
.cell:hover .add, .cell.sel .add, .add:focus-visible { opacity: 1; }
.add:hover { background: var(--bg-muted); color: var(--text); }
.chip { display: flex; gap: 5px; align-items: center; width: 100%; padding: 2px 6px; border: 0; border-left: 3px solid var(--text); border-radius: var(--radius-sm); font-size: var(--fs-12); line-height: 18px; color: var(--text); background: var(--bg-muted); text-align: left; cursor: pointer; min-width: 0; transition: filter 160ms, opacity 160ms; }
.chip:hover { filter: brightness(.96); }
.chip.drag { cursor: grab; }
.chip.lifting { opacity: .4; }
.chip.ok { border-left-color: var(--success); background: var(--success-soft); }
.chip.bad { border-left-color: var(--danger); background: var(--danger-soft); }
.chip.draft { border-left-color: var(--text-faint); background: transparent; box-shadow: inset 0 0 0 1px var(--border); }
.chip.wait { border-left-color: var(--warn); background: var(--warn-soft); }
.tm { color: var(--text-subtle); flex: none; font-variant-numeric: tabular-nums; }
.ti { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.more { border: 0; background: none; text-align: left; font-size: var(--fs-12); line-height: 16px; color: var(--text-subtle); cursor: pointer; padding: 0 6px; }
.more:hover { color: var(--text); text-decoration: underline; }
.dots { display: none; gap: 3px; }
.d { width: 6px; height: 6px; border-radius: 50%; background: var(--text); }
.d.ok { background: var(--success); } .d.bad { background: var(--danger); } .d.draft { background: var(--text-faint); } .d.wait { background: var(--warn); }
.agenda { position: sticky; top: calc(var(--topbar) + 16px); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); overflow: hidden; }
.ag-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 16px; border-bottom: 1px solid var(--border); }
.ag-head h3 { margin-top: 4px; }
.ag-empty { padding: 16px; }
.ag-item { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 12px 16px; border: 0; border-bottom: 1px solid var(--border-soft); background: none; color: var(--text); text-align: left; cursor: pointer; transition: background 160ms; }
.ag-item:last-child { border-bottom: 0; }
.ag-item:hover { background: var(--bg-hover); }
.tm2 { width: 42px; flex: none; font-size: var(--fs-13); color: var(--text-subtle); line-height: 20px; }
.body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.t { font-size: var(--fs-13); line-height: 18px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nets { display: flex; gap: 6px; }
@media (max-width: 1200px) { .layout { grid-template-columns: minmax(0, 1fr); } .agenda { position: static; } }
@media (max-width: 700px) {
  .cell { min-height: 56px; padding: 4px; }
  .chip, .more { display: none; }
  .dots { display: flex; flex-wrap: wrap; }
  .add { display: none; }
  .legend { display: none; }
}
</style>
