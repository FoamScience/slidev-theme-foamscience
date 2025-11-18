<script setup lang="ts">
import { onMounted } from 'vue'

// This component watches for theme changes and triggers a page reload
// The actual Mermaid theming is handled in setup/mermaid.ts
onMounted(() => {
  // Watch for dark mode class changes on the html element
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        // When theme changes, reload the page to re-apply Mermaid theme
        window.location.reload()
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>

<template>
  <!-- This component doesn't render anything -->
</template>
