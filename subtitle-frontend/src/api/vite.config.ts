import { defineConfig } from 'vite'; // ✅ Required
// import react from '@vitejs/plugin-react';
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
