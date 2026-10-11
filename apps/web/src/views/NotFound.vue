<script setup lang="ts">
import { SearchX } from 'lucide-vue-next';
import EmptyState from '@/components/ui/EmptyState.vue';
import Button from '@/components/ui/Button.vue';
</script>
<template>
  <div style="min-height: 100vh; display: grid; place-items: center; padding: 24px">
    <EmptyState :icon="SearchX" title="Page not found" description="The page you are looking for does not exist or was moved.">
      <Button to="/posts" variant="primary">Go to Posts</Button>
    </EmptyState>
  </div>
</template>
