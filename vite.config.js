import { defineConfig } from "vite";

// Relative base so the built output works from any subpath —
// GitHub Pages project sites, Vercel, and Netlify all serve fine with this.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});
