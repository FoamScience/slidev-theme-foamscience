<script setup lang="ts">
import { ref, computed } from 'vue'
import Chart from './Chart.vue'

const testData = {
  labels: ['A', 'B', 'C'],
  datasets: [{
    label: 'Test',
    data: [10, 20, 30]
  }]
}

const chartRef = ref(null)
const logs = ref<string[]>([])

</script>

<template>
  <div style="padding: 1rem; background: #1e1e2e; color: #cdd6f4;">
    <h3>Chart Debug</h3>

    <div style="margin: 1rem 0;">
      <h4>Logs:</h4>
      <div v-for="(log, i) in logs" :key="i" style="font-family: monospace; font-size: 11px; padding: 2px 0;">
        {{ log }}
      </div>
    </div>

    <div style="margin: 1rem 0;">
      <h4>Test Chart (bar):</h4>
      <Chart ref="chartRef" type="bar" :data="testData" :height="200" />
    </div>

    <div style="margin: 1rem 0;">
      <h4>Raw Data:</h4>
      <pre style="background: #11111b; padding: 0.5rem; border-radius: 4px; font-size: 10px; overflow-x: auto;">{{ JSON.stringify(testData, null, 2) }}</pre>
    </div>
  </div>
</template>
