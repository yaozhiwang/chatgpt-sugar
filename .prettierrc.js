/**
 * @type {import('prettier').Options}
 */
export default {
  "printWidth": 80,
  "proseWrap": "always",
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": true,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "pluginSearchDirs": false,
  "tailwindFunctions": [
    "classNames"
  ],
  "importOrder": [
    "^@(.*)$",
    "^~(.*)$",
    "^[../]",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
