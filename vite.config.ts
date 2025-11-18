import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['yup', 'tiny-case']
  },
  build: {
    commonjsOptions: {
      include: [/tiny-case/, /node_modules/]
    }
  }
})
