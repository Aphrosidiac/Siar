<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next';
import { dismiss, toasts } from '@/lib/toast';
</script>
<template>
  <div class="host" aria-live="polite" role="region" aria-label="Notifications">
    <TransitionGroup name="t">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tone" :role="t.tone === 'error' ? 'alert' : 'status'">
        <CircleCheck v-if="t.tone === 'success'" :size="18" class="ic" />
        <CircleAlert v-else-if="t.tone === 'error'" :size="18" class="ic" />
        <Info v-else :size="18" class="ic" />
        <div class="grow">
          <div class="title">{{ t.title }}</div>
          <div v-if="t.body" class="body">{{ t.body }}</div>
        </div>
        <button type="button" class="x" aria-label="Dismiss" @click="dismiss(t.id)"><X :size="14" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>
<style scoped>
.host { position: fixed; right: 16px; bottom: 16px; z-index: 80; display: flex; flex-direction: column; gap: 8px; width: min(380px, calc(100vw - 32px)); }
.toast { display: flex; gap: 10px; align-items: flex-start; padding: 12px 12px 12px 14px; border-radius: var(--radius); background: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow); }
.ic { flex: none; margin-top: 1px; }
.success .ic { color: var(--success); }
.error .ic { color: var(--danger); }
.info .ic { color: var(--accent); }
.title { font-weight: 500; font-size: var(--fs-14); line-height: 20px; word-break: break-word; }
.body { color: var(--text-subtle); font-size: var(--fs-13); line-height: 18px; margin-top: 2px; word-break: break-word; }
.x { border: 0; background: none; color: var(--text-faint); cursor: pointer; padding: 2px; border-radius: 4px; }
.x:hover { color: var(--text); background: var(--bg-hover); }
.t-enter-active, .t-leave-active { transition: all 0.18s; }
.t-enter-from, .t-leave-to { opacity: 0; transform: translateY(8px); }
</style>
