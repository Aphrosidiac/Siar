<script setup lang="ts">
import { computed } from 'vue';
import Badge from './ui/Badge.vue';
const props = defineProps<{ status: string | null | undefined; size?: 'sm' | 'md' }>();
const tone = computed(() => {
  switch (props.status) {
    case 'POSTED': case 'COMPLETED': case 'CONNECTED': case 'SUCCESS': case 'active': case 'paid': case 'SENT': case 'DELIVERED': case 'SEEN': return 'success';
    case 'ERROR': case 'FAILED': case 'NEEDS_RECONNECT': case 'past_due': case 'unpaid': case 'DISCONNECTED': return 'danger';
    case 'SCHEDULED': case 'trialing': return 'info';
    case 'PROCESSING': case 'RETRYING': case 'REVIEW': case 'PENDING': case 'FETCHING': case 'FETCHING_POSTS': case 'FETCHING_ANALYTICS': case 'FETCHING_REVIEWS': case 'RATE_LIMITED': case 'COMPLETED_WITH_ERRORS': return 'warn';
    default: return 'neutral';
  }
});
const label = computed(() => {
  const s = props.status ?? 'unknown';
  if (s === 'NEEDS_RECONNECT') return 'Needs reconnect';
  if (s === 'PENDING') return 'Pending';
  return s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
});
</script>
<template><Badge :tone="tone" :size="size">{{ label }}</Badge></template>
