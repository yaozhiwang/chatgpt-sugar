import { defineManifest } from "@crxjs/vite-plugin"

import packageJson from "./package.json"

const { version } = packageJson

const name = "ChatGPT Sugar: Make Your ChatGPT Sweeter"
const description =
  "A collection of subtle and delightful tools, seamlessly integrated into your ChatGPT experience."

export default defineManifest(async (env) => {
  return {
    ...{
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
      action: {},
      host_permissions: ["https://*.openai.com/"],
      permissions: [],
      content_scripts: [
        {
          matches: ["https://chat.openai.com/*"],
          js: ["src/content-script/index.tsx"]
        }
      ]
    },
    ...(process.env.BROWSER === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "firefox@chatgptsugar.xyz",
          strict_min_version: "42.0"
        }
      }
    })
  }
})
