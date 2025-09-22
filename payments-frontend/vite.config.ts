import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 3001,
    https: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Ensure all assets are copied to dist
    copyPublicDir: true,
  },
  define: {
    // Ensure environment variables are properly replaced at build time
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Ensure public files are properly served
  publicDir: 'public',
})
