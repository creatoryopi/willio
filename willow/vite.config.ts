import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        // Forward API calls to the local Express server (server/index.js),
        // which is the only place the OpenAI key ever lives.
        '/api': {
          target: `http://localhost:${process.env.PORT || 8787}`,
          changeOrigin: true,
        },
      },
    },
  };
});
