import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port par défaut de Vite
    strictPort: false, // Permet à Vite de chercher un port disponible automatiquement
    hmr: {
      overlay: false, // Désactive l'overlay d'erreur HMR
    },
    proxy: {
      '/api': 'http://localhost:5000',  // Remplace par l'URL de ton backend
    },
  },
});
