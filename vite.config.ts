import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        commonjsOptions: {
            defaultIsModuleExports: true,
        },
        // Fix for production build (Rollup)
        rollupOptions: {
            external: ['pdf.js', 'tesseract.js', 'jspdf', 'jspdf-autotable'],
        }
      },
      // 👇 FIX for development server (Esbuild)
      optimizeDeps: {
        // Exclude all modules loaded via Import Map from Esbuild's pre-bundling
        exclude: ['pdf.js', 'tesseract.js', 'jspdf', 'jspdf-autotable']
      }
    };
});