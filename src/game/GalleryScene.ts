import Phaser from 'phaser';
import type { Artwork, Exhibit, GalleryBundle } from '../domain/models';
import { InputController } from '../input/InputController';
import { createFrame } from './FrameRenderer';
import { WorldChunkManager } from './WorldChunkManager';

const WORLD_HEIGHT = 720;
const FLOOR_Y = 622;
const PLAYER_Y = 558;
const WORLD_WIDTH = 5200;

export type GallerySceneCallbacks = {
  onInspectStart: (artwork: Artwork) => void;
  onInspectEnd: () => void;
  onSecret: (label: string) => void;
  onExit: () => void;
};

export type GallerySceneData = GalleryBundle & {
  callbacks: GallerySceneCallbacks;
};

export class GalleryScene extends Phaser.Scene {
  private bundle!: GalleryBundle;
  private callbacks!: GallerySceneCallbacks;
  private input!: InputController;
  private player!: Phaser.GameObjects.Image;
  private prompt!: Phaser.GameObjects.Text;
  private secretPrompt!: Phaser.GameObjects.Text;
  private currentExhibit: Exhibit | null = null;
  private inspecting = false;
  private chunkManager!: WorldChunkManager;
  private inspectionExhibitX = 0;

  constructor() {
    super('GalleryScene');
  }

  init(data: GallerySceneData) {
    this.bundle = {
      gallery: data.gallery,
      artworks: data.artworks
    };
    this.callbacks = data.callbacks;
  }

  preload() {
    this.load.image('player', '/assets/player/player-silhouette-256x512.svg');
    this.load.image('background', '/assets/gallery/background-architecture-1920x1080.svg');
    this.load.image('wall-tile', '/assets/gallery/wall-tile-1024x512.svg');
    this.load.image('floor-tile', '/assets/gallery/floor-tile-1024x512.svg');
    this.load.image('foreground-pillar', '/assets/gallery/foreground-pillar-512x1024.svg');

    for (const artwork of this.bundle.artworks) {
      this.load.image(artwork.id, artwork.imageUrl);
    }
  }

  create() {
    this.input = new InputController();
    this.chunkManager = new WorldChunkManager(WORLD_WIDTH);

    this.buildWorld();
    this.buildPlayer();
    this.buildPrompts();
    this.setupResponsiveCamera();

    this.scale.on('resize', this.setupResponsiveCamera, this);
    this.events.once('destroy', () => {
      this.input.destroy();
      this.scale.off('resize', this.setupResponsiveCamera, this);
    });

    this.chunkManager.update(this.player.x);
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.033);

    if (this.input.takePressed('escape')) {
      if (this.inspecting) {
        this.exitInspection();
      } else {
        this.callbacks.onExit();
      }
      return;
    }

    if (this.inspecting) {
      return;
    }

    const direction =
      Number(this.input.isHeld('right')) - Number(this.input.isHeld('left'));

    if (direction !== 0) {
      const speed = this.input.isHeld('sprint') ? 360 : 190;
      this.player.x = Phaser.Math.Clamp(
        this.player.x + direction * speed * dt,
        150,
        WORLD_WIDTH - 150
      );
      this.player.setFlipX(direction < 0);
      this.player.setScale(direction < 0 ? -1 : 1, 1);
    }

    const nearest = this.findNearestExhibit();
    this.currentExhibit = nearest?.distance <= 170 ? nearest.exhibit : null;

    this.prompt.setVisible(Boolean(this.currentExhibit));
    this.secretPrompt.setVisible(this.isNearSecretArea());

    if (this.input.takePressed('interact')) {
      if (this.currentExhibit?.artworkId) {
        this.enterInspection(this.currentExhibit);
      } else if (this.isNearSecretArea()) {
        this.callbacks.onSecret(this.bundle.gallery.secretArea?.label ?? 'SECRET ARCHIVE');
      }
    }

