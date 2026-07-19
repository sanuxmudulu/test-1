# Testerup — Landing Page

A mobile-first game landing page built with plain Vite + HTML/CSS/JS (no framework).

## Structure

- `index.html` — entry point
- `src/main.js` — screen router (intro → game → final)
- `src/screens/` — one module per screen
- `src/game/` — board state, piece shapes/generation, drag-and-drop
- `src/cta.js` — builds the affiliate CTA URL from the incoming `source` query param
- `src/utils/date.js` — America/New_York boost-date formatting

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs a static site to `dist/` — deployable as-is to GitHub Pages, Vercel, or Netlify.
