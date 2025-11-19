<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Chart from './Chart.vue'
import type { ChartData } from './Chart.vue'

interface ChartState {
  data: ChartData | string
  label?: string
}

interface Props {
  states: ChartState[]
  type?: 'line' | 'bar' | 'scatter' | 'bubble' | 'pie' | 'doughnut'
  height?: number | string
  autoPlay?: boolean
  autoPlayInterval?: number
  transitionDuration?: number
  legendPosition?: 'top-left' | 'top-center' | 'top-right' | 'right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  height: 400,
  autoPlay: false,
  autoPlayInterval: 3000,
  transitionDuration: 1000,
  legendPosition: 'right'
})

const chartRef = ref<InstanceType<typeof Chart> | null>(null)
const currentStateIndex = ref(0)
const isPlaying = ref(false)
const loadedStates = ref<ChartData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Load all chart states
const loadStates = async () => {
  loading.value = true
  error.value = null

  try {
    const promises = props.states.map(async (state) => {
      if (typeof state.data === 'string') {
        // Add cache-busting parameter to force fresh data
        const url = state.data.includes('?')
          ? `${state.data}&_=${Date.now()}`
          : `${state.data}?_=${Date.now()}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to load state: ${response.statusText}`)
        }
        const data = await response.json()
        return data
      }
      return state.data
    })

    loadedStates.value = await Promise.all(promises)
  } catch (err) {
    error.value = `Error loading chart states: ${err}`
    console.error('Chart states loading error:', err)
  } finally {
    loading.value = false
  }
}

const currentData = computed(() => {
  if (loadedStates.value.length === 0) return null
  const idx = currentStateIndex.value
  if (idx < 0 || idx >= loadedStates.value.length) return null
  const data = loadedStates.value[idx]
  // Add currentState index for incremental rendering
  return { ...data, currentState: idx }
})

const currentLabel = computed(() => {
  const idx = currentStateIndex.value
  if (idx < 0 || idx >= props.states.length) return 'Unknown State'
  return props.states[idx]?.label || `State ${idx + 1}`
})

const canGoNext = computed(() => currentStateIndex.value < props.states.length - 1)
const canGoPrev = computed(() => currentStateIndex.value > 0)

const nextState = () => {
  if (canGoNext.value) {
    currentStateIndex.value++
  }
}

const prevState = () => {
  if (canGoPrev.value) {
    currentStateIndex.value--
  }
}

const goToState = (index: number) => {
  if (index >= 0 && index < props.states.length) {
    currentStateIndex.value = index
  }
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

// Auto-play functionality
let autoPlayTimer: ReturnType<typeof setInterval> | null = null

watch(isPlaying, (playing) => {
  if (playing) {
    autoPlayTimer = setInterval(() => {
      if (canGoNext.value) {
        nextState()
      } else {
        // Loop back to start or stop
        currentStateIndex.value = 0
      }
    }, props.autoPlayInterval)
  } else {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer)
      autoPlayTimer = null
    }
  }
})

// Update chart when state changes
watch(currentData, (newData, oldData) => {
  if (newData && chartRef.value && newData !== oldData) {
    chartRef.value.updateData(newData)
  }
}, { deep: false })

onMounted(async () => {
  await loadStates()
  if (props.autoPlay) {
    isPlaying.value = true
  }
})

// Keyboard controls
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === 'n') {
    nextState()
  } else if (event.key === 'ArrowLeft' || event.key === 'p') {
    prevState()
  } else if (event.key === ' ' || event.key === 'Enter') {
    togglePlay()
    event.preventDefault()
  }
}
</script>

<template>
  <div class="animated-chart-container" @keydown="handleKeyPress" tabindex="0">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>Loading chart states...</p>
    </div>

    <div v-else-if="error" class="chart-error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="animated-chart-content">
      <div class="chart-header">
        <h3 class="chart-label">{{ currentLabel }}</h3>
        <div class="chart-controls-compact">
          <button
            class="control-button-compact"
            :disabled="!canGoPrev"
            @click="prevState"
            title="Previous state (← or P)"
          >
            <div class="i-carbon:chevron-left" />
          </button>

          <button
            class="control-button-compact play-button-compact"
            @click="togglePlay"
            :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
          >
            <div :class="isPlaying ? 'i-carbon:pause' : 'i-carbon:play'" />
          </button>

          <button
            class="control-button-compact"
            :disabled="!canGoNext"
            @click="nextState"
            title="Next state (→ or N)"
          >
            <div class="i-carbon:chevron-right" />
          </button>

          <div class="chart-state-info">
            {{ currentStateIndex + 1 }} / {{ states.length }}
          </div>
        </div>
      </div>

      <Chart
        ref="chartRef"
        :type="type"
        :data="currentData"
        :height="height"
        :animation-duration="transitionDuration"
        :legend-position="legendPosition"
      />
    </div>
  </div>
</template>

<style scoped>
.animated-chart-container {
  outline: none;
}

.animated-chart-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.25rem;
  margin-bottom: 0.5rem;
}

.chart-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.chart-controls-compact {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.control-button-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--c-surface0);
  border: 1px solid var(--c-overlay0);
  border-radius: 0.25rem;
  color: var(--c-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  padding: 0;
}

.control-button-compact:hover:not(:disabled) {
  background-color: var(--c-blue);
  border-color: var(--c-blue);
  color: var(--c-base);
}

.control-button-compact:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.play-button-compact {
  background-color: var(--c-blue);
  border-color: var(--c-blue);
  color: var(--c-base);
}

.play-button-compact:hover {
  background-color: var(--c-sapphire);
  border-color: var(--c-sapphire);
}

.chart-state-info {
  font-size: 0.75rem;
  color: var(--c-subtext0);
  font-family: 'Fira Code', monospace;
  background-color: var(--c-surface0);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
  line-height: 1;
}

.chart-loading,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--c-text);
}

.chart-error {
  color: var(--c-red);
}

.chart-error p {
  margin: 0;
  padding: 1rem;
  background-color: color-mix(in srgb, var(--c-red) 20%, transparent);
  border: 1px solid var(--c-red);
  border-radius: 0.375rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--c-surface0);
  border-top-color: var(--c-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
