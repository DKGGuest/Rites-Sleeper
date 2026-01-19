import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< Updated upstream
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
=======
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
>>>>>>> Stashed changes
})
