# Future Packaging — Web → Desktop → Mobile

## Web

The first target is a static Vite site:

```bash
npm run build
```

The output is `dist/`. Relative asset URLs allow the same build to work from a subpath such as GitHub Pages.

The prototype accepts direct exhibition entry through:

```text
#gallery/memory-archive
```

This is intentionally compatible with static hosting because it does not require server-side route rewrites.

## Desktop

Tauri 2 is the preferred wrapper for Windows, Linux and macOS. Tauri can bring an existing web frontend into a native shell while keeping the gallery renderer unchanged.

```text
Vite + Phaser
     ↓
 Tauri shell
     ↓
Windows / Linux / macOS
```

## Mobile

Tauri 2 can also target Android/iOS with the platform webview. Keep the browser build responsive and touch-first so the same gallery data and renderer remain usable.

Capacitor 8 is a viable fallback when a mobile-only native integration is easier through its plugin model.

## Architecture rule

Keep these platform-neutral:

- gallery/domain models
- artwork layout rules
- chunk definitions
- interaction semantics
- repository interfaces

Only the following should vary by platform:

- native application shell
- touch/gesture affordances
- filesystem/native integrations
- OS share / notification / deep-link integrations

## QR / share links

The future public URL should identify the exhibition, not the visitor's camera state. Example:

```text
https://gallery.example/#gallery/artist-name/exhibition-id
```

A QR code can point to that web URL first. Later, the same public identity can be associated with native app/universal-link flows.
