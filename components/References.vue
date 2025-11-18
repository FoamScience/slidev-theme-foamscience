<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useBibliography } from '../composables/useBibliography'

interface Props {
  bibFile?: string
  showAll?: boolean
  title?: string
  start?: number  // Starting index (0-based) of references to display
  limit?: number  // Maximum number of references to display
}

const props = withDefaults(defineProps<Props>(), {
  showAll: false,
  title: 'References',
  start: 0,
  limit: undefined
})

const { loadJsonFile, loadJsonFromUrl, citedReferences, allReferences, formatReference, bibFileLoaded } = useBibliography()
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (props.bibFile) {
    loading.value = true
    error.value = null

    try {
      // Check if it's a URL or file path
      if (props.bibFile.startsWith('http://') || props.bibFile.startsWith('https://')) {
        const success = await loadJsonFromUrl(props.bibFile)
        if (!success) {
          error.value = 'Failed to load bibliography from URL'
        }
      } else {
        // Assume it's a local file - fetch it
        const response = await fetch(props.bibFile)
        const content = await response.json()
        const success = await loadJsonFile(content)
        if (!success) {
          error.value = 'Failed to parse bibliography file'
        }
      }
    } catch (err) {
      error.value = `Error loading bibliography: ${err}`
      console.error('Bibliography loading error:', err)
    } finally {
      loading.value = false
    }
  }
})

const referencesToShow = computed(() => {
  const refs = props.showAll ? allReferences.value : citedReferences.value

  // Apply start and limit
  const start = props.start || 0
  const end = props.limit ? start + props.limit : undefined

  return refs.slice(start, end)
})

// Calculate the starting number for the ordered list (1-based)
const listStart = computed(() => (props.start || 0) + 1)
</script>

<template>
  <!--<div class="references-container">-->
    <!--<h2 class="references-title">{{ title }}</h2>-->

    <div v-if="loading" class="references-loading">
      Loading bibliography...
    </div>

    <div v-else-if="error" class="references-error">
      {{ error }}
    </div>

    <div v-else-if="!bibFileLoaded" class="references-info">
      No bibliography file loaded. Use the <code>bibFile</code> prop to load a JSON file (e.g., references.json).
    </div>

    <div v-else-if="referencesToShow.length === 0" class="references-empty">
      No references {{ showAll ? 'available' : 'cited' }}.
    </div>

    <ol v-else class="references-list" :start="listStart">
      <li
        v-for="{ key, entry } in referencesToShow"
        :id="`ref-${key}`"
        :key="key"
        class="reference-item"
      >
        <span class="reference-text">
          {{ formatReference(entry!) }}
        </span>
        <a
          v-if="entry!.DOI || entry!.doi"
          :href="`https://doi.org/${entry!.DOI || entry!.doi}`"
          target="_blank"
          class="reference-link"
          title="View on DOI"
        >
          DOI
        </a>
        <a
          v-else-if="entry!.URL || entry!.url"
          :href="entry!.URL || entry!.url"
          target="_blank"
          class="reference-link"
          title="View online"
        >
          URL
        </a>
      </li>
    </ol>
    <!--</div>-->
</template>

<style scoped>
.references-container {
  padding: 1.5rem;
  background-color: color-mix(in srgb, var(--c-surface0) 30%, transparent);
  border-left: 4px solid var(--c-blue);
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.references-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--c-overlay0);
  padding-bottom: 0.5rem;
}

.references-loading,
.references-error,
.references-info,
.references-empty {
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.references-loading {
  background-color: var(--c-surface1);
  color: var(--c-subtext0);
}

.references-error {
  background-color: color-mix(in srgb, var(--c-red) 20%, transparent);
  color: var(--c-red);
  border: 1px solid var(--c-red);
}

.references-info {
  background-color: var(--c-surface1);
  color: var(--c-subtext0);
}

.references-info code {
  background-color: var(--c-mantle);
  color: var(--c-mauve);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: var(--slidev-code-font-family);
}

.references-empty {
  background-color: var(--c-surface1);
  color: var(--c-subtext1);
  font-style: italic;
}

.references-list {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0;
}

.reference-item {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  color: var(--c-text);
  font-size: 0.9rem;
  line-height: 1.6;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.reference-item:hover {
  background-color: color-mix(in srgb, var(--c-surface1) 50%, transparent);
}

.reference-text {
  display: inline;
  color: var(--c-text);
}

.reference-link {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background-color: var(--c-blue);
  color: var(--c-base);
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.reference-link:hover {
  background-color: var(--c-sapphire);
  transform: translateY(-1px);
}

/* Highlight animation when scrolled to */
@keyframes highlight {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: color-mix(in srgb, var(--c-yellow) 30%, transparent);
  }
}

:deep(.highlight-reference) {
  animation: highlight 1s ease-in-out 2;
}
</style>
