import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // This configuration ensures that files with a .js extension are treated as .jsx,
  // allowing them to be parsed correctly by the esbuild loader.
  esbuild: {
    loader: 'jsx',
    include: [
      'src/**/*.js',
      'src/**/*.jsx',
    ],
  },
})
