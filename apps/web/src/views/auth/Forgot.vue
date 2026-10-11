<script setup lang="ts">
import { ref } from 'vue';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage } from '@/lib/api';

const email = ref(''); const busy = ref(false); const sent = ref(false); const error = ref('');
async function submit() {
  busy.value = true; error.value = '';
  try { await api.post('/auth/forgot-password', { email: email.value.trim() }, { noAuthRedirect: true }); sent.value = true; } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Forgot your password?" subtitle="Enter your email and we will send you a link to choose a new one.">
    <div v-if="sent" class="callout success" role="status">If an account exists for {{ email }}, a reset link is on its way. The link works for one hour.</div>
    <form v-else class="stack-16" @submit.prevent="submit">
      <div v-if="error" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="email" label="Email" type="email" required autofocus autocomplete="email" />
      <Button type="submit" variant="primary" block :loading="busy">Send reset link</Button>
    </form>
    <template #below><router-link to="/login">Back to sign in</router-link></template>
  </AuthShell>
</template>
