# Base64 Tools

Fast local-first workspace for encoding, decoding, inspecting, and validating Base64 payloads directly in the browser.

## Live Demo

[Open app on Cloudflare Pages](https://base64-tools.pages.dev/overview)

## Highlights

- **Encoders**: text, hex, files, images, PDFs, audio, video, and URLs to Base64.
- **Decoders**: Base64/Data URL decoding with auto-detection and preview support.
- **Data URL Tools**: parse `data:` URLs, inspect metadata, extract payloads.
- **Validator**: validate alphabet, length, padding, and URL-safe compatibility.
- **Themes + i18n**: multiple UI themes and language switching.

## Why This Project

Most Base64 tools are either too basic or overloaded with ads and tracking.  
This project focuses on a clean local workflow: quick input, quick result, clear metadata.

## Privacy

- Processing happens in your browser tab.
- Payloads are not uploaded to a backend.
- URL-based file loading is performed by your browser and may fail due to CORS.
- No third-party font/CDN requests are made by default.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- i18next / react-i18next

## Run Locally

```bash
nvm use
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

## Node Version

- Recommended: Node `22.x`
- CI coverage: Node `20.x` and `22.x`
- `.nvmrc` is included

## Scripts

- `npm run dev` - start dev server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run test` - run unit + UI tests
- `npm run test:e2e` - run Playwright e2e smoke tests
- `npm run build` - create production build
- `npm run preview` - preview production build

## Cloudflare Pages Setup

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22` (recommended)

## Project Structure

```text
src/
  components/      Reusable UI components
  configs/         Encoder/decoder mode configs
  hooks/           State and lifecycle hooks
  i18n/            Localization setup and dictionaries
  pages/           App pages
  store/           Zustand stores
  styles/          CSS layers and themes
  utils/           Base64/Data URL/MIME helpers
tests/
  e2e/             Playwright tests
  ui/              Vitest + RTL tests
```

## Limitations

- Very large payloads can hit browser memory limits.
- Some remote URLs cannot be fetched because of CORS/source policy.
- Preview availability depends on browser MIME/media support.

## License

MIT - see `LICENSE`.
