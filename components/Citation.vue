<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBibliography } from '../composables/useBibliography'

interface Props {
  id: string
  citationStyle?: 'numeric' | 'author-year'
  format?: 'brackets' | 'parentheses' | 'superscript'
  showAsFootnote?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  citationStyle: 'numeric',
  format: 'brackets',
  showAsFootnote: false
})

const { addCitation, formatCitation, getCitation, formatReference, bibFileLoaded } = useBibliography()
const showFootnote = ref(false)

onMounted(() => {
  addCitation(props.id)
})

const entry = computed(() => {
  return getCitation(props.id)
})

const citationText = computed(() => {
  // Force re-computation when bibliography loads or entry changes
  if (!bibFileLoaded.value || !entry.value) {
    return '?'
  }
  return formatCitation(props.id, props.citationStyle)
})

const tooltipText = computed(() => {
  if (!entry.value) return 'Citation not found'

  const year = entry.value.year ||
    entry.value.issued?.['date-parts']?.[0]?.[0] ||
    'n.d.'

  return `${entry.value.title} (${year})`
})

const formattedCitation = computed(() => {
  if (props.format === 'superscript') {
    return citationText.value
  } else if (props.format === 'parentheses') {
    return `(${citationText.value})`
  } else {
    return `[${citationText.value}]`
  }
})

const handleClick = () => {
  if (props.showAsFootnote) {
    showFootnote.value = !showFootnote.value
  } else {
    // Try to scroll to reference on References slide
    const refElement = document.getElementById(`ref-${props.id}`)
    if (refElement) {
      refElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      refElement.classList.add('highlight-reference')
      setTimeout(() => {
        refElement.classList.remove('highlight-reference')
      }, 2000)
    } else {
      // If reference not found, show as footnote temporarily
      showFootnote.value = true
      setTimeout(() => {
        showFootnote.value = false
      }, 5000)
    }
  }
}
</script>

<template>
  <span class="citation-wrapper">
    <span
      class="citation"
      :class="{ 'citation-superscript': format === 'superscript', 'citation-missing': !entry, 'citation-active': showFootnote }"
      :title="tooltipText"
      @click="handleClick"
    >
      {{ formattedCitation }}
    </span>
    <Transition name="footnote">
      <div v-if="showFootnote && entry" class="citation-footnote">
        <div class="footnote-content">
          <div class="footnote-text">
            <span class="footnote-number">[{{ citationText }}]</span>
            {{ formatReference(entry) }}
          </div>
          <div class="footnote-links">
            <a
              v-if="entry.DOI || entry.doi"
              :href="`https://doi.org/${entry.DOI || entry.doi}`"
              target="_blank"
              class="footnote-link"
              title="View on DOI"
              @click.stop
            >
              DOI
            </a>
            <a
              v-if="entry.URL || entry.url"
              :href="entry.URL || entry.url"
              target="_blank"
              class="footnote-link"
              title="View online"
              @click.stop
            >
              URL
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </span>
</template>

<style scoped>
.citation-wrapper {
  position: relative;
  display: inline-block;
}

.citation {
  color: var(--c-blue);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.citation:hover {
  color: var(--c-sapphire);
  text-decoration: underline;
}

.citation-active {
  color: var(--c-sapphire);
  background-color: color-mix(in srgb, var(--c-blue) 20%, transparent);
  border-radius: 0.25rem;
  padding: 0 0.25rem;
}

.citation-superscript {
  vertical-align: super;
  font-size: 0.75em;
}

.citation-missing {
  color: var(--c-red);
  cursor: not-allowed;
}

.citation-missing:hover {
  color: var(--c-maroon);
  text-decoration: line-through;
}

.citation-footnote {
  position: fixed;
  bottom: 3rem;
  right: 1rem;
  max-width: 45%;
  min-width: 30%;
  z-index: 1000;
}

.footnote-content {
  background-color: var(--c-surface0);
  border: 2px solid var(--c-blue);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: var(--c-text);
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footnote-text {
  flex: 1;
}

.footnote-number {
  color: var(--c-blue);
  font-weight: 600;
  margin-right: 0.5rem;
}

.footnote-links {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.footnote-link {
  padding: 0.25rem 0.75rem;
  background-color: var(--c-blue);
  color: var(--c-base);
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.footnote-link:hover {
  background-color: var(--c-sapphire);
  transform: translateY(-1px);
}

/* Transition animations */
.footnote-enter-active,
.footnote-leave-active {
  transition: all 0.3s ease;
}

.footnote-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.footnote-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
