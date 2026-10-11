<script setup lang="ts">
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import MediaBrowser from '@/components/MediaBrowser.vue';
import { session } from '@/lib/store';
</script>
<template>
  <div class="page wide">
    <PageHead title="Media library" subtitle="Images, video and documents for this team. Click files to select them for deletion." />
    <NoTeam v-if="!session.teamId" />
    <MediaBrowser v-else :key="session.teamId" />
  </div>
</template>
