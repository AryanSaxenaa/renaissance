import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: path.resolve(__dirname, './dist/client'),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true
  }
});
