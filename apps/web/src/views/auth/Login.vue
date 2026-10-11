<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage } from '@/lib/api';
import { loadSession } from '@/lib/store';

const route = useRoute(); const router = useRouter();
const email = ref(''); const password = ref(''); const busy = ref(false); const error = ref('');
async function submit() {
  busy.value = true; error.value = '';
  try {
    await api.post('/auth/login', { email: email.value.trim(), password: password.value }, { noAuthRedirect: true });
    await loadSession(true);
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/') ? route.query.next : '/posts';
    await router.replace(next);
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Welcome back." subtitle="Sign in to your Siar dashboard.">
    <template #switch>New to Siar? <router-link to="/signup">Create an account</router-link></template>
    <form class="stack-16" @submit.prevent="submit">
      <div v-if="error" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@company.com" required autofocus />
      <div class="pw">
        <Input v-model="password" label="Password" type="password" autocomplete="current-password" required />
        <router-link to="/forgot-password" class="forgot small">Forgot password?</router-link>
      </div>
      <Button type="submit" variant="primary" block :loading="busy">Sign in <span aria-hidden="true">→</span></Button>
    </form>
  </AuthShell>
</template>
<style scoped>
.pw { position: relative; }
.forgot { position: absolute; top: 0; right: 0; line-height: 18px; color: var(--text-subtle); }
.forgot:hover { color: var(--text); }
</style>
