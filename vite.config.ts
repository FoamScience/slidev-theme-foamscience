import { defineConfig } from 'vite'

export default defineConfig({
  base: '/slidev-theme-foamscience/',
  optimizeDeps: {
    include: [
      'plotly.js-dist-min',
      'd3',
      'd3-shape'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
