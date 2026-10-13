<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { UserRound } from 'lucide-vue-next';
import Select from './ui/Select.vue';
import Toggle from './ui/Toggle.vue';
import Input from './ui/Input.vue';
import Avatar from './ui/Avatar.vue';
import type { SocialAccount, Upload } from '@/lib/types';
import { handle } from '@/lib/format';
import { api } from '@/lib/api';

/**
 * TikTok's Content Posting API requires a specific UX: read creator_info when the form opens, show that creator,
 * offer only their privacy levels with no default, grey out interactions they switched off, check their max video
 * length, stop when they cannot post, disclose commercial content, and show the Music Usage Confirmation line.
 */
const props = defineProps<{ account: SocialAccount | null; values: Record<string, any>; issues: Record<string, string>; hasImages: boolean; hasVideo: boolean; videoLength?: number | null; media?: Upload[]; caption?: string }>();
const emit = defineEmits<{ set: [key: string, value: unknown]; block: [reason: string | null] }>();
const v = (k: string) => props.values[k];
const set = (k: string, val: unknown) => emit('set', k, val);

interface CreatorInfo {
  canPost: boolean; reason: string | null; business: boolean;
  creatorNickname: string | null; creatorUsername: string | null; creatorAvatarUrl: string | null;
  privacyLevelOptions: string[]; commentDisabled: boolean; duetDisabled: boolean; stitchDisabled: boolean; maxVideoPostDurationSec: number | null;
}
const info = ref<CreatorInfo | null>(null);
const infoError = ref<string | null>(null);
const loading = ref(false);
async function loadInfo() {
  info.value = null; infoError.value = null;
  if (!props.account) return;
  loading.value = true;
  try { info.value = await api.get<CreatorInfo>('/misc/tiktok/creator-info', { teamId: props.account.teamId }); }
  catch (e: any) { infoError.value = e?.message ?? 'Could not read this TikTok account.'; }
  finally { loading.value = false; }
}
watch(() => props.account?.id, loadInfo, { immediate: true });

