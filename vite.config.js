import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// Куди Vite пересилає запити /api/... під час розробки.
// За замовчуванням — демо-сервер (вигадані дані). Інший сервер можна задати
// змінною середовища: API_TARGET=http://127.0.0.1:8711 npm run dev
const API_TARGET = process.env.API_TARGET || "https://orbook-demo.orbitium.net";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // саме 5173 — цю адресу сервер дозволяє (ORBOOK_DEV_ORIGINS)
    strictPort: true, // якщо порт зайнятий — помилка, а не інший порт
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true, // заголовок Host = адреса сервера (потрібно для nginx і сертифіката)
        secure: true, // перевіряти сертифікат сервера
      },
    },
  },
});
