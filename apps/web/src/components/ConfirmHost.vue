<script setup lang="ts">
import { computed } from 'vue';
import Modal from './ui/Modal.vue';
import Button from './ui/Button.vue';
import Input from './ui/Input.vue';
import { confirmState, settleConfirm } from '@/lib/confirm';
const ok = computed(() => !confirmState.opts?.requireText || confirmState.typed === confirmState.opts.requireText);
</script>
<template>
  <Modal :open="confirmState.open" :title="confirmState.opts?.title" size="sm" @close="settleConfirm(false)">
    <form class="stack-16" @submit.prevent="ok && settleConfirm(true)">
      <p v-if="confirmState.opts?.message" class="muted prewrap">{{ confirmState.opts.message }}</p>
      <Input v-if="confirmState.opts?.requireText" v-model="confirmState.typed" :label="`Type “${confirmState.opts.requireText}” to confirm`" autofocus autocomplete="off" />
      <div class="row" style="justify-content: flex-end">
        <Button variant="secondary" @click="settleConfirm(false)">{{ confirmState.opts?.cancelLabel ?? 'Cancel' }}</Button>
        <Button type="submit" :variant="confirmState.opts?.danger ? 'danger' : 'primary'" :disabled="!ok" autofocus>{{ confirmState.opts?.confirmLabel ?? 'Confirm' }}</Button>
      </div>
    </form>
  </Modal>
</template>
