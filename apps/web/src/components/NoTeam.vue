<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import EmptyState from './ui/EmptyState.vue';
</script>
<template>
  <EmptyState :icon="Users" title="Create a team first" description="Social accounts, posts and media belong to a team — usually one per brand or client. Use the team switcher in the sidebar to create one." />
</template>
