<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { api, errorMessage, isApiError, issuesByPath } from '@/lib/api';
import { loadSession } from '@/lib/store';

const router = useRouter();
const f = reactive({ firstName: '', lastName: '', email: '', password: '', organizationName: '' });
const busy = ref(false); const error = ref(''); const fields = ref<Record<string, string>>({});
async function submit() {
  busy.value = true; error.value = ''; fields.value = {};
  try {
    await api.post('/auth/signup', { email: f.email.trim(), password: f.password, firstName: f.firstName.trim(), ...(f.lastName.trim() ? { lastName: f.lastName.trim() } : {}), ...(f.organizationName.trim() ? { organizationName: f.organizationName.trim() } : {}) }, { noAuthRedirect: true });
    await loadSession(true);
    await router.replace('/posts');
  } catch (e) { error.value = errorMessage(e); if (isApiError(e)) fields.value = issuesByPath(e.issues); } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Create your account" subtitle="Start free. No card needed.">
    <form class="stack-16" @submit.prevent="submit">
      <div v-if="error && !Object.keys(fields).length" class="callout danger" role="alert">{{ error }}</div>
      <div class="grid-2">
        <Input v-model="f.firstName" label="First name" required autocomplete="given-name" :error="fields.firstName" autofocus />
        <Input v-model="f.lastName" label="Last name" autocomplete="family-name" :error="fields.lastName" />
      </div>
      <Input v-model="f.email" label="Work email" type="email" required autocomplete="email" :error="fields.email" />
      <Input v-model="f.password" label="Password" type="password" required autocomplete="new-password" :error="fields.password" help="At least 10 characters." />
      <Input v-model="f.organizationName" label="Organization name" placeholder="Acme Studio" :error="fields.organizationName" help="Optional. You can rename it later." />
      <Button type="submit" variant="primary" block :loading="busy">Create account</Button>
    </form>
    <template #below>Already have an account? <router-link to="/login">Sign in</router-link></template>
  </AuthShell>
</template>
