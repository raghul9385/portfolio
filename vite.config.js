import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * `npm run build`        → split build: small HTML plus a separate vendor chunk.
 * `npm run build:single` → everything inlined into one dist/index.html
 *                          (useful for previews).
 */
export default defineConfig(() => {
  const single = process.env.SINGLE_FILE === '1';

  return {
    base: './',
    // during `npm run dev`, /api goes to the contact server
    server: {
      proxy: {
        '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:8787', changeOrigin: true },
      },
    },
    plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
    build: {
      target: 'es2020',
      cssCodeSplit: !single,
      rollupOptions: single
        ? {}
        : {
            output: {
              manualChunks(id) {
                if (!id.includes('node_modules')) return undefined;
                if (/react|scheduler|motion/.test(id)) return 'vendor';
                return undefined;
              },
            },
          },
    },
  };
});
