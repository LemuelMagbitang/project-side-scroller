import type { Artwork, GalleryBundle } from '../domain/models';
import { sendInput, type InputAction } from '../input/InputController';

type OpenGalleryHandler = (galleryId: string) => void;
type CloseInspectorHandler = () => void;

export function createAppShell() {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) throw new Error('Missing #app root.');

  root.innerHTML = `
    <div class="app-shell">
      <main class="menu-view is-visible" data-view="menu">
        <div class="menu-atmosphere"></div>
        <section class="menu-content">
          <p class="eyebrow">VIRTUAL EXHIBITION PLATFORM · PHASE 1</p>
          <h1>MEMORY<br><span>GALLERY</span></h1>
          <p class="intro">
            Explore art as architecture. This prototype establishes the world, camera,
            depth bands, automatic artwork framing, shareable gallery entry, and responsive controls.
          </p>
          <div class="gallery-cards" data-gallery-cards></div>
          <div class="menu-footer">
            <span>A / D or ← / → · MOVE</span>
            <span>SHIFT / RMB · SPRINT</span>
            <span>F / E · INSPECT</span>
            <span>ESC · EXIT</span>
          </div>
          <p class="share-hint">Tip: a shared link can open directly into an exhibition using <code>#gallery/memory-archive</code>.</p>
        </section>
      </main>

      <section class="game-view" data-view="game" aria-hidden="true">
        <header class="game-hud">
          <button class="hud-button" data-exit>← EXIT GALLERY</button>
          <div class="hud-title" data-gallery-title></div>
          <div class="hud-status">MEMORY DOMAIN <span>●</span></div>
        </header>

        <div class="game-host" data-game-host></div>

        <div class="mobile-controls" aria-label="Mobile controls">
          <div class="mobile-cluster">
            <button data-action="left" aria-label="Move left">←</button>
            <button data-action="right" aria-label="Move right">→</button>
          </div>
          <div class="mobile-cluster mobile-cluster-right">
            <button data-action="sprint" class="sprint" aria-label="Sprint">RUN</button>
            <button data-action="interact" class="interact" aria-label="Inspect">F</button>
          </div>
        </div>

        <div class="debug-strip" data-debug-strip>
          <span>DEPTH BANDS</span>
          <span>CHUNK STREAM READY</span>
          <span>AUTO-FIT ARTWORK</span>
          <button data-toggle-guides>TOGGLE GUIDES [G]</button>
        </div>
      </section>

      <aside class="inspector" data-inspector aria-hidden="true">
        <div class="inspector-backdrop" data-close-inspector></div>
        <div class="inspector-layout">
          <div class="inspector-note">
            <p class="eyebrow">INSPECTION VIEW</p>
            <h2 data-inspector-title></h2>
            <p class="inspector-artist" data-inspector-artist></p>
            <p class="inspector-description" data-inspector-description></p>
            <div class="inspector-hint">ESC · RETURN TO GALLERY</div>
          </div>
        </div>
      </aside>

      <div class="toast" data-toast></div>
    </div>
  `;

  const menu = root.querySelector<HTMLElement>('[data-view="menu"]')!;
  const gameView = root.querySelector<HTMLElement>('[data-view="game"]')!;
  const gameHost = root.querySelector<HTMLElement>('[data-game-host]')!;
  const cards = root.querySelector<HTMLElement>('[data-gallery-cards]')!;
  const inspector = root.querySelector<HTMLElement>('[data-inspector]')!;
  const title = root.querySelector<HTMLElement>('[data-gallery-title]')!;
  const toast = root.querySelector<HTMLElement>('[data-toast]')!;

  let openGalleryHandler: OpenGalleryHandler = () => {};
  let closeInspectorHandler: CloseInspectorHandler = () => {};
  let guideMode = false;

  function showMenu() {
    menu.classList.add('is-visible');
    gameView.classList.remove('is-visible');
    gameView.setAttribute('aria-hidden', 'true');
    closeInspector();
  }

  function showGallery(bundle: GalleryBundle) {
    title.textContent = bundle.gallery.title;
    menu.classList.remove('is-visible');
    gameView.classList.add('is-visible');
    gameView.setAttribute('aria-hidden', 'false');
  }

  function openArtwork(artwork: Artwork) {
    root.querySelector<HTMLElement>('[data-inspector-title]')!.textContent = artwork.title;
    root.querySelector<HTMLElement>('[data-inspector-artist]')!.textContent =
      artwork.artist;
    root.querySelector<HTMLElement>('[data-inspector-description]')!.textContent =
      artwork.description ?? 'No description provided.';
    inspector.classList.add('is-visible');
    inspector.setAttribute('aria-hidden', 'false');
  }

  function closeInspector() {
    if (!inspector.classList.contains('is-visible')) return;
    inspector.classList.remove('is-visible');
    inspector.setAttribute('aria-hidden', 'true');
    closeInspectorHandler();
  }

  function showToast(message: string) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  function setGuidesVisible(visible: boolean) {
    guideMode = visible;
    gameView.classList.toggle('guides-on', guideMode);
  }

  root.querySelector('[data-exit]')?.addEventListener('click', () => {
    closeInspector();
    showMenu();
  });

  root.querySelectorAll<HTMLElement>('[data-close-inspector]').forEach((el) => {
    el.addEventListener('click', closeInspector);
  });

  root.querySelector('[data-toggle-guides]')?.addEventListener('click', () => {
    setGuidesVisible(!guideMode);
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyG' && gameView.classList.contains('is-visible')) {
      setGuidesVisible(!guideMode);
    }

    if (event.code === 'Escape' && inspector.classList.contains('is-visible')) {
      closeInspector();
    }
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    const action = button.dataset.action as InputAction;

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      sendInput(action, 'down');
    });

    button.addEventListener('pointerup', (event) => {
      event.preventDefault();
      sendInput(action, 'up');
    });

    button.addEventListener('pointercancel', () => sendInput(action, 'up'));
    button.addEventListener('pointerleave', () => {
      if (action === 'sprint' || action === 'left' || action === 'right') {
        sendInput(action, 'up');
      }
    });
  });

  function renderGalleryCards(bundles: GalleryBundle[]) {
    cards.innerHTML = bundles
      .map(
        (bundle, index) => `
          <button class="gallery-card" data-gallery-id="${bundle.gallery.id}">
            <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
            <strong>${bundle.gallery.title}</strong>
            <span>${bundle.gallery.description}</span>
            <small>${bundle.artworks.length} works · ${bundle.gallery.atmosphere}</small>
          </button>
        `
      )
      .join('');
  }

  cards.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-gallery-id]'
    );
    if (!target?.dataset.galleryId) return;
    openGalleryHandler(target.dataset.galleryId);
  });

  return {
    gameHost,

    renderGalleryCards,

    setOpenGalleryHandler(handler: OpenGalleryHandler) {
      openGalleryHandler = handler;
    },

    setCloseInspectorHandler(handler: CloseInspectorHandler) {
      closeInspectorHandler = handler;
    },

    showMenu,
    showGallery,
    openArtwork,
    closeInspector,
    showToast,

    getRequestedGalleryId() {
      const query = new URLSearchParams(window.location.search);
      const queryGallery = query.get('gallery');
      if (queryGallery) return queryGallery;

      const hash = window.location.hash;
      const match = hash.match(/^#gallery\/([^/]+)$/);
      return match?.[1] ?? null;
    }
  };
}
