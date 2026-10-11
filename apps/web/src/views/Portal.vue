<script setup lang="ts">
import { handle } from '@/lib/format';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, TriangleAlert } from 'lucide-vue-next';
import NetworkIcon from '@/components/NetworkIcon.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Modal from '@/components/ui/Modal.vue';
import Spinner from '@/components/ui/Spinner.vue';
import { api, errorMessage } from '@/lib/api';
import { META } from '@/lib/networks';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType } from '@/lib/types';

interface Info { organizationName: string; brandName?: string | null; logoUrl?: string | null; accentColor?: string | null; teamName: string; allowedTypes: string[]; connected?: { type?: string; username?: string | null; displayName?: string | null; avatarUrl?: string | null; needsChannel?: boolean }[]; redirectUrl?: string | null; expiresAt?: string | null }
const route = useRoute(); const router = useRouter();
const token = String(route.params.token);
const info = ref<Info | null>(null); const loading = ref(true); const error = ref(''); const gone = ref(false);
const busy = ref<string | null>(null);
const notice = ref<{ tone: 'success' | 'danger' | 'warn'; text: string } | null>(null);

async function load() {
  try { info.value = await api.get<Info>(`/portal/${encodeURIComponent(token)}`, undefined, { noAuthRedirect: true }); }
  catch (e) { error.value = errorMessage(e); gone.value = true; } finally { loading.value = false; }
}
onMounted(async () => {
  const q = route.query;
  await load();
  if (q.success !== undefined) {
    const name = META[String(q.type) as NetworkType]?.name ?? 'Account';
    if (q.success === 'true') notice.value = q.needsChannel === 'true'
      ? { tone: 'warn', text: `${name} is connected. One more step: ${info.value?.organizationName ?? 'the team owner'} needs to choose which ${META[String(q.type) as NetworkType]?.channelNoun || 'channel'} to post to.` }
      : { tone: 'success', text: `${name} connected.` };
    else notice.value = { tone: 'danger', text: `Could not connect ${name}. ${String(q.error ?? '')}`.trim() };
    void router.replace({ path: route.path });
  }
});

const accent = computed(() => (/^#[0-9a-f]{6}$/i.test(info.value?.accentColor ?? '') ? info.value!.accentColor! : null));
const brand = computed(() => info.value?.brandName || info.value?.organizationName || 'Siar');
const connectedOf = (t: string) => info.value?.connected?.find((c) => c.type === t) ?? null;

const server = ref<NetworkType | null>(null); const serverUrl = ref('');
function start(t: string) { if (t === 'MASTODON') { serverUrl.value = ''; server.value = t; } else void go(t); }
async function go(t: string) {
  busy.value = t;
  try { const r = await api.post<{ url: string }>(`/portal/${encodeURIComponent(token)}/connect`, { type: t, ...(t === 'MASTODON' ? { serverUrl: serverUrl.value.trim() } : {}) }, { noAuthRedirect: true }); location.href = r.url; }
  catch (e) { toast.fail(e); busy.value = null; }
}
async function disconnect(t: string) {
  if (!(await confirm({ title: `Disconnect ${META[t as NetworkType]?.name ?? t}?`, confirmLabel: 'Disconnect', danger: true }))) return;
  busy.value = t;
  try { await api.post(`/portal/${encodeURIComponent(token)}/disconnect`, { type: t }, { noAuthRedirect: true }); await load(); notice.value = { tone: 'success', text: 'Disconnected.' }; } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
</script>

<template>
  <div class="portal" :style="accent ? { '--accent': accent, '--accent-hover': accent, '--accent-soft': `${accent}1f`, '--accent-soft-text': accent } : undefined">
    <div class="wrap">
      <div v-if="loading" class="row" style="justify-content: center; padding: 64px 0"><Spinner :size="24" /></div>
      <div v-else-if="gone" class="card center">
        <TriangleAlert :size="28" class="faint" />
        <h1>This link doesn’t work</h1>
        <p class="muted">{{ error || 'It may have expired or been replaced.' }} Ask the person who sent it for a new link.</p>
      </div>
      <template v-else-if="info">
        <header class="head">
          <img v-if="info.logoUrl" :src="info.logoUrl" alt="" class="logo" />
          <Avatar v-else :name="brand" :size="48" square />
          <div><h1>{{ brand }}</h1><p class="muted">Connect your accounts for <strong>{{ info.teamName }}</strong>.</p></div>
        </header>
        <div v-if="notice" class="callout" :class="notice.tone" role="status">{{ notice.text }}</div>
        <p class="small muted">You are granting {{ brand }} permission to publish on your behalf. You can disconnect at any time.</p>
        <div class="tiles">
          <article v-for="t in info.allowedTypes" :key="t" class="tile">
            <NetworkIcon :type="t" :size="40" :title="false" />
            <div class="grow">
              <h3>{{ META[t as NetworkType]?.name ?? t }}</h3>
              <div v-if="connectedOf(t)" class="small success-text row gap-4"><Check :size="14" />{{ connectedOf(t)!.username ? handle(connectedOf(t)!.username) : connectedOf(t)!.displayName || 'Connected' }}</div>
              <div v-else class="small muted">{{ META[t as NetworkType]?.blurb }}</div>
            </div>
            <Button v-if="connectedOf(t)" size="sm" variant="ghost" :loading="busy === t" @click="disconnect(t)">Disconnect</Button>
            <Button v-else size="sm" variant="primary" :loading="busy === t" @click="start(t)">Connect</Button>
          </article>
        </div>
        <div v-if="info.redirectUrl" class="row" style="justify-content: center"><Button :href="info.redirectUrl" variant="secondary">Go back</Button></div>
        <footer class="tiny faint center">Powered by Siar · Siar by FF Dev Studio</footer>
      </template>
    </div>
    <Modal :open="!!server" title="Connect Mastodon" size="sm" @close="server = null">
      <form class="stack-16" @submit.prevent="go('MASTODON'); server = null">
        <Input v-model="serverUrl" type="url" label="Your server" placeholder="https://mastodon.social" required autofocus />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="server = null">Cancel</Button><Button type="submit" variant="primary">Continue</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.portal { min-height: 100vh; background: var(--bg-subtle); padding: 32px 16px; }
.wrap { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.head { display: flex; gap: 16px; align-items: center; }
.logo { width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius); }
.card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; }
.center { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.tiles { display: flex; flex-direction: column; gap: 8px; }
.tile { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); }
</style>
