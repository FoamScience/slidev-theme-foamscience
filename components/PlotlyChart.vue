<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as Plotly from 'plotly.js-dist-min'
import { usePlotlyTheming } from '../composables/usePlotlyTheming'

interface Props {
  /**
   * Plotly data - can be a JSON file path or inline data object
   * @example data="/my-plot.json"
   * @example :data="{ data: [...], layout: {...} }"
   */
  data?: any | string

  /**
   * Optional layout overrides
   * These will be merged with the themed layout
   */
  layout?: Partial<Plotly.Layout>

  /**
   * Plot height in pixels or CSS value
   * @default 400
   */
  height?: number | string

  /**
   * Plot width in pixels or CSS value
   * @default '100%'
   */
  width?: number | string

  /**
   * Optional Plotly config overrides
   */
  config?: Partial<Plotly.Config>
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  width: '100%'
})

const plotDiv = ref<HTMLDivElement | null>(null)
const { plotlyLayout, plotlyConfig, deepMerge, isDark } = usePlotlyTheming()
const plotData = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

/**
 * Computed height style
 */
const heightStyle = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

/**
 * Computed width style
 */
const widthStyle = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

/**
 * Load plot data from file or use inline data
 */
const loadData = async () => {
  isLoading.value = true
  error.value = null

  try {
    if (typeof props.data === 'string') {
      // Load from JSON file
      const response = await fetch(props.data)
      if (!response.ok) {
        throw new Error(`Failed to load plot data: ${response.statusText}`)
      }
      plotData.value = await response.json()
    } else if (props.data) {
      // Use inline data
      plotData.value = props.data
    } else {
      throw new Error('No data provided to PlotlyChart')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error loading plot data'
    console.error('PlotlyChart error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Render or update the Plotly chart
 */
const renderPlot = async () => {
  if (!plotDiv.value || !plotData.value || isLoading.value) return

  try {
    // Extract data and layout from loaded JSON
    const data = plotData.value.data || plotData.value
    const userLayout = plotData.value.layout || {}

    // Merge themed layout with user layout and prop overrides
    const layout = deepMerge(
      plotlyLayout.value,
      deepMerge(userLayout, props.layout || {})
    )

    // Add explicit height to layout if not set
    if (!layout.height && typeof props.height === 'number') {
      layout.height = props.height
    }

    // Merge config
    const config = {
      ...plotlyConfig.value,
      ...props.config
    }

    // Use Plotly.react for efficient updates
    await Plotly.react(plotDiv.value, data, layout, config)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error rendering plot'
    console.error('PlotlyChart render error:', err)
  }
}

/**
 * Clean up Plotly instance on unmount
 */
const cleanup = () => {
  if (plotDiv.value) {
    Plotly.purge(plotDiv.value)
  }
}

// Load data on mount
onMounted(async () => {
  await loadData()
  await nextTick()
  await renderPlot()
})

// Re-render when theme changes
watch(isDark, async () => {
  await renderPlot()
})

// Re-render when data changes
watch(() => props.data, async () => {
  await loadData()
  await nextTick()
  await renderPlot()
})

// Re-render when layout prop changes
watch(() => props.layout, async () => {
  await renderPlot()
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="plotly-chart-container" :style="{ height: heightStyle, width: widthStyle }">
    <!-- Loading state -->
    <div v-if="isLoading" class="plotly-loading">
      <div class="plotly-spinner"></div>
      <div class="plotly-loading-text">Loading plot...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="plotly-error">
      <div class="plotly-error-icon">⚠</div>
      <div class="plotly-error-text">{{ error }}</div>
    </div>

    <!-- Plot -->
    <div
      v-else
      ref="plotDiv"
      class="plotly-plot"
      :style="{ height: '100%', width: '100%' }"
    ></div>
  </div>
</template>

<style scoped>
.plotly-chart-container {
  position: relative;
  width: 100%;
  min-height: 200px;
  background-color: var(--c-base);
  border-radius: 0.5rem;
  overflow: hidden;
}

.plotly-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  color: var(--c-subtext0);
}

.plotly-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--c-surface0);
  border-top-color: var(--c-blue);
  border-radius: 50%;
  animation: plotly-spin 0.8s linear infinite;
}

@keyframes plotly-spin {
  to {
    transform: rotate(360deg);
  }
}

.plotly-loading-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.plotly-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--c-red);
  text-align: center;
}

.plotly-error-icon {
  font-size: 3rem;
}

.plotly-error-text {
  font-size: 0.875rem;
  max-width: 400px;
}

.plotly-plot {
  display: block;
}

/* Ensure Plotly's mode bar uses theme colors */
.plotly-chart-container :deep(.modebar) {
  background-color: transparent !important;
}

.plotly-chart-container :deep(.modebar-btn) {
  color: var(--c-text) !important;
  fill: var(--c-text) !important;
}

.plotly-chart-container :deep(.modebar-btn:hover) {
  background-color: var(--c-surface0) !important;
}

.plotly-chart-container :deep(.modebar-btn.active) {
  background-color: var(--c-surface1) !important;
  color: var(--c-blue) !important;
  fill: var(--c-blue) !important;
}
</style>
