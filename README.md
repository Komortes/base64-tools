# Base64 Tools

A local-first toolkit for encoding and decoding Base64, Data URLs, and binary payloads directly in the browser.

## Live Instance

`https://base64-tools.pages.dev/overview`

## Features

- `Encoders`: convert text, hex, files, images, PDFs, audio, video, and URLs to Base64.
- `Decoders`: decode Base64/Data URLs with auto-detection and preview support.
- `Data URL Tools`: parse `data:` URLs, inspect metadata, extract payloads, and preview output.
- `Validator`: validate Base64 alphabet, padding, length, and URL-safe compatibility.

## Privacy

- All processing happens in your browser.
- The app does not upload your payloads to a backend service.
- URL-based file loading is performed by your browser and may be blocked by CORS.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router

## Quick Start

```bash
npm install
npm run dev
```

By default, the app runs at `http://localhost:5173`.

## Scripts

- `npm run dev` - start development server.
- `npm run typecheck` - run TypeScript project checks.
- `npm run test:unit` - run `node:test` utility tests.
- `npm run test:ui` - run React UI tests (Vitest + RTL).
- `npm run test:e2e` - run Playwright e2e smoke tests.
- `npm run test:coverage` - enforce coverage threshold gates (80%+).
- `npm run build` - run type-check and create production build.
- `npm run preview` - preview production build locally.
- `npm run lint` - run ESLint.

## Project Structure

```text
src/
  components/      UI components
  configs/         mode configs (encoders/decoders)
  hooks/           React hooks
  pages/           tool pages
  styles/          CSS layers
  utils/           Base64, Data URL, MIME, and helper utilities
tests/
  e2e/             Playwright end-to-end checks
  ui/              Vitest + RTL UI tests
```

## Limitations

- Very large payloads may hit browser tab memory limits.
- Some remote URLs cannot be fetched because of CORS/source policies.
- Preview support depends on MIME handling in the current browser.

## Roadmap Ideas

- Web Worker support for heavy operations on large files.
- Batch mode for multi-file processing.
- Unit tests for `utils` (Base64/Data URL/MIME detection).
- Extended validator with auto-fix options.
