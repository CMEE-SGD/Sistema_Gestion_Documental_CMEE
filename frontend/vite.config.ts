import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Solo Buffer: lo usan @signpdf/* y node-forge para la firma digital en
    // el navegador. Sin esto, `Buffer` no existe como global fuera de Node.
    nodePolyfills({ include: ["buffer"] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
})