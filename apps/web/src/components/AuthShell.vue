<script setup lang="ts">
import Logo from './Logo.vue';
defineProps<{ title: string; subtitle?: string; wide?: boolean }>();
</script>
<template>
  <div class="auth">
    <div class="box" :class="{ wide }">
      <router-link to="/" class="brand">
        <Logo :size="22" />
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
.auth { min-height: 100vh; display: grid; place-items: center; padding: 40px 16px; background: var(--bg); }
.box { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 20px; animation: rise var(--t-reveal) var(--ease-out) backwards; }
.box.wide { max-width: 520px; }
.brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: var(--fs-18); letter-spacing: -0.02em; color: var(--text); text-decoration: none; }
.card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; }
.card h1 { font-size: var(--fs-24); line-height: 30px; }
.below { text-align: left; }
.foot { text-align: left; }
@media (max-width: 480px) { .card { padding: 20px 16px; } }
</style>
