# Architecture Notes

## Product model

This is not being treated as a conventional game.

It is a virtual exhibition platform with a spatial, side-scrolling interface.

The first slice focuses on:
- solo exhibition
- later multi-artist/curated exhibition support
- shareable direct gallery entry
- automatic artwork layout
- manual overrides later
- portrait mobile
- reusable environment/theme systems

## Layering

Renderer-independent gallery data lives in `src/domain`.

Phaser-specific rendering lives in `src/game`.

The UI is DOM/CSS and is intentionally separate from the Phaser canvas.

Input is abstracted into actions so keyboard, mouse, touch and future gamepads can share the same control layer.

## Gallery entry

Two URL forms work:

- `?gallery=memory-archive`
- `#gallery/memory-archive`

The hash form is especially useful for static hosting because it does not require server-side route rewrites.

## Chunking

`WorldChunkManager` establishes the streaming boundary.

The phase-1 world still creates its visual architecture up front because the sample is tiny, but the manager already tracks active chunks and preload radius.

For production:
- create world objects only for active chunks
- unload far artwork textures
- keep nearby artwork cached
- never create a TileSprite larger than the actual canvas/viewport
- use texture atlases for repeated UI/small decoration
- use compressed textures selectively for high-value large assets

Phaser's TileSprite documentation explicitly warns against making a TileSprite thousands of pixels wide; instead it should match the actual rendering region and use tilePosition/tileScale. That principle should be preserved when implementing the production streaming version.

## Artwork inspection

Inspection does not replace the artwork with a portfolio page.

The world camera zooms toward the exhibit. The visitor character remains in the composition and freezes.

The DOM inspector becomes a text panel:
- title
- artist
- optional description
- ESC returns to exploration

## Backend seam

Later, replace:

`MockGalleryRepository`

with something like:

`SupabaseGalleryRepository`

without changing the game scene.

## Future packaging

### Web / PWA
Build with:

`npm run build`

Vite emits a static `dist/` directory.

### Desktop
Use Tauri 2 to wrap the existing Vite frontend.

### Native mobile
Use Capacitor 8 if native Android/iOS APIs become necessary.

Keep the gallery content format and rendering code web-first so the same exhibition data can travel between browser, desktop shell, and mobile shell.
