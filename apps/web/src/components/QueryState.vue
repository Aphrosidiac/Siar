<script setup lang="ts">
import { computed } from 'vue';
import { Construction, Lock, TriangleAlert } from 'lucide-vue-next';
import EmptyState from './ui/EmptyState.vue';
import Button from './ui/Button.vue';
import Skeleton from './ui/Skeleton.vue';

/**
 * Wraps a loaded region: skeleton while loading, a calm "not on this server yet" for 501,
 * a permission note for 403, and a retryable error otherwise.
 */
const props = withDefaults(defineProps<{ loading: boolean; error?: string | null; status?: number | null; hasData?: boolean; feature?: string; skeleton?: 'list' | 'cards' | 'block'; betaMessage?: string }>(), { skeleton: 'list' });
const emit = defineEmits<{ retry: [] }>();
const showSkeleton = computed(() => props.loading && !props.hasData);
</script>
<template>
  <div v-if="showSkeleton" class="qs">
    <div v-if="skeleton === 'cards'" class="grid-3">
      <div v-for="i in 6" :key="i" class="skeleton" style="height: 120px" />
    </div>
    <div v-else-if="skeleton === 'block'" class="skeleton" style="height: 220px" />
    <div v-else class="stack">
      <div v-for="i in 5" :key="i" class="sk-row"><div class="skeleton" style="width: 36px; height: 36px" /><Skeleton :lines="2" /></div>
    </div>
  </div>
  <EmptyState v-else-if="error && status === 501" :icon="Construction" :title="`${feature ?? 'This feature'} is not available on this server yet`" description="The API answered 501 for this part of the contract. It turns on as soon as the server implements it — nothing to configure here.">
    <Button size="sm" @click="emit('retry')">Check again</Button>
  </EmptyState>
  <EmptyState v-else-if="error && status === 403" :icon="Lock" :title="betaMessage ? `${feature ?? 'This feature'} is in beta` : 'You don’t have access to this'" :description="betaMessage ?? error ?? ''" />
  <EmptyState v-else-if="error" :icon="TriangleAlert" title="Couldn’t load this" :description="error">
    <Button size="sm" @click="emit('retry')">Try again</Button>
  </EmptyState>
  <slot v-else />
</template>
<style scoped>
.sk-row { display: flex; gap: 12px; align-items: center; padding: 8px 0; }
</style>
