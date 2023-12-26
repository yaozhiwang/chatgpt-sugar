import { defineManifest } from "@crxjs/vite-plugin"

import packageJson from "./package.json"

const { version } = packageJson

const name = "ChatGPT Sugar: Make Your ChatGPT A Little Sweeter"
const description =
  "Seamlessly enhances your ChatGPT interactions, adding a touch of sweetness to every conversation."

export default defineManifest(async (env) => {
  return {
    manifest_version: 3,
    name: env.mode !== "production" ? `[DEV] ${name}` : name,
    description,
    version,
    icons: {
      "16": "src/assets/logo.png",
      "32": "src/assets/logo.png",
      "48": "src/assets/logo.png",
      "128": "src/assets/logo.png"
    },
    background: {
      service_worker: "src/background/index.ts",
      type: "module"
    },
    action: {},
    host_permissions: ["https://*.openai.com/"],
    permissions: ["storage"],
    content_scripts: [
      {
        matches: ["https://chat.openai.com/*"],
        js: ["src/content-script/index.tsx"]
      }
    ]
  }
})
