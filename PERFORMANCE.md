# Performance Strategy — Virtual Exhibition

The exhibition can contain much more art than is visible at once. The important rule is: **visual density is cheap; pixel memory and network bytes are expensive.**

## 1. Stream artwork, do not preload the whole exhibition

Keep metadata for the full exhibition, but load image textures only for the current chunk plus a small preload radius. The phase-1 `WorldChunkManager` establishes that boundary.

```text
player
  ↓
current chunk
  ↓
preload next / previous chunk
  ↓
unload far artwork textures
```

## 2. Store multiple image levels

Plan for at least:

```text
original  → archival / creator-owned master
large     → inspection view
medium    → normal gallery display
thumbs    → gallery menu / social discovery
```

Do not download a 6000px-wide original when the artwork is currently shown at a few hundred CSS pixels. Responsive image selection can reduce unnecessary network bytes on smaller devices. See the web.dev responsive image guidance.

## 3. Prefer modern raster formats for paintings / photos

Generate AVIF and WebP derivatives with a fallback. WebP is broadly supported; AVIF can achieve lower file sizes at comparable visual quality. Keep PNG where lossless edges/transparency are actually needed.

Never replace the artist's archival original with a lossy derivative.

## 4. Tile the architecture

Wall and floor pieces are tiles. Do not create a 20,000px-wide wall texture. Phaser 4's TileSprite system repeats textures through the renderer and supports texture frames/atlases.

## 5. Separate appearance layers

Keep wall, frame, artwork, spotlight, furniture, player and foreground as separate renderables. This lets the same artwork appear under future themes without rebaking the theme into the artwork.

## 6. Keep large uploads away from the GPU

WebGL hardware limits vary. MDN notes that 4096 × 4096 is a common minimum capability for `MAX_TEXTURE_SIZE`, but higher limits are hardware-dependent. Production ingestion should therefore create display-sized derivatives rather than relying on the device to consume giant originals.

## 7. Minimize unnecessary draw-call churn

Use repeating tiles, atlases for small repeating decoration, stable depth/layer ordering, and reuse textures. Avoid generating one unique giant texture per decorative object.

## 8. Keep normal UI in HTML/CSS

Menus, descriptions, buttons, metadata and upload controls remain DOM/CSS. Phaser is responsible for the spatial exhibition. This improves accessibility and avoids turning every UI text element into a game texture.

## 9. Portrait mobile is a first-class layout

Use the same gallery data but a different camera framing and touch overlay. Mobile should generally receive smaller artwork derivatives and fewer expensive atmospheric effects.

## 10. Recommended starting budgets

These are project targets, not platform guarantees:

- Initial interactive gallery: target roughly 5–8 MB compressed visual assets.
- Nearby artwork textures: target roughly 32–64 MB decoded image memory on mobile.
- Load only a few large artworks ahead of the visitor.
- Keep far background layers low resolution when blur/fog makes the extra pixels invisible.
- Measure on real mid-range Android hardware before increasing effects.

## 11. Future decode optimization

`createImageBitmap()` is widely available and can be used in Web Workers. This is a possible later optimization for a custom artwork streaming pipeline; it is not required in Phase 1.

## 12. Profile continuously

Use browser DevTools and Lighthouse to inspect network waterfalls, transferred image bytes, rendering behavior, memory, and throttled mobile performance.

Never optimize only against a desktop GPU.
