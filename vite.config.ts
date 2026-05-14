import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4200,
      proxy: {
        '/api/v1': {
          target: env.VITE_API_TARGET || 'https://testeonline.ro',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    preview: {
      port: 4200,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor';
            if (id.includes('@mui/material') || id.includes('@mui/icons-material') || id.includes('@emotion')) return 'mui';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
            if (id.includes('katex')) return 'katex';
          },
        },
      },
    },
  }
})
