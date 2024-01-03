<div align="center">

# ChatGPT Sugar

Make Your ChatGPT Sweeter

[![license][license-image]][license-url]
[![release][release-image]][release-url]

### Install

[![chrome][chrome-image]][chrome-url] [![firefox][firefox-image]][firefox-url]
[![manual][manual-image]][manual-url]

[license-image]: https://img.shields.io/badge/license-GPLv3.0-blue.svg
[license-url]: https://github.com/yaozhiwang/chatgpt-sugar/blob/master/LICENSE
[release-image]:
  https://img.shields.io/github/v/release/yaozhiwang/chatgpt-sugar?color=blue
[release-url]: https://github.com/yaozhiwang/chatgpt-sugar/releases/latest
[chrome-image]:
  https://img.shields.io/badge/-Chrome-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white
[chrome-url]: https://chatgptsugar.xyz/chrome?utm_source=github
[firefox-image]:
  https://img.shields.io/badge/-Firefox-orange?style=for-the-badge&logo=firefox-browser&logoColor=white
[firefox-url]: https://chatgptsugar.xyz/firefox?utm_source=github
[manual-image]:
  https://img.shields.io/badge/-Manual-lightgrey?style=for-the-badge
[manual-url]: #manual-installation

### Screenshots

[![promo][promo-image]][promo-url]

[promo-image]: http://img.youtube.com/vi/ZUZkHaTC91U/0.jpg
[promo-url]: https://www.youtube.com/watch?v=ZUZkHaTC91U

</div>

ChatGPT Sugar is a Chrome extension designed to enrich your daily interactions
with ChatGPT. It's a collection of subtle and delightful tools, seamlessly
integrated into your ChatGPT experience.

## Features

- ChatGPT Journey: Transform your ChatGPT interactions into an illustrative
  timeline.

## Manual Installation

### Chrome

- Download `chatgpt-sugar-chrome.zip` from
  [Releases](https://github.com/yaozhiwang/chatgpt-sugar/releases)
- Unzip the file
- In Chrome go to the extensions page (`chrome://extensions`)
- Enable Developer Mode
- Drag the unzipped folder anywhere on the page to import it (do not delete the
  folder afterward)

### Firefox

- Download `chatgpt-sugar-firefox.zip` from
  [Releases](https://github.com/yaozhiwang/chatgpt-sugar/releases)
- Unzip the file
- In Firefox go to the settings page (`about:debugging#/runtime/this-firefox`)
- Click `Load Temporary Add-on...`
- import `manifest.json` from the unzipped directory (do not delete the folder
  afterward)

## Build from source

1. Clone the repo
2. Install dependencies with `bun install`
3. `bun run build` or `bun run build-firefox`
4. Load `dist/chrome` or `dist/firefox` directory to your browser
