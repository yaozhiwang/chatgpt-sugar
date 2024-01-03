import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import { crx } from "@crxjs/vite-plugin"
import react from "@vitejs/plugin-react"

import manifest from "./manifest.config"

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    crx({
      manifest,
      browser: process.env.BROWSER === "firefox" ? "firefox" : "chrome"
    })
  ]
})
