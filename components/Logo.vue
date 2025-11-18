<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

// Get current slide frontmatter
const frontmatter = computed(() => $slidev?.nav?.currentSlideRoute?.meta?.slide?.frontmatter || {})

// Get logo configuration from frontmatter or global config
const logoLight = computed(() => frontmatter.value.logoLight || $slidev?.configs?.logoLight)
const logoDark = computed(() => frontmatter.value.logoDark || $slidev?.configs?.logoDark)
const logoClass = computed(() => frontmatter.value.logoClass || $slidev?.configs?.logoClass || 'px-4 py-4')

// Determine which logo to show based on dark mode
const isDark = computed(() => document.documentElement.classList.contains('dark'))

const currentLogo = computed(() => {
  if (isDark.value && logoDark.value) {
    return logoDark.value
  }
  if (!isDark.value && logoLight.value) {
    return logoLight.value
  }
  // Fallback: if only one is defined, use it
  return logoDark.value || logoLight.value
})

// Get current slide layout
const currentLayout = computed(() => frontmatter.value.layout || 'default')

// List of layouts where logo should be hidden
const hiddenLayouts = ['cover', 'image-right', 'iframe-right']

const showLogo = computed(() => {
  // Don't show if no logo is configured
  if (!(logoLight.value || logoDark.value)) {
    return false
  }

  // Hide logo on specific layouts
  if (hiddenLayouts.includes(currentLayout.value)) {
    return false
  }

  return true
})

// Check if current slide is the title/cover page (slide number 1)
const isCoverPage = computed(() => {
  return $slidev?.nav?.currentSlideNo === 1
})
</script>

<template>
  <div v-if="showLogo" class="slide-logo abs-tr m-6 " :class="[logoClass, { 'cover-logo': isCoverPage }]">
    <img :src="currentLogo" alt="Logo" class="logo-image" />
  </div>
</template>

<style scoped>
.logo-image {
  max-height: 80px;
  max-width: 200px;
  height: auto;
  width: auto;
  object-fit: contain;
}

/* Cover page specific styling */
.slide-logo.cover-logo {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  padding: 0 60px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.slide-logo.cover-logo .logo-image {
  max-height: 120px;
  max-width: 300px;
}
</style>
