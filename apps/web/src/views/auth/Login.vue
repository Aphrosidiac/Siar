<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthShell from '@/components/AuthShell.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import GoogleButton from '@/components/GoogleButton.vue';
import OrDivider from '@/components/OrDivider.vue';
import { api, errorMessage, isApiError } from '@/lib/api';
import { loadSession } from '@/lib/store';
import { googleError, googleStartUrl, useGoogleSignIn } from '@/lib/google';

const route = useRoute(); const router = useRouter();
const email = ref(''); const password = ref(''); const busy = ref(false); const error = ref(googleError(route.query.error));
const google = useGoogleSignIn();
const nextPath = typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//') ? route.query.next : undefined;
const googleHref = googleStartUrl({ from: 'login', next: nextPath });
// the message is shown; drop ?error so a reload or a retry starts clean
if (route.query.error) void router.replace({ query: { ...route.query, error: undefined } });
async function submit() {
  busy.value = true; error.value = '';
  try {
    await api.post('/auth/login', { email: email.value.trim(), password: password.value }, { noAuthRedirect: true });
    await loadSession(true);
    await router.replace(nextPath ?? '/posts');
  } catch (e) {
    error.value = errorMessage(e);
    // the API never says which accounts sign in with Google (no account discovery); the page can hint
    if (google.value && isApiError(e) && e.status === 401) error.value += ' Signed up with Google? Use "Continue with Google".';
  } finally { busy.value = false; }
}
</script>
<template>
  <AuthShell title="Welcome back." subtitle="Sign in to your Siar dashboard.">
    <template #switch>New to Siar? <router-link to="/signup">Create an account</router-link></template>
    <div class="stack-16">
      <div v-if="error" class="callout danger" role="alert">{{ error }}</div>
      <template v-if="google">
        <GoogleButton :href="googleHref" />
        <OrDivider />
      </template>
      <form class="stack-16" @submit.prevent="submit">
        <Input v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@company.com" required autofocus />
        <div class="pw">
          <Input v-model="password" label="Password" type="password" autocomplete="current-password" required />
          <router-link to="/forgot-password" class="forgot small">Forgot password?</router-link>
        </div>
        <Button type="submit" variant="primary" block :loading="busy">Sign in <span aria-hidden="true">→</span></Button>
      </form>
    </div>
  </AuthShell>
</template>
<style scoped>
.pw { position: relative; }
.forgot { position: absolute; top: 0; right: 0; line-height: 18px; color: var(--text-subtle); }
.forgot:hover { color: var(--text); }
</style>
