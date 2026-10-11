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
.host { position: fixed; right: 16px; bottom: 16px; z-index: var(--z-toast); display: flex; flex-direction: column; gap: 8px; width: min(380px, calc(100vw - 32px)); }
.toast { display: flex; gap: 10px; align-items: flex-start; padding: 12px 12px 12px 14px; border-radius: var(--radius-lg); background: var(--text); color: var(--bg); box-shadow: var(--shadow-lg); }
.ic { flex: none; margin-top: 1px; opacity: .8; }
.error .ic { color: var(--danger); opacity: 1; }
.title { font-weight: 500; font-size: var(--fs-14); line-height: 20px; word-break: break-word; }
.body { opacity: .72; font-size: var(--fs-13); line-height: 18px; margin-top: 2px; word-break: break-word; }
.x { border: 0; background: none; color: inherit; opacity: .6; cursor: pointer; padding: 2px; border-radius: 4px; }
.x:hover { opacity: 1; }
.t-move { transition: transform 360ms var(--ease-out); }
.t-enter-active { transition: opacity 320ms var(--ease-out), transform 420ms var(--ease-out); }
.t-leave-active { transition: opacity 180ms var(--ease-cut), transform 220ms var(--ease-cut); }
.t-enter-from { opacity: 0; transform: translateY(14px) scale(.97); }
.t-leave-to { opacity: 0; transform: translateX(32px); }
</style>
