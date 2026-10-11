<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage, isApiError, issuesByPath } from '@/lib/api';

const route = useRoute();
const token = String(route.query.token ?? '');
const password = ref(''); const busy = ref(false); const done = ref(false); const error = ref(''); const fieldErr = ref('');
async function submit() {
  busy.value = true; error.value = ''; fieldErr.value = '';
  try { await api.post('/auth/reset-password', { token, password: password.value }, { noAuthRedirect: true }); done.value = true; }
  catch (e) { error.value = errorMessage(e); if (isApiError(e)) fieldErr.value = issuesByPath(e.issues).password ?? ''; } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Choose a new password">
    <div v-if="!token" class="callout danger">This reset link is missing its token. Request a new one.</div>
    <div v-else-if="done" class="stack-16"><div class="callout success" role="status">Your password was changed. You can sign in now.</div><Button to="/login" variant="primary" block>Sign in</Button></div>
    <form v-else class="stack-16" @submit.prevent="submit">
      <div v-if="error && !fieldErr" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="password" label="New password" type="password" required autofocus autocomplete="new-password" :error="fieldErr" help="At least 10 characters." />
      <Button type="submit" variant="primary" block :loading="busy">Change password</Button>
    </form>
    <template #below><router-link to="/forgot-password">Request a new link</router-link></template>
  </AuthShell>
</template>
