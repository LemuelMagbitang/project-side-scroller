import { MockGalleryRepository } from './services/GalleryRepository';
import { createAppShell } from './ui/AppShell';
import { GalleryGame } from './game/GalleryGame';
import type { GalleryBundle } from './domain/models';
import './ui/styles.css';

const app = createAppShell();
const repository = new MockGalleryRepository();

let game: GalleryGame | null = null;
let currentBundle: GalleryBundle | null = null;

async function enterGallery(galleryId: string) {
  const bundle = await repository.get(galleryId);
  if (!bundle) {
    app.showToast(`Gallery "${galleryId}" was not found.`);
    return;
  }

  currentBundle = bundle;
  app.showGallery(bundle);

  game?.destroy();
  game = new GalleryGame(app.gameHost, bundle, {
    onInspectStart: (artwork) => app.openArtwork(artwork),
    onInspectEnd: () => app.closeInspector(),
    onSecret: (label) => app.showToast(`${label} · secret-area prototype`),
    onExit: () => {
      app.closeInspector();
      game?.destroy();
      game = null;
      currentBundle = null;
      app.showMenu();
    }
  });
}

app.setOpenGalleryHandler((galleryId) => {
  window.location.hash = `gallery/${galleryId}`;
  void enterGallery(galleryId);
});

app.setCloseInspectorHandler(() => {
  game?.exitInspection();
});

const bundles = await repository.list();
app.renderGalleryCards(bundles);

const requestedGalleryId = app.getRequestedGalleryId();

if (requestedGalleryId) {
  await enterGallery(requestedGalleryId);
} else {
  app.showMenu();
}

void currentBundle;
