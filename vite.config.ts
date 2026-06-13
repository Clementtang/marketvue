import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split node_modules into independently-cacheable vendor chunks so the
        // app chunk stays small and large libraries (charts especially) are
        // cached across deploys and loaded in parallel.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('d3-')) return 'recharts'
          if (id.includes('react-grid-layout') || id.includes('react-resizable'))
            return 'react-grid-layout'
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          )
            return 'react-vendor'
          return 'vendor'
        },
      },
    },
  },
})
