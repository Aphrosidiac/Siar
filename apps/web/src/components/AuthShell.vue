<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; wide?: boolean }>();
</script>
<template>
  <div class="auth">
    <div class="box" :class="{ wide }">
      <router-link to="/" class="brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)" /><path d="M10 20.5c1.4 1.3 3.4 2 5.8 2 3.2 0 5.2-1.5 5.2-3.8 0-2.1-1.4-3.1-4.6-3.8l-1.6-.3c-1.6-.3-2.2-.8-2.2-1.6 0-1 .9-1.6 2.5-1.6 1.6 0 2.9.6 3.9 1.6l1.8-2c-1.4-1.4-3.4-2.1-5.6-2.1-3.1 0-5.1 1.6-5.1 3.9 0 2 1.3 3.1 4.3 3.7l1.6.3c1.8.4 2.5.8 2.5 1.7 0 1-.9 1.7-2.7 1.7-1.8 0-3.3-.7-4.4-1.8L10 20.5z" fill="#fff" /></svg>
        <span>Siar</span>
      </router-link>
      <div class="card">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="muted mt-8">{{ subtitle }}</p>
        <div class="mt-24"><slot /></div>
      </div>
      <div class="below small muted"><slot name="below" /></div>
      <div class="tiny faint foot">Siar by FF Dev Studio</div>
    </div>
  </div>
</template>
<style scoped>
.auth { min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; background: var(--bg-subtle); }
.box { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
.box.wide { max-width: 520px; }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: var(--fs-20); color: var(--text); text-decoration: none; justify-content: center; }
.brand:hover { text-decoration: none; }
.card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm); }
.below { text-align: center; }
.foot { text-align: center; }
@media (max-width: 480px) { .card { padding: 24px 16px; } }
</style>
