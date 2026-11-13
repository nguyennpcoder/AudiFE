import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

const LOCAL_BACKEND = 'http://localhost:8080'

/**
 * The codebase still contains a lot of hard-coded `http://localhost:8080`
 * URLs (images + API calls). Instead of touching ~40 files, they are rewritten
 * once at build time:
 *   /uploads/...  ->  VITE_MEDIA_URL  (Supabase Storage or the backend origin)
 *   /api/...      ->  VITE_API_ORIGIN (Render backend)
 * Only applied to production builds so `npm run dev` keeps using the Vite proxy.
 */
function rewriteLocalUrls(apiOrigin: string, mediaOrigin: string) {
  return {
    name: 'rewrite-local-urls',
    apply: 'build' as const,
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!/\.(t|j)sx?$/.test(id) || !code.includes(LOCAL_BACKEND)) return null
      const rewritten = code
        .split(`${LOCAL_BACKEND}/uploads`)
        .join(`${mediaOrigin}/uploads`)
        .split(`${LOCAL_BACKEND}/api`)
        .join(`${apiOrigin}/api`)
        .split(LOCAL_BACKEND)
        .join(apiOrigin)
      return { code: rewritten, map: null }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = (env.VITE_API_ORIGIN || 'https://audivn.onrender.com').replace(/\/+$/, '')
  const mediaOrigin = (env.VITE_MEDIA_URL || apiOrigin).replace(/\/+$/, '')

  return {
    plugins: [react(), rewriteLocalUrls(apiOrigin, mediaOrigin)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@rs7': fileURLToPath(new URL('./src/assets/rs7', import.meta.url)),
      },
    },
    assetsInclude: ['**/*.glb', '**/*.gltf'],
    server: {
      proxy: {
        '/api': { target: LOCAL_BACKEND, changeOrigin: true },
        '/uploads': { target: LOCAL_BACKEND, changeOrigin: true },
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            // One vendor chunk. Splitting React/antd/charts from each other
            // creates circular chunk imports (Rollup moves the shared CJS
            // interop helpers into a different chunk), which crashed the app
            // with "Cannot read properties of undefined (reading 'version')".
            return 'vendor'
          },
        },
      },
    },
  }
})