const PRIVACY = [
  { value: 'PUBLIC_TO_EVERYONE', label: 'Everyone' },
  { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends (mutual followers)' },
  { value: 'FOLLOWER_OF_CREATOR', label: 'Followers' },
  { value: 'SELF_ONLY', label: 'Only me' },
];
// "Allow …" is the visible switch; the API field is the inverse. Off until the creator turns it on.
const allow = (k: 'disableComments' | 'disableDuet' | 'disableStitch') => v(k) === false;
const setAllow = (k: 'disableComments' | 'disableDuet' | 'disableStitch', on: boolean) => set(k, !on);
const disclose = computed(() => !!v('isOrganicBrandContent') || !!v('isBrandContent') || !!v('__disclose'));
function toggleDisclose(on: boolean) {
  set('__disclose', on || undefined);
  if (!on) { set('isOrganicBrandContent', undefined); set('isBrandContent', undefined); }
}
const nickname = computed(() => info.value?.creatorNickname || props.account?.displayName || props.account?.username || 'your TikTok account');
const username = computed(() => info.value?.creatorUsername || props.account?.username || null);
const avatar = computed(() => info.value?.creatorAvatarUrl || props.account?.avatarUrl || null);
const brandPrivate = computed(() => !!v('isBrandContent') && v('privacy') === 'SELF_ONLY');
const draft = computed(() => !!v('uploadToDraft'));

// Only the levels this creator allows; "Only me" is unavailable for branded content.
const privacyOptions = computed(() => {
  const allowed = info.value?.privacyLevelOptions;
  return PRIVACY.filter((o) => !allowed?.length || allowed.includes(o.value)).map((o): { value: string; label: string; sub?: string; disabled?: boolean } =>
    o.value === 'SELF_ONLY' && v('isBrandContent') ? { ...o, sub: 'Branded content visibility cannot be set to private.', disabled: true } : o);
});
watch(privacyOptions, (opts) => { const p = v('privacy'); if (p && !opts.some((o) => o.value === p && !o.disabled)) set('privacy', undefined); });

const off = computed(() => ({ disableComments: !!info.value?.commentDisabled, disableDuet: !!info.value?.duetDisabled, disableStitch: !!info.value?.stitchDisabled }));
const OFF_HELP = 'Turned off in this account’s TikTok settings.';
const tooLong = computed(() => {
  const max = info.value?.maxVideoPostDurationSec, len = props.videoLength;
  return props.hasVideo && max && len && len > max ? `This video is ${Math.round(len)}s. This account can post videos up to ${max}s.` : null;
});
const label = computed(() => v('isBrandContent') ? 'Paid partnership' : v('isOrganicBrandContent') ? 'Promotional content' : null);
// Disclosure on with neither option chosen: TikTok requires the publish button to be disabled, with this text.
const DISCLOSE_MISSING = 'You need to indicate if your content promotes yourself, a third party, or both.';
const discloseMissing = computed(() => disclose.value && !v('isOrganicBrandContent') && !v('isBrandContent'));
// What will be posted, shown before the creator consents (TikTok: display a preview of the to-be-posted content).
const previewVideo = computed(() => props.media?.find((m) => m.type === 'video') ?? null);
const previewImages = computed(() => (previewVideo.value ? [] : (props.media ?? []).filter((m) => m.type === 'image').slice(0, 4)));
const blockReason = computed(() => discloseMissing.value ? DISCLOSE_MISSING : draft.value ? null : info.value && !info.value.canPost ? info.value.reason : tooLong.value);
watch(blockReason, (r) => emit('block', r ?? null), { immediate: true });
</script>

<template>
  <div class="stack-16">
    <div class="creator">
      <Avatar :src="avatar" :name="nickname" :size="36" />
      <div class="grow"><div class="tiny muted">Posting as</div><div class="strong" data-testid="tiktok-nickname">{{ nickname }}</div><div v-if="username" class="tiny muted">{{ handle(username) }}</div></div>
      <UserRound :size="16" class="faint" />
    </div>
    <div v-if="previewVideo || previewImages.length" class="preview" data-testid="tiktok-preview">
      <div class="tiny muted">Preview</div>
      <video v-if="previewVideo" :src="previewVideo.url ?? undefined" :poster="previewVideo.thumbnailUrl ?? undefined" controls muted playsinline preload="metadata" class="pv" />
      <div v-else class="pimgs"><img v-for="m in previewImages" :key="m.id" :src="(m.thumbnailUrl || m.url)!" alt="" class="pv" /></div>
      <p class="small preview-text">{{ caption }}</p>
    </div>
    <div v-if="info && !info.canPost && !draft" class="callout danger small" role="alert" data-testid="tiktok-cannot-post">{{ info.reason }}</div>
    <div v-else-if="infoError" class="callout warn small">{{ infoError }} The form shows every option; TikTok checks them when the post goes out.</div>
    <div v-if="tooLong && !draft" class="callout danger small" role="alert" data-testid="tiktok-too-long">{{ tooLong }}</div>

    <Select :model-value="v('type') ?? null" label="Post type" :options="[{ value: 'VIDEO', label: 'Video' }, { value: 'IMAGE', label: 'Photo post' }]" :placeholder="hasImages && !hasVideo ? 'Photo post (from your media)' : 'Video (from your media)'" clearable :error="issues.type" @update:model-value="set('type', $event ?? undefined)" />

    <Select :model-value="v('privacy') ?? null" label="Who can view this" required :options="privacyOptions" :disabled="loading" :placeholder="loading ? 'Reading your TikTok settings…' : 'Select who can view this post'" :error="issues.privacy" help="Choose who can see it. These are the options your TikTok account allows." @update:model-value="set('privacy', $event ?? undefined)" />

    <fieldset class="group">
      <legend class="field-label">Allow people to</legend>
      <Toggle :model-value="!off.disableComments && allow('disableComments')" label="Comment" :disabled="off.disableComments" :help="off.disableComments ? OFF_HELP : undefined" @update:model-value="setAllow('disableComments', $event)" />
      <template v-if="!hasImages || hasVideo">
        <Toggle :model-value="!off.disableDuet && allow('disableDuet')" label="Duet" :disabled="off.disableDuet" :help="off.disableDuet ? OFF_HELP : undefined" @update:model-value="setAllow('disableDuet', $event)" />
        <Toggle :model-value="!off.disableStitch && allow('disableStitch')" label="Stitch" :disabled="off.disableStitch" :help="off.disableStitch ? OFF_HELP : undefined" @update:model-value="setAllow('disableStitch', $event)" />
      </template>
    </fieldset>

    <fieldset class="group">
      <legend class="field-label">Commercial content</legend>
      <Toggle :model-value="disclose" label="Disclose post content" help="Turn on if this post promotes yourself, a brand, product or service." @update:model-value="toggleDisclose" />
      <template v-if="disclose">
        <Toggle :model-value="!!v('isOrganicBrandContent')" label="Your brand" help="You are promoting yourself or your own business. Labelled “Promotional content”." @update:model-value="set('isOrganicBrandContent', $event || undefined)" />
        <Toggle :model-value="!!v('isBrandContent')" label="Branded content" :disabled="v('privacy') === 'SELF_ONLY'" :help="v('privacy') === 'SELF_ONLY' ? 'Branded content can’t be private. Choose another visibility first.' : 'You are promoting another brand or a third party. Labelled “Paid partnership”.'" @update:model-value="set('isBrandContent', $event || undefined)" />
        <div v-if="discloseMissing" class="callout warn small">{{ DISCLOSE_MISSING }}</div>
        <div v-else-if="label" class="callout info small" data-testid="tiktok-label">Your {{ hasImages && !hasVideo ? 'photo' : 'video' }} will be labeled as “{{ label }}”.</div>
        <div v-if="brandPrivate" class="callout danger small" role="alert">Branded content cannot be private. Choose another visibility.</div>
      </template>
    </fieldset>

    <fieldset class="group">
      <legend class="field-label">More</legend>
      <Toggle :model-value="!!v('isAiGenerated')" label="AI-generated content" help="Adds TikTok’s AI-generated label." @update:model-value="set('isAiGenerated', $event || undefined)" />
      <Toggle :model-value="!!v('uploadToDraft')" label="Send to TikTok drafts" help="Finish and publish from the TikTok app. No privacy choice needed." @update:model-value="set('uploadToDraft', $event || undefined)" />
      <Toggle :model-value="!!v('autoAddMusic')" label="Auto-add recommended music" help="Photo posts." @update:model-value="set('autoAddMusic', $event || undefined)" />
      <Input v-if="hasImages && !hasVideo" type="number" :model-value="v('photoCoverIndex') ?? null" label="Cover photo number" help="0 is the first photo." :error="issues.photoCoverIndex" @update:model-value="set('photoCoverIndex', $event ?? undefined)" />
    </fieldset>

    <p class="small muted" data-testid="tiktok-music">
      <template v-if="v('isBrandContent')">By posting, you agree to TikTok's <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noopener">Branded Content Policy</a> and <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noopener">Music Usage Confirmation</a></template>
      <template v-else>By posting, you agree to TikTok's <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noopener">Music Usage Confirmation</a></template>
    </p>
    <p class="tiny muted">After you publish, TikTok can take a few minutes to process the post before it shows on your profile.</p>
  </div>
</template>

<style scoped>
.creator { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-subtle); }
.preview { display: flex; flex-direction: column; gap: 8px; }
.pv { width: 160px; aspect-ratio: 9 / 16; object-fit: cover; border-radius: var(--radius); background: #0b0b0a; border: 1px solid var(--border); }
.pimgs { display: flex; gap: 8px; flex-wrap: wrap; }
.pimgs .pv { width: 96px; }
.preview-text { white-space: pre-wrap; margin: 0; max-width: 60ch; }
.group { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.group legend { padding: 0; margin-bottom: 4px; }
</style>
