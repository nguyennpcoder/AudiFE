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
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('antd') || id.includes('@ant-design')) return 'antd'
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('leaflet')) return 'maps'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-router')) return 'router'
            if (id.includes('/react/') || id.includes('react-dom') || id.includes('scheduler')) return 'react'
            return
          },
        },
      },
    },
  }
})
