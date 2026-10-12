<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Archive, Download, EyeOff, Eye, Heart, Inbox as InboxIcon, MessageCircle, Reply, Send, Trash2, ArchiveRestore } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Button from '@/components/ui/Button.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Select from '@/components/ui/Select.vue';
import Modal from '@/components/ui/Modal.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, refreshTeam, session } from '@/lib/store';
import { COMMENT_IMPORT_TYPES, META } from '@/lib/networks';
import { formatDateTime, relative } from '@/lib/format';
import { timezone } from '@/lib/store';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType, Paged, Post, SocialAccount } from '@/lib/types';

const tab = ref('comments');

// ── comments ──
interface FetchedComment { id: string; postId?: string | null; platform: NetworkType; authorName?: string | null; authorAvatarUrl?: string | null; text?: string | null; likesCount: number; repliesCount: number; publishedAt?: string | null; platformData?: { hidden?: boolean; likedByMe?: boolean; canDelete?: boolean; canHide?: boolean; canLike?: boolean } | null }
const offset = ref(0); const limit = 20;
const comments = useQuery(() => api.get<Paged<FetchedComment>>('/comment/import/comments', { teamId: session.teamId, limit, offset: offset.value }), { deps: [offset, () => session.teamId], enabled: () => !!session.teamId });
const replyTo = ref<FetchedComment | null>(null); const replyText = ref(''); const busy = ref<string | null>(null);
const replyMax = computed(() => (replyTo.value ? META[replyTo.value.platform].textMax : null));
async function sendReply() {
  const c = replyTo.value; if (!c || !replyText.value.trim()) return;
  busy.value = 'reply';
  try { await api.post('/comment/', { teamId: session.teamId, fetchedParentCommentId: c.id, socialAccountTypes: [c.platform], text: replyText.value.trim() }); toast.success('Reply queued', 'It is published to the network in a moment.'); replyTo.value = null; replyText.value = ''; }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function act(c: FetchedComment, action: 'HIDE' | 'UNHIDE' | 'LIKE' | 'UNLIKE' | 'DELETE') {
  if (action === 'DELETE' && !(await confirm({ title: 'Delete this comment?', message: 'It is removed from the network too.', confirmLabel: 'Delete', danger: true }))) return;
  busy.value = c.id + action;
  try { await api.post(`/comment/import/comments/${c.id}/action`, { teamId: session.teamId, action }); await comments.reload(); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
// import
const imp = ref(false); const impPost = ref<string | null>(null); const impType = ref<NetworkType | null>(null); const posted = ref<Post[]>([]);
async function openImport() {
  imp.value = true; impPost.value = null; impType.value = null;
  try { posted.value = (await api.get<Paged<Post>>('/post/', { teamId: session.teamId, status: 'POSTED', limit: 50, orderBy: 'postedDate', order: 'DESC' })).items; } catch (e) { toast.fail(e); }
}
const impTypes = computed(() => { const p = posted.value.find((x) => x.id === impPost.value); return (p?.socialAccounts ?? []).map((t) => t.socialAccount?.type).filter((t): t is NetworkType => !!t && COMMENT_IMPORT_TYPES.includes(t)); });
const impTypeOptions = computed(() => impTypes.value.map((t) => ({ value: t, label: META[t].name })));
watch(impPost, () => { impType.value = impTypes.value[0] ?? null; });
async function runImport() {
  busy.value = 'import';
  try { await api.post('/comment/import', { teamId: session.teamId, postId: impPost.value, socialAccountType: impType.value }); toast.success('Import started', 'New comments appear here shortly.'); imp.value = false; setTimeout(() => void comments.reload(), 2500); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// ── messages ──
interface Conversation { id: string; platform: NetworkType; participantDisplayName?: string | null; participantUsername?: string | null; participantAvatarUrl?: string | null; status: 'OPEN' | 'ARCHIVED'; lastActivityAt: string; lastMessagePreview?: string | null; unreadCount: number; platformData?: { canReply?: boolean } | null; socialAccount?: { username?: string | null } }
interface Message { id: string; direction: 'INBOUND' | 'OUTBOUND'; status: string; text?: string | null; attachments?: { type: string; url?: string; name?: string }[]; sentAt?: string | null; createdAt: string; error?: string | null }
const convStatus = ref('OPEN');
const convs = useQuery(() => api.get<{ items: Conversation[]; total: number }>('/conversations/', { teamId: session.teamId, status: convStatus.value, limit: 50 }), { deps: [convStatus, () => session.teamId], enabled: () => !!session.teamId });
const activeId = ref<string | null>(null);
const active = computed(() => convs.data.value?.items.find((c) => c.id === activeId.value) ?? null);
const msgs = useQuery(() => api.get<{ items: Message[] }>(`/conversations/${activeId.value}/messages`, { limit: 100 }), { deps: [activeId], enabled: () => !!activeId.value });
const ordered = computed(() => [...(msgs.data.value?.items ?? [])].sort((a, b) => (a.sentAt ?? a.createdAt).localeCompare(b.sentAt ?? b.createdAt)));
const thread = ref<HTMLElement | null>(null);
watch(ordered, async () => { await nextTick(); if (thread.value) thread.value.scrollTop = thread.value.scrollHeight; });
async function openConv(c: Conversation) {
  activeId.value = c.id;
  if (c.unreadCount) { try { await api.post(`/conversations/${c.id}/read`, {}); c.unreadCount = 0; } catch { /* non-critical */ } }
}
const draft = ref('');
async function send() {
  if (!active.value || !draft.value.trim()) return;
  busy.value = 'send';
  try { await api.post(`/conversations/${active.value.id}/messages`, { content: { text: draft.value.trim() } }); draft.value = ''; await Promise.all([msgs.reload(), convs.reload()]); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function toggleArchive(c: Conversation) {
  try { await api.post(`/conversations/${c.id}/${c.status === 'OPEN' ? 'archive' : 'open'}`); activeId.value = null; await convs.reload(); toast.success(c.status === 'OPEN' ? 'Archived' : 'Reopened'); } catch (e) { toast.fail(e); }
}
watch(() => session.teamId, () => { activeId.value = null; offset.value = 0; });

// ── messaging switch (per Facebook / Instagram account) ──
// Turning messages on asks Meta for the messaging permissions (a reconnect with withMessagingScope), comes
// back here and then enables messaging, which subscribes the account to Meta's message webhooks.
const MSG_TYPES: NetworkType[] = ['FACEBOOK', 'INSTAGRAM'];
const msgAccounts = computed(() => (currentTeam.value?.socialAccounts ?? []).filter((a) => MSG_TYPES.includes(a.type)));
const msgState = (a: SocialAccount) => (a.messagingStatus === 'ENABLED' ? 'on' : a.messagingStatus === 'DISABLE_PENDING' ? 'pending' : 'off');
async function messagesOn(a: SocialAccount) {
  busy.value = `msg-${a.type}`;
  try {
    const body: Record<string, unknown> = { type: a.type, teamId: session.teamId, withMessagingScope: true, redirectUrl: `${location.origin}/inbox?tab=messages&enableMessaging=${a.type}` };
    if (a.type === 'INSTAGRAM') body.instagramConnectionMethod = a.instagramConnectionMethod ?? 'FACEBOOK';
    const { url } = await api.post<{ url: string }>('/social-account/connect', body);
    location.href = url;
  } catch (e) { toast.fail(e); busy.value = null; }
}
async function messagesOff(a: SocialAccount) {
  if (!(await confirm({ title: `Turn off ${META[a.type].name} messages?`, message: 'New direct messages stop arriving in Siar. Conversations you already have stay here.', confirmLabel: 'Turn off' }))) return;
  busy.value = `msg-${a.type}`;
  try { await api.post('/social-account/messaging/disable', { teamId: a.teamId, type: a.type }); await refreshTeam(); toast.success('Messages turned off'); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const route = useRoute(); const router = useRouter();
onMounted(async () => {
  const q = route.query;
  if (q.tab === 'messages') tab.value = 'messages';
  const type = typeof q.enableMessaging === 'string' ? (q.enableMessaging as NetworkType) : null;
  if (!type || !MSG_TYPES.includes(type)) return;
  void router.replace({ query: { tab: 'messages' } });
  if (q.success !== 'true') { toast.fail(typeof q.error === 'string' ? q.error : 'Meta did not grant the messaging permissions.'); return; }
  busy.value = `msg-${type}`;
  try { await api.post('/social-account/messaging/enable', { teamId: session.teamId, type }); await refreshTeam(); toast.success(`${META[type].name} messages are on`, 'New direct messages arrive here.'); void convs.reload(); }
  catch (e) { toast.fail(e); await refreshTeam(); } finally { busy.value = null; }
});
</script>

<template>
  <div class="page wide">
    <PageHead title="Inbox" subtitle="Comments on your posts and direct messages, in one place.">
      <Button v-if="tab === 'comments'" :icon="Download" @click="openImport">Import comments</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <template v-else>
      <Tabs v-model="tab" :tabs="[{ value: 'comments', label: 'Comments', icon: MessageCircle }, { value: 'messages', label: 'Messages', icon: InboxIcon }]" class="mb-16" />

      <!-- COMMENTS -->
      <QueryState v-if="tab === 'comments'" :loading="comments.loading.value" :error="comments.error.value" :status="comments.status.value" :has-data="!!comments.data.value" feature="Comments" @retry="comments.reload">
        <EmptyState v-if="!comments.data.value?.items.length" :icon="MessageCircle" title="No comments yet" description="Import the comments of a published post and they show up here.">
          <Button variant="primary" :icon="Download" @click="openImport">Import comments</Button>
        </EmptyState>
        <template v-else>
          <div class="panel-list">
            <div v-for="c in comments.data.value.items" :key="c.id" class="item" style="align-items: flex-start">
              <Avatar :src="c.authorAvatarUrl" :name="c.authorName" :size="36" />
              <div class="grow">
                <div class="row wrap"><span class="strong">{{ c.authorName ?? 'Unknown' }}</span><NetworkIcon :type="c.platform" :size="16" /><span class="tiny muted">{{ relative(c.publishedAt) }}</span><span v-if="c.platformData?.hidden" class="tiny muted">Hidden</span></div>
                <p class="prewrap mt-8">{{ c.text }}</p>
                <div class="row wrap mt-8">
                  <span class="tiny muted row gap-4"><Heart :size="12" />{{ c.likesCount }}</span>
                  <span class="tiny muted">{{ c.repliesCount }} repl{{ c.repliesCount === 1 ? 'y' : 'ies' }}</span>
                  <span class="spacer" />
                  <Button size="sm" variant="ghost" :icon="Reply" @click="replyTo = c; replyText = ''">Reply</Button>
                  <Button v-if="c.platformData?.canLike !== false" size="sm" variant="ghost" :icon="Heart" :loading="busy === c.id + (c.platformData?.likedByMe ? 'UNLIKE' : 'LIKE')" @click="act(c, c.platformData?.likedByMe ? 'UNLIKE' : 'LIKE')">{{ c.platformData?.likedByMe ? 'Unlike' : 'Like' }}</Button>
                  <Button v-if="c.platformData?.canHide !== false" size="sm" variant="ghost" :icon="c.platformData?.hidden ? Eye : EyeOff" @click="act(c, c.platformData?.hidden ? 'UNHIDE' : 'HIDE')">{{ c.platformData?.hidden ? 'Unhide' : 'Hide' }}</Button>
                  <Button size="sm" variant="danger-ghost" :icon="Trash2" iconOnly label="Delete comment" @click="act(c, 'DELETE')" />
                </div>
              </div>
            </div>
          </div>
          <Pager :total="comments.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
        </template>
      </QueryState>

      <!-- MESSAGES -->
      <template v-else>
        <div v-if="msgAccounts.length" class="msg-accts mb-16">
          <div v-for="a in msgAccounts" :key="a.id" class="msg-acct">
            <NetworkIcon :type="a.type" :size="28" :title="false" />
            <span class="grow" style="min-width: 0">
              <span class="strong d-block truncate">{{ META[a.type].name }}{{ a.username ? ` · @${a.username}` : a.displayName ? ` · ${a.displayName}` : '' }}</span>
              <span class="tiny d-block" :class="a.messagingLastError ? 'danger' : 'muted'">{{ a.messagingLastError ?? (msgState(a) === 'on' ? 'Messages on. New DMs arrive here.' : msgState(a) === 'pending' ? 'Turning off…' : 'Messages off') }}</span>
            </span>
            <Button v-if="msgState(a) === 'on'" size="sm" variant="secondary" :loading="busy === `msg-${a.type}`" @click="messagesOff(a)">Turn off</Button>
            <Button v-else size="sm" variant="primary" :icon="InboxIcon" :loading="busy === `msg-${a.type}`" :disabled="msgState(a) === 'pending'" @click="messagesOn(a)">Turn on messages</Button>
          </div>
        </div>
        <div class="split">
          <section class="list">
            <div class="row between" style="padding: 8px 12px; border-bottom: 1px solid var(--border)">
              <div class="pill-toggle"><button :class="{ on: convStatus === 'OPEN' }" @click="convStatus = 'OPEN'">Open</button><button :class="{ on: convStatus === 'ARCHIVED' }" @click="convStatus = 'ARCHIVED'">Archived</button></div>
            </div>
            <QueryState :loading="convs.loading.value" :error="convs.error.value" :status="convs.status.value" :has-data="!!convs.data.value" feature="Messages" @retry="convs.reload">
              <EmptyState v-if="!convs.data.value?.items.length" compact title="No conversations" description="Enable messaging on a Facebook or Instagram account to receive DMs here." />
              <button v-for="c in convs.data.value?.items ?? []" :key="c.id" type="button" class="conv" :class="{ on: c.id === activeId }" @click="openConv(c)">
                <Avatar :src="c.participantAvatarUrl" :name="c.participantDisplayName ?? c.participantUsername" :size="36" />
                <span class="grow" style="min-width: 0; text-align: left"><span class="row"><span class="strong truncate grow">{{ c.participantDisplayName ?? c.participantUsername }}</span><span class="tiny muted nowrap">{{ relative(c.lastActivityAt) }}</span></span>
                  <span class="row"><NetworkIcon :type="c.platform" :size="14" :title="false" /><span class="small muted truncate grow">{{ c.lastMessagePreview }}</span><span v-if="c.unreadCount" class="unread">{{ c.unreadCount }}</span></span></span>
              </button>
            </QueryState>
          </section>
          <section class="thread">
            <EmptyState v-if="!active" compact title="Select a conversation" description="Pick a conversation on the left to read and reply." />
            <template v-else>
              <header class="th-head">
                <Avatar :src="active.participantAvatarUrl" :name="active.participantDisplayName" :size="32" />
                <div class="grow"><div class="strong">{{ active.participantDisplayName ?? active.participantUsername }}</div><div class="tiny muted">{{ META[active.platform].name }}{{ active.socialAccount?.username ? ` · @${active.socialAccount.username}` : '' }}</div></div>
                <Button size="sm" variant="ghost" :icon="active.status === 'OPEN' ? Archive : ArchiveRestore" @click="toggleArchive(active)">{{ active.status === 'OPEN' ? 'Archive' : 'Reopen' }}</Button>
              </header>
              <div ref="thread" class="msgs">
                <QueryState :loading="msgs.loading.value" :error="msgs.error.value" :status="msgs.status.value" :has-data="!!msgs.data.value" feature="Messages" @retry="msgs.reload">
                  <div v-for="m in ordered" :key="m.id" class="bubble-row" :class="{ out: m.direction === 'OUTBOUND' }">
                    <div class="bubble" :class="{ out: m.direction === 'OUTBOUND', failed: m.status === 'FAILED' }">
                      <div class="prewrap">{{ m.text }}</div>
                      <a v-for="a in m.attachments ?? []" :key="a.url" :href="a.url" target="_blank" rel="noopener" class="small">{{ a.name ?? a.type }}</a>
                      <div class="tiny meta">{{ formatDateTime(m.sentAt ?? m.createdAt, timezone) }} <StatusBadge v-if="m.direction === 'OUTBOUND'" :status="m.status" size="sm" /></div>
                      <div v-if="m.error" class="tiny danger-text">{{ m.error }}</div>
                    </div>
                  </div>
                </QueryState>
              </div>
              <form class="composer" @submit.prevent="send">
                <div v-if="active.platformData?.canReply === false" class="callout warn small" style="margin-bottom: 8px">This network only allows replies within 24 hours of the person’s last message. Sending may be refused.</div>
                <Textarea v-model="draft" :rows="2" :max="1000" placeholder="Write a reply" aria-label="Reply" @keydown.meta.enter.prevent="send" @keydown.ctrl.enter.prevent="send" />
                <div class="row" style="justify-content: flex-end; margin-top: 8px"><Button type="submit" variant="primary" :icon="Send" :loading="busy === 'send'" :disabled="!draft.trim()">Send</Button></div>
              </form>
            </template>
          </section>
        </div>
      </template>
    </template>

    <Modal :open="!!replyTo" title="Reply to comment" size="sm" @close="replyTo = null">
      <form v-if="replyTo" class="stack-16" @submit.prevent="sendReply">
        <blockquote class="quote">{{ replyTo.text }}</blockquote>
        <Textarea v-model="replyText" :rows="3" autofocus :max="replyMax" label="Your reply" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="replyTo = null">Cancel</Button><Button type="submit" variant="primary" :icon="Reply" :loading="busy === 'reply'" :disabled="!replyText.trim()">Reply</Button></div>
      </form>
    </Modal>
    <Modal :open="imp" title="Import comments" description="Pull the latest comments of a published post from its network." size="sm" @close="imp = false">
      <form class="stack-16" @submit.prevent="runImport">
        <Select v-model="impPost" label="Published post" placeholder="Choose a post" :options="posted.map((p) => ({ value: p.id, label: p.title }))" />
        <Select v-if="impTypes.length" v-model="impType" label="Network" :options="impTypeOptions" />
        <div v-else-if="impPost" class="small muted">None of this post’s networks support comment import.</div>
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="imp = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy === 'import'" :disabled="!impPost || !impType">Import</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 340px minmax(0, 1fr); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; height: calc(100vh - 260px); min-height: 460px; background: var(--bg-elevated); }
@media (max-width: 900px) { .split { grid-template-columns: minmax(0, 1fr); height: auto; } .thread { min-height: 420px; } }
.list { border-right: 1px solid var(--border); overflow-y: auto; min-width: 0; }
.conv { display: flex; gap: 10px; align-items: center; width: 100%; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--border); background: none; cursor: pointer; color: var(--text); }
.conv:hover { background: var(--bg-hover); }
.conv.on { background: var(--bg-hover); box-shadow: inset 2px 0 0 var(--text); }
.unread { background: var(--text); color: var(--bg); border-radius: var(--radius-sm); font-family: var(--mono); font-size: var(--fs-11); line-height: 16px; padding: 0 5px; }
.thread { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.th-head { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); }
.msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.bubble-row { display: flex; } .bubble-row.out { justify-content: flex-end; }
.bubble { max-width: 75%; padding: 8px 12px; border-radius: 12px; background: var(--bg-muted); display: flex; flex-direction: column; gap: 4px; }
.bubble.out { background: var(--text); color: var(--bg); }
.bubble.out .meta { color: inherit; opacity: .65; }
.bubble.failed { outline: 1px solid var(--danger); }
.meta { color: var(--text-subtle); display: flex; gap: 6px; align-items: center; }
.composer { border-top: 1px solid var(--border); padding: 12px 16px; }
.quote { margin: 0; padding: 8px 12px; border-left: 3px solid var(--border-strong); color: var(--text-muted); background: var(--bg-subtle); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
.msg-accts { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
.msg-acct { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); }
.danger { color: var(--danger, #b42318); }
</style>