    this.updatePromptPosition();
    this.chunkManager.update(this.player.x);
  }

  public exitInspection() {
    if (!this.inspecting) return;

    this.inspecting = false;
    this.callbacks.onInspectEnd();

    const camera = this.cameras.main;
    camera.stopFollow();

    this.tweens.add({
      targets: camera,
      zoom: this.getBaseZoom(),
      duration: 420,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: camera,
      scrollX: Phaser.Math.Clamp(
        this.player.x - this.getViewportWorldWidth() / 2,
        0,
        WORLD_WIDTH - this.getViewportWorldWidth()
      ),
      duration: 420,
      ease: 'Sine.easeInOut',
      onComplete: () => camera.startFollow(this.player, false, 0.08, 0.08)
    });
  }

  private buildWorld() {
    const bg = this.add.image(WORLD_WIDTH / 2, 330, 'background');
    bg.setDisplaySize(1920, 1080);
    bg.setDepth(0);
    bg.setScrollFactor(0.08);

    for (let x = 0; x < WORLD_WIDTH; x += 960) {
      const wall = this.add.image(x + 480, 370, 'wall-tile');
      wall.setDisplaySize(1024, 512);
      wall.setDepth(2);
    }

    for (let x = 0; x < WORLD_WIDTH; x += 1024) {
      const floor = this.add.image(x + 512, 640, 'floor-tile');
      floor.setDisplaySize(1024, 512);
      floor.setDepth(3);
    }

    for (let x = 220; x < WORLD_WIDTH; x += 1024) {
      const pillar = this.add.image(x, 420, 'foreground-pillar');
      pillar.setDisplaySize(180, 560);
      pillar.setDepth(40);
      pillar.setScrollFactor(1.12);
    }

    const roofShadow = this.add.rectangle(
      WORLD_WIDTH / 2,
      125,
      WORLD_WIDTH,
      100,
      0x06070a,
      0.44
    );
    roofShadow.setDepth(4);

    for (const exhibit of this.bundle.gallery.exhibits) {
      const artwork = this.getArtwork(exhibit.artworkId);
      if (!artwork) continue;
      this.addExhibit(exhibit, artwork);
    }

    this.buildSecretArea();

    const atmosphericGlow = this.add.circle(900, 350, 480, 0x7d5aaa, 0.028);
    atmosphericGlow.setDepth(6);
    atmosphericGlow.setScrollFactor(0.55);
  }

  private addExhibit(exhibit: Exhibit, artwork: Artwork) {
    const source = this.textures.get(artwork.id).get();
    const sourceWidth = source.width || artwork.sourceWidth || 1000;
    const sourceHeight = source.height || artwork.sourceHeight || 1000;

    const layout = {
      maxWidth: exhibit.layout?.maxWidth ?? 280,
      maxHeight: exhibit.layout?.maxHeight ?? 255,
      manualScale: exhibit.layout?.manualScale ?? 1,
      offsetX: exhibit.layout?.offsetX ?? 0,
      offsetY: exhibit.layout?.offsetY ?? 0
    };

    const scale = Math.min(
      layout.maxWidth / sourceWidth,
      layout.maxHeight / sourceHeight
    ) * layout.manualScale;

    const displayWidth = Math.round(sourceWidth * scale);
    const displayHeight = Math.round(sourceHeight * scale);

    createFrame(
      this,
      exhibit.x + layout.offsetX,
      exhibit.y + layout.offsetY,
      displayWidth,
      displayHeight,
      exhibit.frame
    );

    const image = this.add.image(
      exhibit.x + layout.offsetX,
      exhibit.y + layout.offsetY,
      artwork.id
    );
    image.setDisplaySize(displayWidth, displayHeight);
    image.setDepth(14);

    const label = this.add.text(
      exhibit.x - 145,
      exhibit.y + displayHeight / 2 + 42,
      artwork.title.toUpperCase(),
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#ded7e1',
        letterSpacing: 2
      }
    );
    label.setDepth(16);

    if (exhibit.spotlight) {
      const spotlight = this.add.graphics();
      spotlight.fillStyle(0xded5ff, 0.028);
      spotlight.fillTriangle(
        exhibit.x - displayWidth / 2 - 90,
        190,
        exhibit.x + displayWidth / 2 + 90,
        190,
        exhibit.x,
        exhibit.y + 230
      );
      spotlight.lineStyle(1, 0xece5f2, 0.08);
      spotlight.lineBetween(
        exhibit.x - displayWidth / 2 - 90,
        190,
        exhibit.x,
        exhibit.y + 230
      );
      spotlight.lineBetween(
        exhibit.x + displayWidth / 2 + 90,
        190,
        exhibit.x,
        exhibit.y + 230
      );
      spotlight.setDepth(5);
    }
  }

  private buildPlayer() {
    this.player = this.add.image(170, PLAYER_Y, 'player');
    this.player.setDisplaySize(68, 136);
    this.player.setDepth(30);

    const rim = this.add.circle(170, PLAYER_Y + 10, 56, 0x9a82c0, 0.075);
    rim.setDepth(28);
  }

  private buildPrompts() {
    this.prompt = this.add.text(0, 0, 'F / E  ·  INSPECT', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#f2ebf3',
      backgroundColor: '#0b0c10',
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    });
    this.prompt.setOrigin(0.5);
    this.prompt.setScrollFactor(0);
    this.prompt.setDepth(1000);
    this.prompt.setVisible(false);

    this.secretPrompt = this.add.text(0, 0, 'F / E  ·  ENTER SECRET ARCHIVE', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#cdb8e0',
      backgroundColor: '#0b0c10',
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    });
    this.secretPrompt.setOrigin(0.5);
    this.secretPrompt.setScrollFactor(0);
    this.secretPrompt.setDepth(1000);
    this.secretPrompt.setVisible(false);
  }

  private buildSecretArea() {
    const secret = this.bundle.gallery.secretArea;
    if (!secret) return;

    const door = this.add.rectangle(secret.x, 480, 120, 250, 0x090a0e, 0.96);
    door.setDepth(8);
    door.setStrokeStyle(2, 0x9b82bf, 0.3);

    const frame = this.add.rectangle(secret.x, 480, 140, 270, 0x2a2631, 0.55);
    frame.setDepth(7);
    frame.setStrokeStyle(2, 0x8a779d, 0.18);

    const mark = this.add.text(secret.x, 492, '◇', {
      fontFamily: 'serif',
      fontSize: '42px',
      color: '#9e83c1'
    });
    mark.setOrigin(0.5);
    mark.setDepth(9);

    const label = this.add.text(secret.x, 628, secret.label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#8c8192',
      letterSpacing: 3
    });
    label.setOrigin(0.5);
    label.setDepth(9);
  }

  private enterInspection(exhibit: Exhibit) {
    if (!exhibit.artworkId) return;

    const artwork = this.getArtwork(exhibit.artworkId);
    if (!artwork) return;

    this.inspecting = true;
    this.inspectionExhibitX = exhibit.x;
    this.callbacks.onInspectStart(artwork);

    const camera = this.cameras.main;
    camera.stopFollow();

    const targetZoom = Math.min(2.25, this.getBaseZoom() * 1.58);
    const targetX = Phaser.Math.Clamp(
      exhibit.x - this.getViewportWorldWidth() * 0.14,
      0,
      WORLD_WIDTH - this.getViewportWorldWidth()
    );

    this.tweens.add({
      targets: camera,
      zoom: targetZoom,
      scrollX: targetX,
      scrollY: 0,
      duration: 520,
      ease: 'Sine.easeInOut'
    });

    this.prompt.setVisible(false);
    this.secretPrompt.setVisible(false);
  }

  private setupResponsiveCamera() {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    camera.setZoom(this.getBaseZoom());

    if (this.player && !this.inspecting) {
      camera.startFollow(this.player, false, 0.08, 0.08);
      camera.setDeadzone(this.isPortrait() ? 120 : 320, 150);
    }
  }

  private getBaseZoom() {
    const width = Math.max(this.scale.width, 1);
    const height = Math.max(this.scale.height, 1);

    if (height > width) {
      // Portrait: keep the 720px-tall gallery world filling the tall viewport.
      return Math.max(1.65, height / WORLD_HEIGHT);
    }

    return 1;
  }

  private getViewportWorldWidth() {
    return Math.max(this.scale.width / this.cameras.main.zoom, 1);
  }

  private isPortrait() {
    return this.scale.height > this.scale.width;
  }

  private updatePromptPosition() {
    const x = this.scale.width * 0.5;
    const y = this.scale.height - (this.isPortrait() ? 142 : 62);
    this.prompt.setPosition(x, y);
    this.secretPrompt.setPosition(x, y - 45);
  }

  private findNearestExhibit() {
    let best: { exhibit: Exhibit; distance: number } | undefined;

    for (const exhibit of this.bundle.gallery.exhibits) {
      const distance = Math.abs(this.player.x - exhibit.x);
      if (!best || distance < best.distance) {
        best = { exhibit, distance };
      }
    }

    return best;
  }

  private isNearSecretArea() {
    const secret = this.bundle.gallery.secretArea;
    if (!secret) return false;
    return Math.abs(this.player.x - secret.x) < 170;
  }

  private getArtwork(id?: string) {
    return id ? this.bundle.artworks.find((artwork) => artwork.id === id) : undefined;
  }
}
