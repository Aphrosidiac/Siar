<template>
  <div class="or" role="separator" aria-label="or"><span>or</span></div>
</template>

<style scoped>
.or { display: flex; align-items: center; gap: 12px; color: var(--text-subtle); font-size: var(--fs-12); }
.or::before, .or::after { content: ''; flex: 1; border-top: 1px solid var(--border); }
</style>
