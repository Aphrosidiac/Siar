<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { RouterView } from 'vue-router';
import { CloudOff } from 'lucide-vue-next';
import Toast from '@/components/ui/Toast.vue';
import ConfirmHost from '@/components/ConfirmHost.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Button from '@/components/ui/Button.vue';
import { boot } from '@/lib/boot';

// a quick first route shows nothing extra; a slow one says it is loading rather than sitting blank
const slow = ref(false);
const timer = window.setTimeout(() => { slow.value = true; }, 700);
onBeforeUnmount(() => window.clearTimeout(timer));

const retry = () => location.assign(boot.target ?? location.href);
</script>
<template>
  <div v-if="boot.error" class="boot">
    <EmptyState :icon="CloudOff" title="Siar did not load" :description="boot.error">
      <Button variant="primary" @click="retry">Try again</Button>
    </EmptyState>
  </div>
  <div v-else-if="!boot.ready && slow" class="boot" role="status"><p class="muted">Loading Siar…</p></div>
  <RouterView />
  <Toast />
  <ConfirmHost />
</template>
<style scoped>
.boot { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
</style>
