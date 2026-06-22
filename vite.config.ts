import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
 
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'https://4.188.243.158:7081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});