import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'prevent-online-fonts',
      transform(code) {
        if (code.includes('fonts.googleapis.com')) {
          code = code.replace(/fonts\.googleapis\.com/g, '127.0.0.1/offline-stub');
          code = code.replace(/https:\/\/\$\{[a-zA-Z0-9_]+\}\/css2\?[^'"`]+/g, '/fonts/offline-font.css');
          return {
            code,
            map: null,
          };
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../wwwroot',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7061',
        changeOrigin: true,
        secure: false,
      },
      '/swagger': {
        target: 'https://localhost:7061',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
