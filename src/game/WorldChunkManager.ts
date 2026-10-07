export type WorldChunk = {
  index: number;
  startX: number;
  endX: number;
  active: boolean;
};

export class WorldChunkManager {
  private readonly chunks: WorldChunk[] = [];
  private activeRange = { from: -1, to: -1 };

  constructor(
    private readonly worldWidth: number,
    private readonly chunkWidth = 1024,
    private readonly preloadRadius = 1
  ) {
    const count = Math.ceil(worldWidth / chunkWidth);
    for (let index = 0; index < count; index += 1) {
      this.chunks.push({
        index,
        startX: index * chunkWidth,
        endX: Math.min((index + 1) * chunkWidth, worldWidth),
        active: false
      });
    }
  }

  update(playerX: number): { entered: WorldChunk[]; exited: WorldChunk[] } {
    const currentIndex = Math.max(
      0,
      Math.min(this.chunks.length - 1, Math.floor(playerX / this.chunkWidth))
    );

    const nextFrom = Math.max(0, currentIndex - this.preloadRadius);
    const nextTo = Math.min(this.chunks.length - 1, currentIndex + this.preloadRadius);

    const entered: WorldChunk[] = [];
    const exited: WorldChunk[] = [];

    for (const chunk of this.chunks) {
      const shouldBeActive = chunk.index >= nextFrom && chunk.index <= nextTo;

      if (shouldBeActive && !chunk.active) {
        chunk.active = true;
        entered.push(chunk);
      } else if (!shouldBeActive && chunk.active) {
        chunk.active = false;
        exited.push(chunk);
      }
    }

    this.activeRange = { from: nextFrom, to: nextTo };
    return { entered, exited };
  }

  getActiveRange() {
    return { ...this.activeRange };
  }

  getAll() {
    return [...this.chunks];
  }
}
