<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  background?: string
  backgroundOpacity?: number
}>()

// Default opacity to 0.65 if not specified
const overlayOpacity = computed(() => props.backgroundOpacity ?? 0.65)
</script>

<template>
  <div class="slidev-layout cover">
    <!-- Background image -->
    <div
      v-if="background"
      class="cover-background"
      :style="{ backgroundImage: `url(${background})` }"
    />
    <!-- Transparent overlay -->
    <div v-if="background" class="cover-overlay" :style="{ opacity: overlayOpacity }" />

    <div class="cover-main">
      <!-- Blur backdrop with gradient (only when background image exists) -->
      <div v-if="background" class="cover-blur-backdrop" />

      <div class="cover-header">
        <img
          v-if="$slidev.configs.logoLight"
          :src="$slidev.configs.logoLight"
          class="cover-logo light-only"
          alt="Logo"
        />
        <img
          v-if="$slidev.configs.logoDark"
          :src="$slidev.configs.logoDark"
          class="cover-logo dark-only"
          alt="Logo"
        />
        <slot />
      </div>

    </div>
  </div>
</template>

<style scoped>
.cover {
  background-color: var(--c-base);
  color: var(--c-text);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.cover-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--c-base);
  z-index: 1;
}

.cover-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1100px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
}

.cover-blur-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 0;
  /* Radial gradient mask for blur fade effect */
  mask-image: radial-gradient(
    ellipse 60% 50% at center,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 60% 50% at center,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}

.cover-header {
  width: 100%;
  position: relative;
  z-index: 1;
}

.cover-logo {
  max-height: 120px;
  max-width: 300px;
  margin: 0 auto 3rem;
  display: block;
  object-fit: contain;
}

.light-only {
  display: block;
}

.dark-only {
  display: none;
}

html.dark .light-only {
  display: none;
}

html.dark .dark-only {
  display: block;
}

.cover-header :deep(h1) {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 2rem;
  color: var(--c-blue);
  letter-spacing: -0.02em;
}

.cover-header :deep(h1 + p) {
  font-size: 1.5rem;
  line-height: 1.6;
  color: var(--c-subtext0);
  font-weight: 400;
  max-width: 800px;
  margin: -1rem auto 0;
}

/* Dark mode adjustments */
html.dark .cover {
  background-color: var(--c-base);
}
</style>
