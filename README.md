# Project Side Scroller — Virtual Exhibition Prototype

Phase 1 prototype for a web-first virtual exhibition platform.

## What is implemented

- Vite + TypeScript
- Phaser 4.2.1
- WebGL-capable 2D renderer
- Side-scrolling horizontal gallery
- Desktop keyboard controls
- Right-mouse sprint
- Portrait mobile controls
- Automatic artwork sizing by source aspect ratio
- Procedural presentation frames
- Layered/parallax architecture
- Chunk manager foundation
- Camera-based artwork inspection
- ESC to exit inspection and gallery
- Secret-area prototype
- Direct-entry share URL support
- Artist-facing technical asset kit
- UV checker / authoring boundary references
- GitHub Pages workflow

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

Production check:

```bash
npm run typecheck
npm run build
npm run preview
```

## Direct gallery links

The prototype accepts:

```text
?gallery=memory-archive
```

or:

```text
#gallery/memory-archive
```

Example:

```text
https://your-site.example/#gallery/memory-archive
```

## Controls

Desktop:
- A / D or Left / Right
- Shift or right mouse button = sprint
- F / E = inspect
- ESC = exit inspection / gallery

Mobile:
- portrait mode
- left/right buttons
- RUN button
- F button

## Project philosophy

The gallery is data first.

The renderer is replaceable.

The UI is separate from the world.

The input system is platform-neutral.

That gives the project room to evolve into:
- a CMS
- solo artist galleries
- curated exhibitions
- gallery themes
- QR links
- social discovery
- secret rooms
- richer environmental interactions
- desktop and mobile application shells
