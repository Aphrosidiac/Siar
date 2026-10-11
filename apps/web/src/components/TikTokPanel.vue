<script setup lang="ts">
import { computed } from 'vue';
import { UserRound } from 'lucide-vue-next';
import Select from './ui/Select.vue';
import Toggle from './ui/Toggle.vue';
import Input from './ui/Input.vue';
import Avatar from './ui/Avatar.vue';
import type { SocialAccount } from '@/lib/types';
import { handle } from '@/lib/format';

/**
 * TikTok's Content Posting API requires a specific UX: show the creator, make the creator pick a privacy level
 * (no default), leave comment / duet / stitch off until chosen, disclose commercial content, and show the
 * Music Usage Confirmation line before posting.
 */
const props = defineProps<{ account: SocialAccount | null; values: Record<string, any>; issues: Record<string, string>; hasImages: boolean; hasVideo: boolean }>();
const emit = defineEmits<{ set: [key: string, value: unknown] }>();
const v = (k: string) => props.values[k];
const set = (k: string, val: unknown) => emit('set', k, val);

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
const nickname = computed(() => props.account?.displayName || props.account?.username || 'your TikTok account');
const brandPrivate = computed(() => !!v('isBrandContent') && v('privacy') === 'SELF_ONLY');
</script>

<template>
  <div class="stack-16">
    <div class="creator">
      <Avatar :src="account?.avatarUrl" :name="nickname" :size="36" />
      <div class="grow"><div class="tiny muted">Posting as</div><div class="strong" data-testid="tiktok-nickname">{{ nickname }}</div><div v-if="account?.username" class="tiny muted">{{ handle(account.username) }}</div></div>
      <UserRound :size="16" class="faint" />
    </div>

    <Select :model-value="v('type') ?? null" label="Post type" :options="[{ value: 'VIDEO', label: 'Video' }, { value: 'IMAGE', label: 'Photo post' }]" :placeholder="hasImages && !hasVideo ? 'Photo post (from your media)' : 'Video (from your media)'" clearable :error="issues.type" @update:model-value="set('type', $event ?? undefined)" />

    <Select :model-value="v('privacy') ?? null" label="Who can view this" required :options="PRIVACY" placeholder="Select who can view this post" :error="issues.privacy" help="TikTok requires you to choose — there is no default. Options your account does not allow are rejected by TikTok." @update:model-value="set('privacy', $event ?? undefined)" />

    <fieldset class="group">
      <legend class="field-label">Allow people to</legend>
      <Toggle :model-value="allow('disableComments')" label="Comment" @update:model-value="setAllow('disableComments', $event)" />
      <Toggle :model-value="allow('disableDuet')" label="Duet" help="Videos only." @update:model-value="setAllow('disableDuet', $event)" />
      <Toggle :model-value="allow('disableStitch')" label="Stitch" help="Videos only." @update:model-value="setAllow('disableStitch', $event)" />
    </fieldset>

    <fieldset class="group">
      <legend class="field-label">Commercial content</legend>
      <Toggle :model-value="disclose" label="Disclose post content" help="Turn on if this post promotes yourself, a brand, product or service." @update:model-value="toggleDisclose" />
      <template v-if="disclose">
        <Toggle :model-value="!!v('isOrganicBrandContent')" label="Your brand" help="You are promoting yourself or your own business. Labelled “Promotional content”." @update:model-value="set('isOrganicBrandContent', $event || undefined)" />
        <Toggle :model-value="!!v('isBrandContent')" label="Branded content" help="You are promoting another brand or a third party. Labelled “Paid partnership”." @update:model-value="set('isBrandContent', $event || undefined)" />
        <div v-if="!v('isOrganicBrandContent') && !v('isBrandContent')" class="callout warn small">Select at least one option to continue.</div>
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
  </div>
</template>

<style scoped>
.creator { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-subtle); }
.group { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.group legend { padding: 0; margin-bottom: 4px; }
</style>
