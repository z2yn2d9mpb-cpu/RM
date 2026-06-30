# The Ryan Chronicles 🎈

A custom, mobile-first birthday website for Ryan's 20th. It opens like a postcard,
then scrolls through his whole life (a card for every age, 0–20), shows an animated
travel route from home to Corfu, a photo gallery with a lightbox, and a wall of
birthday messages.

Built with **Next.js (App Router) + React + TypeScript**, recreated from a Claude
design handoff. Deploys cleanly to **Vercel**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

Import the GitHub repo on [Vercel](https://vercel.com/new) — the framework preset
**Next.js** and root directory `./` are auto-detected. Click **Deploy**. No
environment variables or backend are required for v1.

## Customizing the content

Almost everything lives in [`app/data.ts`](app/data.ts):

- **`milestones`** — the age 0–20 timeline cards (title + text; set `photo: true`
  to show a photo placeholder).
- **`galleryItems`** — the "Snapshots" row captions.
- **`messages`** — the birthday notes. Replace the placeholder names/text with real
  ones from friends & family.

### Replacing the photos

Every photo and the Europe map are diagonal-striped placeholders. To drop in real
images, edit the placeholder blocks in [`app/page.tsx`](app/page.tsx) (search for
`stripe(` and `europe map`) and swap them for `<img>` / `next/image`.

## Project structure

```
app/
  layout.tsx    fonts (Caveat, DM Sans, JetBrains Mono) + metadata
  page.tsx      the full single-page card + interactions
  data.ts       all editable content
  globals.css   base styles + keyframes
```
