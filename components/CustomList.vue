<script setup lang="ts">
import { provide, useSlots, ref, onMounted, nextTick, h, VNode, createVNode } from 'vue'
import CustomListItem from './CustomListItem.vue'

const props = defineProps<{
  variant?: 'default' | 'compact' | 'spaced'
}>()

const slots = useSlots()

// Provide the shared marker to all child CustomListItem components
provide('sharedMarker', slots.marker)

const listRef = ref<HTMLElement | null>(null)
const parsedItems = ref<VNode[]>([])

onMounted(async () => {
  await nextTick()

  if (!listRef.value) return

  // Look for markdown-generated ul/ol elements within the default slot
  const markdownList = listRef.value.querySelector('ul, ol')

  if (markdownList) {
    // Get all list items from the markdown
    const items = Array.from(markdownList.querySelectorAll(':scope > li'))

    // Convert markdown list items to CustomListItem components
    parsedItems.value = items.map((li) => {
      // Clone the actual DOM node to preserve the rendered HTML
      const contentDiv = document.createElement('div')
      contentDiv.innerHTML = li.innerHTML

      return h(CustomListItem, {}, {
        default: () => h('div', { innerHTML: li.innerHTML })
      })
    })

    // Hide the original markdown list
    markdownList.style.display = 'none'
  }
})
</script>

<template>
  <ul ref="listRef" class="custom-list" :class="`custom-list-${variant || 'default'}`">
    <!-- Render parsed items if they exist -->
    <component v-for="(item, index) in parsedItems" :key="index" :is="item" />

    <!-- Otherwise render slotted content -->
    <slot v-if="parsedItems.length === 0" />
  </ul>
</template>

<style scoped>
.custom-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.custom-list-default {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.custom-list-spaced {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
