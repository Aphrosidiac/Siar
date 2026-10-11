<script setup lang="ts" generic="R extends Record<string, any>">
interface Column { key: string; label: string; width?: string; align?: 'left' | 'right' | 'center'; hideSm?: boolean }
const props = withDefaults(defineProps<{ columns: Column[]; rows: R[]; loading?: boolean; rowKey?: string; clickable?: boolean; skeletonRows?: number }>(), { rowKey: 'id', skeletonRows: 5 });
const emit = defineEmits<{ rowClick: [row: R] }>();
const onKey = (e: KeyboardEvent, r: R) => { if (props.clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); emit('rowClick', r); } };
</script>

<template>
  <div class="tw">
    <table class="t">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" :style="{ width: c.width, textAlign: c.align ?? 'left' }" :class="{ 'hide-sm': c.hideSm }">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody v-if="loading && !rows.length">
        <tr v-for="i in skeletonRows" :key="i">
          <td v-for="c in columns" :key="c.key" :class="{ 'hide-sm': c.hideSm }"><div class="skeleton" style="height: 14px; width: 70%" /></td>
        </tr>
      </tbody>
      <tbody v-else-if="rows.length">
        <tr
          v-for="(r, i) in rows"
          :key="(r[rowKey] as string) ?? i"
          :class="{ clickable }"
          :tabindex="clickable ? 0 : undefined"
          @click="clickable && emit('rowClick', r)"
          @keydown="onKey($event, r)"
        >
          <td v-for="c in columns" :key="c.key" :style="{ textAlign: c.align ?? 'left' }" :class="{ 'hide-sm': c.hideSm }">
            <slot :name="`cell-${c.key}`" :row="r" :value="r[c.key]">{{ r[c.key] ?? '—' }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading && !rows.length" class="empty"><slot name="empty" /></div>
  </div>
</template>

<style scoped>
.tw { width: 100%; overflow-x: auto; border-top: 1px solid var(--text); }
.t { width: 100%; border-collapse: collapse; font-size: var(--fs-14); }
th { text-align: left; font-family: var(--mono); font-weight: 500; font-size: var(--fs-11); line-height: 16px; color: var(--text-subtle); text-transform: uppercase; letter-spacing: .06em; padding: 10px 12px; border-bottom: 1px solid var(--border); white-space: nowrap; }
th:first-child, td:first-child { padding-left: 0; }
th:last-child, td:last-child { padding-right: 0; }
td { padding: 14px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr { animation: rise 420ms var(--ease-out) backwards; }
tbody tr:nth-child(2) { animation-delay: 25ms; } tbody tr:nth-child(3) { animation-delay: 50ms; } tbody tr:nth-child(4) { animation-delay: 75ms; }
tbody tr:nth-child(n + 5) { animation-delay: 100ms; }
tr.clickable { cursor: pointer; }
tr.clickable td { transition: background var(--t-micro); }
tr.clickable:hover td { background: var(--bg-hover); }
tr.clickable:focus-visible { outline: none; box-shadow: inset 2px 0 0 var(--text); }
.empty:not(:empty) { padding: 8px 0 0; }
.empty :deep(.empty) { border-top: 0; }
@media (max-width: 640px) { .hide-sm { display: none; } td, th { padding-left: 8px; padding-right: 8px; } }
</style>
