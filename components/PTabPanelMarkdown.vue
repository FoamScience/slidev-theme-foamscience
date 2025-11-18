<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{
  value: string
}>()

const slots = useSlots()
</script>

<template>
  <PTabPanel :value="value">
    <div v-if="slots.default" class="markdown-content">
      <slot />
    </div>
  </PTabPanel>
</template>

<style scoped>
.markdown-content :deep(pre) {
  margin: 0;
}

.markdown-content :deep(code) {
  background-color: var(--c-mantle) !important;
  color: var(--c-text) !important;
}
</style>
