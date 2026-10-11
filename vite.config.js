import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true, // именно 5173 — этот адрес разрешён на сервере
    proxy: {
      '/api': {
        target: 'https://orbook-demo.orbitium.net', // демо; для боевого — https://orbook.orbitium.net
        changeOrigin: true, // заголовок Host = адрес сервера (нужно для nginx и сертификата)
        secure: true,       // проверять сертификат сервера
      },
    },
  },
});
