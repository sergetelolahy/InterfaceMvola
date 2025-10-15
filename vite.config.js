import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3001, // <-- mets le port que tu veux
  },
  // base: process.env.VITE_BASE_PATH || "TestMvola"
})
