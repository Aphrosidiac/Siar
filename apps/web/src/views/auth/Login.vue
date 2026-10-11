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
  <AuthShell title="Sign in to Siar" subtitle="One API to publish, schedule and measure across 15 networks.">
    <form class="stack-16" @submit.prevent="submit">
      <div v-if="error" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="email" label="Email" type="email" autocomplete="email" required autofocus />
      <Input v-model="password" label="Password" type="password" autocomplete="current-password" required />
      <div class="row between small"><span /><router-link to="/forgot-password">Forgot password?</router-link></div>
      <Button type="submit" variant="primary" block :loading="busy">Sign in</Button>
    </form>
    <template #below>New to Siar? <router-link to="/signup">Create an account</router-link></template>
  </AuthShell>
</template>
