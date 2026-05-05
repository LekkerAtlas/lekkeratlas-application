import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 80,
    host: true,
    allowedHosts: true  // This will allow all hosts
  },
  preview: {
    port: 80,
    host: true
  }
})
