<script setup lang="ts">
/**
 * Every signed-out screen (sign in, sign up, reset, verify, invite): the form on paper beside an ink
 * panel that carries the pitch, the same language as the marketing site. The panel drops away on
 * narrow screens; the form never moves.
 */
import { computed } from 'vue';
import Logo from './Logo.vue';
import AuthFan from './AuthFan.vue';
defineProps<{ title: string; subtitle?: string; wide?: boolean }>();
// the marketing site: app.<domain> → <domain>; the dev site on :4290
const site = computed(() => {
  const h = location.hostname;
  return h.startsWith('app.') ? `${location.protocol}//${h.slice(4)}` : `${location.protocol}//${h}:4290`;
});
</script>

<template>
  <div class="auth">
    <main class="side form-side">
      <header class="top">
        <a :href="site" class="brand" aria-label="Siar home"><Logo :size="22" /></a>
        <div class="switch small"><slot name="switch" /></div>
      </header>
      <div class="body" :class="{ wide }">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="lead">{{ subtitle }}</p>
        <div class="content"><slot /></div>
        <div class="below small"><slot name="below" /></div>
      </div>
      <footer class="foot tiny">
        <span>Siar by FF Dev Studio</span>
        <a :href="`${site}/terms`">Terms</a>
        <a :href="`${site}/privacy`">Privacy</a>
        <a :href="`${site}/docs`">Docs</a>
      </footer>
    </main>
    <aside class="side art" aria-hidden="true">
      <p class="kicker"><span>siar</span> /ˈsi.ar/ <i></i> Malay, to broadcast</p>
      <div class="fan-wrap"><AuthFan /></div>
      <div class="pitch">
        <p class="headline">Write it once.<br />Siar it everywhere.</p>
        <ul>
          <li><b>15 networks</b><span>One API, one dashboard</span></li>
          <li><b>Unlimited</b><span>Connected accounts</span></li>
          <li><b>One price</b><span>Per organization</span></li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.auth { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr); background: var(--bg); }

.form-side { display: flex; flex-direction: column; padding: 28px clamp(20px, 5vw, 64px); }
.top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.brand { display: inline-flex; color: var(--text); text-decoration: none; }
.switch { color: var(--text-subtle); text-align: right; }
.switch :deep(a) { color: var(--text); font-weight: 500; text-underline-offset: 3px; }

.body { width: 100%; max-width: 400px; margin: auto; padding: 56px 0; animation: rise var(--t-reveal) var(--ease-out) backwards; }
.body.wide { max-width: 520px; }
h1 { font-size: clamp(32px, 3.4vw, 44px); line-height: 1.02; letter-spacing: -0.045em; font-weight: 600; margin: 0; text-wrap: balance; }
.lead { margin: 14px 0 0; font-size: var(--fs-16); line-height: 24px; color: var(--text-muted); text-wrap: pretty; }
.content { margin-top: 32px; }
.below { margin-top: 24px; color: var(--text-subtle); }
.below:empty { display: none; }
.below :deep(a) { color: var(--text); font-weight: 500; }

.foot { display: flex; flex-wrap: wrap; gap: 6px 18px; color: var(--text-faint); }
.foot a { color: var(--text-faint); text-decoration: none; }
.foot a:hover { color: var(--text); }

/* the ink panel: same in both themes */
.art { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; padding: 40px clamp(32px, 4vw, 64px) 48px; background: #0b0b0a; color: #f3efe4; }
:global(:root[data-theme='dark']) .art { background: #161614; box-shadow: inset 1px 0 0 #2a2a27; }
.kicker { margin: 0; display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: var(--fs-12); letter-spacing: .08em; text-transform: uppercase; color: #a19d92; }
.kicker span { color: #f3efe4; }
.kicker i { width: 28px; height: 1px; background: currentColor; opacity: .5; }
.fan-wrap { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; }
.fan-wrap :deep(.fan) { width: auto; height: min(52vh, 460px); max-width: 100%; }
.headline { margin: 0 0 28px; font-size: clamp(30px, 3vw, 44px); line-height: 1; letter-spacing: -0.05em; font-weight: 600; }
.pitch ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid rgba(243, 239, 228, .9); }
.pitch li { margin: 0; padding: 14px 16px 0 0; display: flex; flex-direction: column; gap: 4px; }
.pitch li + li { padding-left: 16px; border-left: 1px solid #2a2a27; }
.pitch b { font-size: var(--fs-16); font-weight: 600; letter-spacing: -0.01em; }
.pitch span { font-size: var(--fs-13); color: #a19d92; }

@media (max-width: 960px) {
  .auth { grid-template-columns: minmax(0, 1fr); }
  .art { display: none; }
}
@media (max-width: 480px) {
  .form-side { padding: 20px 16px; }
  .body { padding: 40px 0; }
  .switch .label-long { display: none; }
}
</style>
