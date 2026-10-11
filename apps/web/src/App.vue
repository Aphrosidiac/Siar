<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from '@/components/ui/Toast.vue';
import ConfirmHost from '@/components/ConfirmHost.vue';
</script>
<template>
  <RouterView />
  <Toast />
  <ConfirmHost />
</template>
