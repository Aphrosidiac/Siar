<script setup lang="ts">
import NetworkIcon from './NetworkIcon.vue';
import type { PostTarget } from '@/lib/types';
/** A row of network icons, each marked with its per-network publishing state. */
defineProps<{ targets: PostTarget[]; size?: number }>();
const tone = (s?: string | null) => (s === 'POSTED' ? 'ok' : s === 'ERROR' ? 'bad' : s === 'PROCESSING' || s === 'REVIEW' ? 'wait' : 'idle');
</script>
<template>
  <span class="pn">
    <span v-for="t in targets" :key="t.socialAccountId" class="cell" :class="tone(t.status)" :title="`${t.socialAccount?.type ?? ''}: ${t.status ?? 'PENDING'}`">
      <NetworkIcon :type="t.socialAccount?.type ?? ''" :size="size ?? 24" :title="false" />
      <span class="mark" />
    </span>
  </span>
</template>
<style scoped>
.pn { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.cell { position: relative; display: inline-flex; }
.mark { position: absolute; right: -3px; bottom: -3px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg); background: var(--text-faint); }
.ok .mark { background: var(--success); }
.bad .mark { background: var(--danger); }
.wait .mark { background: var(--warn); }
.idle .mark { background: var(--border-strong); }
</style>
