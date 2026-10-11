<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Button from '@/components/ui/Button.vue';
import Spinner from '@/components/ui/Spinner.vue';
import { api, errorMessage } from '@/lib/api';
import { loadSession, session } from '@/lib/store';

const route = useRoute();
const state = ref<'working' | 'ok' | 'fail'>('working'); const error = ref('');
onMounted(async () => {
  const token = String(route.query.token ?? '');
  if (!token) { state.value = 'fail'; error.value = 'This link is missing its token.'; return; }
  try { await api.post('/auth/verify-email', { token }, { noAuthRedirect: true }); state.value = 'ok'; if (session.me) await loadSession(true); }
  catch (e) { state.value = 'fail'; error.value = errorMessage(e); }
});
</script>
<template>
  <AuthShell title="Confirm your email">
    <div v-if="state === 'working'" class="row"><Spinner /> Confirming…</div>
    <div v-else-if="state === 'ok'" class="stack-16"><div class="callout success" role="status">Your email address is confirmed.</div><Button :to="session.me ? '/posts' : '/login'" variant="primary" block>{{ session.me ? 'Go to the dashboard' : 'Sign in' }}</Button></div>
    <div v-else class="stack-16"><div class="callout danger" role="alert">{{ error }}</div><p class="muted small">Sign in and use “Resend email” at the top of the dashboard to get a fresh link.</p><Button to="/login" block>Sign in</Button></div>
  </AuthShell>
</template>
