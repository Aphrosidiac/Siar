<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage, isApiError, issuesByPath } from '@/lib/api';
import { loadSession } from '@/lib/store';

const router = useRouter();
// one name field: names don't split into first/last the same way everywhere
const f = reactive({ name: '', email: '', password: '' });
const busy = ref(false); const error = ref(''); const fields = ref<Record<string, string>>({});
const pwOk = computed(() => f.password.length >= 10);
const site = location.hostname.startsWith('app.') ? `${location.protocol}//${location.hostname.slice(4)}` : `${location.protocol}//${location.hostname}:4290`;
async function submit() {
  busy.value = true; error.value = ''; fields.value = {};
  try {
    await api.post('/auth/signup', { email: f.email.trim(), password: f.password, firstName: f.name.trim().replace(/\s+/g, ' ') }, { noAuthRedirect: true });
    await loadSession(true);
    await router.replace('/welcome');
  } catch (e) {
    error.value = errorMessage(e);
    if (isApiError(e)) { const by = issuesByPath(e.issues); fields.value = { ...by, ...(by.firstName ? { name: by.firstName } : {}) }; }
  } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Start publishing everywhere." subtitle="Create your free account. 20 free posts to try, no card needed.">
    <template #switch>Have an account? <router-link to="/login">Sign in</router-link></template>
    <form class="stack-16" novalidate @submit.prevent="submit">
      <div v-if="error && !Object.keys(fields).length" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="f.name" label="Full name" required autocomplete="name" :error="fields.name" autofocus />
      <Input v-model="f.email" label="Work email" type="email" required autocomplete="email" placeholder="you@company.com" :error="fields.email" />
      <div>
        <Input v-model="f.password" label="Password" type="password" required autocomplete="new-password" :error="fields.password" />
        <p v-if="!fields.password" class="pw small" :class="{ ok: pwOk }"><span class="tick" aria-hidden="true">{{ pwOk ? '✓' : '·' }}</span>At least 10 characters</p>
      </div>
      <Button type="submit" variant="primary" block :loading="busy">Create account <span aria-hidden="true">→</span></Button>
      <p class="terms tiny">By creating an account you agree to the <a :href="`${site}/terms`">Terms</a> and <a :href="`${site}/privacy`">Privacy Policy</a>.</p>
    </form>
  </AuthShell>
</template>
<style scoped>
.pw { margin: 8px 0 0; display: flex; align-items: center; gap: 6px; color: var(--text-subtle); transition: color var(--t-micro); }
.pw.ok { color: var(--success); }
.tick { width: 14px; text-align: center; font-weight: 600; }
.terms { margin: 0; color: var(--text-subtle); line-height: 18px; }
.terms a { color: var(--text-muted); }
</style>
