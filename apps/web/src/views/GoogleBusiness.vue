<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Download, MapPin, Reply, Star, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Button from '@/components/ui/Button.vue';
import Select from '@/components/ui/Select.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Pager from '@/components/ui/Pager.vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, session } from '@/lib/store';
import { relative } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

interface Review { id: string; reviewerDisplayName?: string | null; reviewerProfilePhotoUrl?: string | null; starRating?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | null; comment?: string | null; reviewReplyComment?: string | null; reviewReplyUpdatedAt?: string | null; reviewReplyState?: string | null; reviewReplyPolicyViolation?: string | null; createTime?: string | null }
interface ImportRun { id: string; requestedCount: number; status: string; reviewsImported: number; error?: string | null; createdAt: string }

const account = computed(() => currentTeam.value?.socialAccounts.find((a) => a.type === 'GOOGLE_BUSINESS') ?? null);
const ready = computed(() => !!account.value && !!account.value.channelId);
const offset = ref(0); const limit = 20;
const reviews = useQuery(() => api.get<{ reviews: Review[]; total: number }>('/misc/google-business/reviews', { teamId: session.teamId, limit, offset: offset.value }), { deps: [offset, () => session.teamId], enabled: () => !!session.teamId && ready.value });
const runs = useQuery(() => api.get<{ imports: ImportRun[] }>('/misc/google-business/reviews/import', { teamId: session.teamId }), { deps: [() => session.teamId], enabled: () => !!session.teamId && ready.value });
const stars = (r: Review) => ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r.starRating ?? 'ONE'] ?? 0);
const latest = computed(() => runs.data.value?.imports[0] ?? null);
const running = computed(() => !!latest.value && ['PENDING', 'FETCHING_REVIEWS'].includes(latest.value.status));
let poll = 0;
watch(running, (r) => { clearInterval(poll); if (r) poll = window.setInterval(async () => { await runs.reload(); if (!running.value) { clearInterval(poll); await reviews.reload(); } }, 2500); });

