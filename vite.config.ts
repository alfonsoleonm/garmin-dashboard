import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/garmin-dashboard/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Garmin Dashboard',
        short_name: 'GarminDash',
        description: 'Whoop-style recovery, strain and sleep dashboard over Garmin data',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        start_url: '/garmin-dashboard/',
        scope: '/garmin-dashboard/',
        icons: [
          {
            src: '/garmin-dashboard/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/garmin-dashboard/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/garmin-dashboard/index.html',
        runtimeCaching: [
          {
            // Never cache API responses
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
