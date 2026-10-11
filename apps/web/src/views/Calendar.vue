<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Button from '@/components/ui/Button.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session, timezone } from '@/lib/store';
import { dayKey, formatTime, fromZoned, pad, zonedParts } from '@/lib/format';
import type { Paged, Post } from '@/lib/types';

const router = useRouter();
const now = zonedParts(new Date(), timezone.value);
const cur = ref({ y: now.y, m: now.m });
const selected = ref<string>(dayKey(new Date(), timezone.value));
const monthLabel = computed(() => new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }));
function shift(d: number) { const t = new Date(Date.UTC(cur.value.y, cur.value.m - 1 + d, 1)); cur.value = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 }; }
function today() { const z = zonedParts(new Date(), timezone.value); cur.value = { y: z.y, m: z.m }; selected.value = dayKey(new Date(), timezone.value); }

// 6 weeks starting on Monday
const cells = computed(() => {
  const first = new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1 - lead + i));
    return { key: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, day: d.getUTCDate(), inMonth: d.getUTCMonth() === cur.value.m - 1, y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
  });
});
const range = computed(() => {
  const a = cells.value[0]!, b = cells.value[41]!;
  return { from: fromZoned(a.y, a.m, Number(a.key.slice(8)), 0, 0, timezone.value), to: fromZoned(b.y, b.m, Number(b.key.slice(8)) + 1, 0, 0, timezone.value) };
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

const byDay = computed(() => {
  const m = new Map<string, Post[]>();
  for (const p of q.data.value ?? []) {
    if (p.status === 'DELETED') continue;
    const k = dayKey(new Date(p.postedDate ?? p.postDate!), timezone.value);
    (m.get(k) ?? m.set(k, []).get(k)!).push(p);
  }
  return m;
});
const todayKey = computed(() => dayKey(new Date(), timezone.value));
const selectedPosts = computed(() => byDay.value.get(selected.value) ?? []);
const types = (p: Post) => [...new Set((p.socialAccounts ?? []).map((t) => t.socialAccount?.type).filter(Boolean) as string[])];
function newOn(key: string) {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  void router.push({ path: '/compose', query: { date: fromZoned(y, m, d, 9, 0, timezone.value).toISOString() } });
}
watch(() => session.teamId, () => { /* useQuery reloads */ });
const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const tone = (s: string) => (s === 'POSTED' ? 'ok' : s === 'ERROR' ? 'bad' : s === 'DRAFT' ? 'draft' : 'sched');
</script>

<template>
  <div class="page wide">
    <PageHead title="Calendar" subtitle="Scheduled and published posts by day, in your timezone.">
      <Button variant="primary" :icon="Plus" to="/compose">New post</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <template v-else>
      <div class="toolbar">
        <Button iconOnly label="Previous month" :icon="ChevronLeft" @click="shift(-1)" />
        <h2 class="mlabel">{{ monthLabel }}</h2>
        <Button iconOnly label="Next month" :icon="ChevronRight" @click="shift(1)" />
        <Button size="sm" @click="today">Today</Button>
        <span class="spacer" />
        <span class="small muted">{{ timezone.replace(/_/g, ' ') }}</span>
      </div>
      <QueryState :loading="q.loading.value" :error="q.error.value" :status="q.status.value" :has-data="!!q.data.value" feature="The calendar" skeleton="block" @retry="q.reload">
        <div class="cal" role="grid" :aria-label="monthLabel">
          <div v-for="d in dow" :key="d" class="dow" role="columnheader">{{ d }}</div>
          <div v-for="c in cells" :key="c.key" class="cell" :class="{ out: !c.inMonth, today: c.key === todayKey, sel: c.key === selected }" role="gridcell" tabindex="0" @click="selected = c.key" @keydown.enter="selected = c.key">
            <div class="row between"><span class="dn">{{ c.day }}</span><button type="button" class="add" :aria-label="`New post on ${c.key}`" @click.stop="newOn(c.key)"><Plus :size="14" /></button></div>
            <router-link v-for="p in (byDay.get(c.key) ?? []).slice(0, 3)" :key="p.id" :to="`/posts/${p.id}`" class="chip" :class="tone(p.status)" @click.stop>
              <span class="tm">{{ formatTime(p.postedDate ?? p.postDate, timezone) }}</span>
              <span class="ti truncate">{{ p.title }}</span>
            </router-link>
            <button v-if="(byDay.get(c.key)?.length ?? 0) > 3" type="button" class="more" @click.stop="selected = c.key">+{{ byDay.get(c.key)!.length - 3 }} more</button>
            <span v-if="byDay.get(c.key)?.length" class="dots"><i v-for="p in byDay.get(c.key)!.slice(0, 4)" :key="p.id" class="d" :class="tone(p.status)" /></span>
          </div>
        </div>

        <section class="mt-24">
          <div class="row between mb-8"><h3>{{ new Date(selected + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) }}</h3><Button size="sm" :icon="Plus" @click="newOn(selected)">Post on this day</Button></div>
          <div v-if="!selectedPosts.length" class="muted small">Nothing scheduled for this day.</div>
          <div v-else class="panel-list">
            <router-link v-for="p in selectedPosts" :key="p.id" :to="`/posts/${p.id}`" class="item lnk">
              <span class="small muted nowrap" style="width: 48px">{{ formatTime(p.postedDate ?? p.postDate, timezone) }}</span>
              <span class="grow truncate">{{ p.title }}</span>
              <span class="row gap-4"><NetworkIcon v-for="t in types(p)" :key="t" :type="t" :size="20" /></span>
              <StatusBadge :status="p.status" size="sm" />
            </router-link>
          </div>
        </section>
      </QueryState>
    </template>
  </div>
</template>

<style scoped>
.mlabel { min-width: 180px; text-align: center; }
.cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--bg); }
.dow { padding: 8px; font-size: var(--fs-12); line-height: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-subtle); background: var(--bg-subtle); border-bottom: 1px solid var(--border); }
.cell { min-height: 112px; padding: 6px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 3px; cursor: pointer; min-width: 0; }
.cell:nth-child(7n) { border-right: 0; }
.cell.out { background: var(--bg-subtle); }
.cell.out .dn { color: var(--text-faint); }
.cell.sel { box-shadow: inset 0 0 0 2px var(--accent); }
.cell.today .dn { background: var(--accent); color: var(--accent-fg); }
.dn { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 4px; border-radius: 12px; font-size: var(--fs-13); font-weight: 500; }
.add { opacity: 0; border: 0; background: none; color: var(--text-subtle); cursor: pointer; border-radius: var(--radius-sm); width: 22px; height: 22px; display: grid; place-items: center; }
.cell:hover .add, .cell:focus-within .add { opacity: 1; }
.add:hover { background: var(--bg-hover); color: var(--text); }
.chip { display: flex; gap: 4px; align-items: center; padding: 1px 6px; border-radius: var(--radius-sm); font-size: var(--fs-12); line-height: 18px; color: var(--text); text-decoration: none; border-left: 3px solid var(--accent); background: var(--accent-soft); min-width: 0; }
.chip:hover { text-decoration: none; filter: brightness(0.97); }
.chip.ok { border-color: var(--success); background: var(--success-soft); }
.chip.bad { border-color: var(--danger); background: var(--danger-soft); }
.chip.draft { border-color: var(--text-faint); background: var(--bg-muted); }
.tm { color: var(--text-subtle); flex: none; }
.more { border: 0; background: none; text-align: left; font-size: var(--fs-12); line-height: 16px; color: var(--accent); cursor: pointer; padding: 0 6px; }
.dots { display: none; gap: 3px; }
.d { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.d.ok { background: var(--success); } .d.bad { background: var(--danger); } .d.draft { background: var(--text-faint); }
.lnk { color: var(--text); text-decoration: none; } .lnk:hover { background: var(--bg-hover); text-decoration: none; }
@media (max-width: 700px) {
  .cell { min-height: 56px; padding: 4px; }
  .chip, .more { display: none; }
  .dots { display: flex; flex-wrap: wrap; }
  .add { display: none; }
}
</style>