const count = ref(50); const busy = ref<string | null>(null);
async function importReviews() {
  busy.value = 'import';
  try { await api.post('/misc/google-business/reviews/import', { teamId: session.teamId, count: count.value }); toast.success('Import started'); await runs.reload(); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const replying = ref<string | null>(null); const text = ref('');
function startReply(r: Review) { replying.value = r.id; text.value = r.reviewReplyComment ?? ''; }
async function sendReply(r: Review) {
  busy.value = r.id;
  try { await api.put(`/misc/google-business/reviews/${r.id}/reply`, { teamId: session.teamId, comment: text.value.trim() }); replying.value = null; await reviews.reload(); toast.success('Reply published'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function removeReply(r: Review) {
  if (!(await confirm({ title: 'Delete your reply?', confirmLabel: 'Delete reply', danger: true }))) return;
  busy.value = r.id;
  try { await api.del(`/misc/google-business/reviews/${r.id}/reply`, { teamId: session.teamId }); await reviews.reload(); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
</script>

<template>
  <div class="page">
    <PageHead title="Google Business" subtitle="Customer reviews for this team’s Google Business location.">
      <template v-if="ready"><Select v-model="count" size="sm" :options="[{ value: 25, label: '25 reviews' }, { value: 50, label: '50 reviews' }, { value: 100, label: '100 reviews' }, { value: 200, label: '200 reviews' }]" aria-label="How many to import" /><Button :icon="Download" :loading="busy === 'import' || running" @click="importReviews">Import reviews</Button></template>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <EmptyState v-else-if="!account" :icon="MapPin" title="Google Business is not connected" description="Connect the Google Business account for this team to read and answer reviews."><Button variant="primary" to="/social-accounts">Connect Google Business</Button></EmptyState>
    <EmptyState v-else-if="!ready" :icon="MapPin" title="Choose a location first" description="Pick which Google Business location Siar should use."><Button variant="primary" to="/social-accounts">Choose a location</Button></EmptyState>
    <template v-else>
      <div v-if="latest" class="callout mb-16" :class="latest.status === 'FAILED' ? 'danger' : running ? 'info' : ''">
        <div class="grow small">Last import: <StatusBadge :status="latest.status" size="sm" /> {{ latest.reviewsImported }} of {{ latest.requestedCount }} reviews, {{ relative(latest.createdAt) }}.<span v-if="latest.error"> {{ latest.error }}</span></div>
      </div>
      <QueryState :loading="reviews.loading.value" :error="reviews.error.value" :status="reviews.status.value" :has-data="!!reviews.data.value" feature="Reviews" @retry="reviews.reload">
        <EmptyState v-if="!reviews.data.value?.reviews.length" :icon="Star" title="No reviews imported yet" description="Import your latest reviews to read and reply to them here."><Button variant="primary" :icon="Download" :loading="running" @click="importReviews">Import {{ count }} reviews</Button></EmptyState>
        <template v-else>
          <div class="panel-list">
            <article v-for="r in reviews.data.value.reviews" :key="r.id" class="item" style="align-items: flex-start">
              <Avatar :src="r.reviewerProfilePhotoUrl" :name="r.reviewerDisplayName" :size="40" />
              <div class="grow">
                <div class="row wrap"><span class="strong">{{ r.reviewerDisplayName ?? 'Anonymous' }}</span>
                  <span class="stars" :aria-label="`${stars(r)} out of 5 stars`"><Star v-for="n in 5" :key="n" :size="14" :fill="n <= stars(r) ? 'currentColor' : 'none'" :class="{ on: n <= stars(r) }" /></span>
                  <span class="tiny muted">{{ relative(r.createTime) }}</span></div>
                <p v-if="r.comment" class="prewrap mt-8">{{ r.comment }}</p><p v-else class="muted small mt-8">No written comment.</p>
                <div v-if="r.reviewReplyComment && replying !== r.id" class="reply">
                  <div class="row"><span class="tiny strong">Your reply</span><Badge v-if="r.reviewReplyState && r.reviewReplyState !== 'APPROVED'" size="sm" :tone="r.reviewReplyState === 'REJECTED' ? 'danger' : 'warn'">{{ r.reviewReplyState.toLowerCase() }}</Badge><span class="tiny muted">{{ relative(r.reviewReplyUpdatedAt) }}</span></div>
                  <p class="prewrap small">{{ r.reviewReplyComment }}</p>
                  <p v-if="r.reviewReplyPolicyViolation" class="tiny danger-text">{{ r.reviewReplyPolicyViolation }}</p>
                </div>
                <form v-if="replying === r.id" class="stack mt-8" @submit.prevent="sendReply(r)">
                  <Textarea v-model="text" :rows="3" :max="4096" aria-label="Reply" autofocus />
                  <div class="row"><Button type="submit" size="sm" variant="primary" :loading="busy === r.id" :disabled="!text.trim()">Publish reply</Button><Button size="sm" variant="ghost" @click="replying = null">Cancel</Button></div>
                </form>
                <div v-else class="row mt-8">
                  <Button size="sm" :icon="Reply" @click="startReply(r)">{{ r.reviewReplyComment ? 'Edit reply' : 'Reply' }}</Button>
                  <Button v-if="r.reviewReplyComment" size="sm" variant="danger-ghost" :icon="Trash2" :loading="busy === r.id" @click="removeReply(r)">Delete reply</Button>
                </div>
              </div>
            </article>
          </div>
          <Pager :total="reviews.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
        </template>
      </QueryState>
    </template>
  </div>
</template>

<style scoped>
.stars { display: inline-flex; gap: 1px; color: var(--border-strong); }
.stars .on { color: var(--warn); }
.reply { margin-top: 12px; padding: 8px 12px; border-left: 3px solid var(--accent); background: var(--bg-subtle); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
</style>
