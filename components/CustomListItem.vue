<script setup lang="ts">
import { inject, useSlots } from 'vue'

const slots = useSlots()
const sharedMarker = inject<any>('sharedMarker', null)
</script>

<template>
  <li class="custom-list-item">
    <div class="custom-list-marker">
      <!-- Use item-specific marker if provided, otherwise use shared marker, otherwise use default -->
      <slot name="marker">
        <component v-if="sharedMarker" :is="sharedMarker" />
        <span v-else class="default-marker">•</span>
      </slot>
    </div>
    <div class="custom-list-content">
      <slot />
    </div>
  </li>
</template>

<style scoped>
.custom-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.custom-list-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 1.5rem;
  min-height: 1.5rem;
  margin-top: 0.125rem;
}

.custom-list-marker :deep(svg),
.custom-list-marker :deep(i),
.custom-list-marker :deep(.iconify) {
  width: 1.25rem;
  height: 1.25rem;
}

.default-marker {
  font-size: 1.25rem;
  line-height: 1;
  color: var(--c-blue);
}

.custom-list-content {
  flex: 1;
  min-width: 0;
}

/* Support markdown content */
.custom-list-content :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.custom-list-content :deep(p:not(:last-child)) {
  margin-bottom: 0.5rem;
}

.custom-list-content :deep(strong) {
  font-weight: 600;
  color: var(--c-text);
}

.custom-list-content :deep(em) {
  font-style: italic;
  color: var(--c-subtext0);
}

.custom-list-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  padding: 0.125rem 0.25rem;
  background-color: var(--c-surface0);
  border-radius: 0.25rem;
  color: var(--c-text);
}

.custom-list-content :deep(a) {
  color: var(--c-blue);
  text-decoration: none;
  transition: color 0.2s;
}

.custom-list-content :deep(a:hover) {
  color: var(--c-sapphire);
  text-decoration: underline;
}

.custom-list-content :deep(ul),
.custom-list-content :deep(ol) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.custom-list-content :deep(ul li),
.custom-list-content :deep(ol li) {
  margin: 0.25rem 0;
}
</style>
