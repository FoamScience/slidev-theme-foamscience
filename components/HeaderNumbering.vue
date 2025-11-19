<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue'
import { useNav, useSlideInfo } from '@slidev/client'

const nav = useNav()
const { currentSlideNo, total, slides } = nav

const STORAGE_KEY = 'slidev-header-numbering'
const processedSlides = ref(new Set<number>())

// Calculate and store header numbering
function calculateHeaderNumbering() {
  const slideElements = document.querySelectorAll('.slidev-page')
  const numberingMap: Record<number, Record<number, string>> = {}

  let h1Counter = 0
  let h2Counter = 0
  let currentH1 = 0
  let lastH1Text = ''
  let lastH2Text = ''

  slideElements.forEach((slide, slideIndex) => {
    numberingMap[slideIndex] = {}

    // Skip first slide (cover page)
    if (slideIndex === 0) {
      return
    }

    // Check frontmatter for hideInToc
    const slideData = slides.value?.[slideIndex]
    if (slideData?.frontmatter?.hideInToc === true) {
      return
    }

    // Skip slides that should not have numbering
    // Skip ToC slides (they contain the Toc component which renders a <nav> with class 'slidev-toc')
    const hasToc = slide.querySelector('.slidev-toc') !== null

    if (hasToc) {
      return
    }

    const headers = slide.querySelectorAll('h1, h2')

    headers.forEach((header, headerIndex) => {
      const headerText = header.textContent?.trim() || ''

      if (header.tagName === 'H1') {
        // Only increment if the text is different from the last H1
        if (headerText !== lastH1Text) {
          h1Counter++
          lastH1Text = headerText
          h2Counter = 0
          lastH2Text = ''
        }
        currentH1 = h1Counter
        numberingMap[slideIndex][headerIndex] = `${h1Counter}❯`
      } else if (header.tagName === 'H2') {
        // Only increment if the text is different from the last H2
        if (headerText !== lastH2Text) {
          h2Counter++
          lastH2Text = headerText
        }
        numberingMap[slideIndex][headerIndex] = `${currentH1}.${h2Counter}❯`
      }
    })
  })

  // Store in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(numberingMap))
  return numberingMap
}

// Apply header numbering from map
function applyHeaderNumbering(numberingMap?: Record<number, Record<number, string>>) {
  const slideElements = document.querySelectorAll('.slidev-page')

  slideElements.forEach((slide, slideIndex) => {
    const headers = slide.querySelectorAll('h1, h2')

    headers.forEach((header, headerIndex) => {
      if (numberingMap && numberingMap[slideIndex]?.[headerIndex]) {
        header.setAttribute('data-number', numberingMap[slideIndex][headerIndex])
      } else {
        header.removeAttribute('data-number')
      }
    })
  })
}

onMounted(() => {
  document.body.classList.add('header-numbering-enabled')

  // Clear stale cache to force fresh calculation
  localStorage.removeItem(STORAGE_KEY)

  // Recalculate after slides are loaded
  let attempts = 0
  let lastHeaderCount = 0

  function recalculateWhenReady() {
    attempts++
    const slideElements = document.querySelectorAll('.slidev-page')
    const expectedSlides = total.value

    // Count total headers found across all slides
    let totalHeaders = 0
    slideElements.forEach(slide => {
      totalHeaders += slide.querySelectorAll('h1, h2').length
    })

    // Wait until we have slides and headers are appearing
    if (slideElements.length >= expectedSlides && expectedSlides > 0 && totalHeaders > 0) {
      // If header count is still increasing, wait more
      if (totalHeaders > lastHeaderCount && attempts < 30) {
        lastHeaderCount = totalHeaders
        setTimeout(recalculateWhenReady, 300)
        return
      }

      const numberingMap = calculateHeaderNumbering()
      applyHeaderNumbering(numberingMap)
    } else if (attempts < 30) {
      setTimeout(recalculateWhenReady, 300)
    } else {
    }
  }

  setTimeout(recalculateWhenReady, 800)

  // Watch for new headers being added to the DOM
  const observer = new MutationObserver((mutations) => {
    let foundNewHeaders = false
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.tagName === 'H1' || node.tagName === 'H2' ||
              node.querySelector('h1, h2')) {
            foundNewHeaders = true
          }
        }
      })
    })

    if (foundNewHeaders) {
      const numberingMap = calculateHeaderNumbering()
      applyHeaderNumbering(numberingMap)
    }
  })

  // Observe the entire slideshow container
  const slideshow = document.querySelector('#slideshow')
  if (slideshow) {
    observer.observe(slideshow, {
      childList: true,
      subtree: true
    })
  }

  // Watch for slide changes and recalculate if needed
  watch(currentSlideNo, () => {
    // Give the new slide time to render its content
    setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const numberingMap = JSON.parse(stored)
          applyHeaderNumbering(numberingMap)
        } catch (e) {
          // If cached data is invalid, recalculate
          const numberingMap = calculateHeaderNumbering()
          applyHeaderNumbering(numberingMap)
        }
      } else {
        // No cache, recalculate
        const numberingMap = calculateHeaderNumbering()
        applyHeaderNumbering(numberingMap)
      }
    }, 100)
  })

})
</script>

<template>
  <!-- This component doesn't render anything -->
</template>
