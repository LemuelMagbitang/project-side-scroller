import Phaser from 'phaser';
import type { FrameStyle } from '../domain/models';

export function createFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  style: FrameStyle
) {
  const palette: Record<FrameStyle, number> = {
    stone: 0x77727d,
    brass: 0x9b8764,
    glass: 0x8ca9be
  };

  const color = palette[style];

  const outer = scene.add.rectangle(x, y, width + 28, height + 28, color, 1);
  outer.setDepth(12);
  outer.setStrokeStyle(4, color, 0.78);

  const inner = scene.add.rectangle(x, y, width + 4, height + 4, 0x08090d, 1);
  inner.setDepth(13);
  inner.setStrokeStyle(2, 0xf3ebf4, style === 'glass' ? 0.12 : 0.08);

  if (style === 'glass') {
    const glass = scene.add.rectangle(x, y, width, height, 0xb9d7ea, 0.035);
    glass.setDepth(15);
    glass.setStrokeStyle(1, 0xdff5ff, 0.25);
  }

  return { outer, inner };
}
