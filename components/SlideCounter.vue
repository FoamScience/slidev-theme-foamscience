<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  separator: ' / '
})

const positionClasses = computed(() => {
  const positions = {
    'bottom-right': 'bottom-1 right-2',
    'bottom-left': 'bottom-1 left-2',
    'top-right': 'top-1 right-2',
    'top-left': 'top-1 left-2'
  }
  return positions[props.position]
})
</script>

<template>

  <div class="abs-br m-6 text-xl">
    <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="slidev-icon-btn">
      <carbon:edit />
    </button>
    <a href="https://github.com/slidevjs/slidev" target="_blank" class="slidev-icon-btn">
      <carbon:logo-github />
    </a>
  </div>
  <div
    class="slide-counter abs-br m-6 z-10 px-0.5 backdrop-blur-sm transition-all duration-200"
    :class="positionClasses"
  >
    <span class="counter-text font-mono text-xs">
      <SlideCurrentNo />{{ separator }}<SlidesTotal />
    </span>
  </div>
</template>

<style scoped>
.slide-counter {
  background-color: color-mix(in srgb, var(--c-surface0) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-overlay0) 50%, transparent);
}

.counter-text {
  color: var(--c-subtext1);
  font-variant-numeric: tabular-nums;
}

.slide-counter:hover {
  background-color: color-mix(in srgb, var(--c-surface1) 85%, transparent);
  border-color: var(--c-overlay1);
}

.slide-counter:hover .counter-text {
  color: var(--c-text);
}
</style>
