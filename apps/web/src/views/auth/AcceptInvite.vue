<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage, isApiError, issuesByPath } from '@/lib/api';
import { loadSession } from '@/lib/store';

const route = useRoute(); const router = useRouter();
const token = String(route.query.token ?? '');
const firstName = ref(''); const password = ref(''); const busy = ref(false); const error = ref(''); const fields = ref<Record<string, string>>({});
async function submit() {
  busy.value = true; error.value = ''; fields.value = {};
  try {
    await api.post('/user/invitations/accept', { token, ...(password.value ? { password: password.value } : {}), ...(firstName.value.trim() ? { firstName: firstName.value.trim() } : {}) }, { noAuthRedirect: true });
    await loadSession(true);
    await router.replace('/posts');
  } catch (e) { error.value = errorMessage(e); if (isApiError(e)) fields.value = issuesByPath(e.issues); } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Accept your invitation" subtitle="You were invited to join an organization on Siar.">
    <div v-if="!token" class="callout danger">This invitation link is missing its token.</div>
    <form v-else class="stack-16" @submit.prevent="submit">
      <div v-if="error && !Object.keys(fields).length" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="firstName" label="First name" autocomplete="given-name" :error="fields.firstName" help="New to Siar? Tell us your name." />
      <Input v-model="password" label="Password" type="password" autocomplete="new-password" :error="fields.password" help="Choose a password if you do not have a Siar account yet. Leave it empty if you do and are signed in." />
      <Button type="submit" variant="primary" block :loading="busy">Join organization</Button>
    </form>
    <template #below>Already have an account? <router-link to="/login">Sign in</router-link> first, then open this link again.</template>
  </AuthShell>
</template>
