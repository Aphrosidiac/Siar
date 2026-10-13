<script setup lang="ts">
import Input from '@/components/ui/Input.vue';
import { MASTODON_SERVERS } from '@/lib/networks';

defineProps<{ error?: string | null }>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="mf">
    <Input v-model="model" label="Your Mastodon address" placeholder="@you@mastodon.social" autocomplete="username" required autofocus :error="error"
      help="The address people use to find you. Just the server name works too." />
    <div class="picks" role="group" aria-label="Popular servers">
      <span class="tiny muted">Popular:</span>
      <button v-for="s in MASTODON_SERVERS" :key="s" type="button" class="pick" :class="{ on: model === s }" @click="model = s">{{ s }}</button>
    </div>
  </div>
</template>

<style scoped>
.mf { display: flex; flex-direction: column; gap: 8px; }
.picks { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.pick { border: 1px solid var(--border-soft); background: var(--bg-muted); color: var(--text-muted); border-radius: var(--radius-pill); padding: 3px 10px; font-size: var(--fs-13); cursor: pointer; transition: background var(--t-micro), color var(--t-micro); }
.pick:hover { color: var(--text); }
.pick.on { background: var(--text); color: var(--bg); border-color: var(--text); }
</style>
