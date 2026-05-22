import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/vue') || id.includes('/node_modules/@vue') || id.includes('/node_modules/vue-router') || id.includes('/node_modules/pinia')) {
            return 'vendor-vue'
          }
          if (id.includes('/node_modules/vant') || id.includes('/node_modules/@vant')) {
            return 'vendor-vant'
          }
          if (id.includes('/node_modules/axios')) {
            return 'vendor-axios'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
