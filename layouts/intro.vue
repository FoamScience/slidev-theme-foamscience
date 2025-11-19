<template>
  <div class="slidev-layout intro">
    <div class="intro-container">
      <div class="intro-header">
        <img
          v-if="$slidev.configs.logoLight"
          :src="$slidev.configs.logoLight"
          class="intro-logo light-only"
          alt="Logo"
        />
        <img
          v-if="$slidev.configs.logoDark"
          :src="$slidev.configs.logoDark"
          class="intro-logo dark-only"
          alt="Logo"
        />
        <div class="section-badge">Section</div>
      </div>

      <div class="intro-content">
        <slot />
      </div>

      <div v-if="$frontmatter.subtitle" class="intro-footer">
        <p class="subtitle-text">{{ $frontmatter.subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro {
  background-color: var(--c-base);
  color: var(--c-text);
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
}

.intro-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}

.intro-header {
  margin-bottom: 3rem;
}

.intro-logo {
  max-height: 100px;
  max-width: 250px;
  margin-bottom: 2rem;
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

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--c-surface0);
  color: var(--c-blue);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--c-blue);
}

.intro-header h1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--c-blue);
  margin: 0;
  letter-spacing: -0.02em;
}

.intro-content {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--c-text);
}

.intro-content :deep(p) {
  margin-bottom: 1rem;
}

.intro-content :deep(ul),
.intro-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.intro-content :deep(li) {
  margin-bottom: 0.5rem;
}

.intro-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--c-overlay0);
}

.subtitle-text {
  font-size: 1.125rem;
  color: var(--c-subtext0);
  font-style: italic;
  margin: 0;
}

/* Dark mode adjustments */
html.dark .intro {
  background-color: var(--c-base);
}

html.dark .section-badge {
  background-color: var(--c-surface0);
}
</style>
