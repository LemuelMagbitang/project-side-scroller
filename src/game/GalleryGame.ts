import Phaser from 'phaser';
import type { Artwork, GalleryBundle } from '../domain/models';
import { GalleryScene } from './GalleryScene';

export type GalleryGameCallbacks = {
  onInspectStart: (artwork: Artwork) => void;
  onInspectEnd: () => void;
  onSecret: (label: string) => void;
  onExit: () => void;
};

export class GalleryGame {
  private readonly game: Phaser.Game;

  constructor(
    host: HTMLElement,
    bundle: GalleryBundle,
    callbacks: GalleryGameCallbacks
  ) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 1280,
      height: 720,
      backgroundColor: '#08090d',
      transparent: false,
      antialias: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [GalleryScene]
    });

    this.game.events.once('ready', () => {
      this.game.scene.start('GalleryScene', {
        gallery: bundle.gallery,
        artworks: bundle.artworks,
        callbacks
      });
    });
  }

  exitInspection() {
    const scene = this.game.scene.getScene('GalleryScene') as GalleryScene | undefined;
    scene?.exitInspection();
  }

  destroy() {
    this.game.destroy(true);
  }
}
