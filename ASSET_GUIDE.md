# Asset Guide — Memory Gallery Phase 1

This prototype is intentionally built around author-friendly boundaries.

## World reference

Desktop logical world:
- Reference viewport: 1280 × 720
- World extends horizontally; the camera follows the visitor.
- World origin: top-left.
- `x` increases left → right.
- `y` increases top → bottom.

Mobile:
- Portrait viewport target: 720 × 1280.
- The gallery world does not rotate.
- The camera zooms in automatically to fill the portrait viewport.
- Touch controls are overlaid by the web UI.

## Depth bands

Use named bands instead of thinking in raw Z values:

1. background
2. far / mid architecture
3. gallery wall
4. artwork
5. artwork effects / light
6. architectural dressing
7. player
8. foreground
9. UI / screen effects

## Starter asset dimensions

| Asset | Size | Intended use |
|---|---:|---|
| background architecture | 1920 × 1080 | slow parallax |
| wall tile | 1024 × 512 | seamless gallery wall |
| floor tile | 1024 × 512 | seamless floor |
| foreground pillar | 512 × 1024 | near-screen depth |
| portrait frame guide | 800 × 1000 | reference |
| landscape frame guide | 1200 × 800 | reference |
| square frame guide | 900 × 900 | reference |
| player guide | 256 × 512 | character bounds |
| UV checker | 512 × 512 | texture inspection |

## Artwork placement

The engine reads the source image dimensions and fits the image inside a maximum display rectangle while preserving aspect ratio.

Artists can later override:
- maximum width
- maximum height
- manual scale
- X offset
- Y offset

This means portrait, landscape, square, and panoramic images can coexist without forcing them into one frame ratio.

## UV / texture testing

Use `assets/testing/uv-checker-64.svg` as a temporary texture when authoring tiles.

A seamless tile must match at its opposing edges. Do not bake a shadow or highlight that crosses a tile boundary unless the theme is explicitly designed around that repetition.

## Important convention

Keep source artwork assets separate from presentation assets.

Good:
- user artwork
- frame
- wall tile
- lighting
- foreground

Avoid baking the frame and wall into the artwork PNG/SVG. That makes future CMS layout and theme switching much harder.
