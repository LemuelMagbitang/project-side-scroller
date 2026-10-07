export type FrameStyle = 'stone' | 'brass' | 'glass';

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  description?: string;
  imageUrl: string;

  // Optional authoring hints. The renderer still reads the actual asset dimensions.
  sourceWidth?: number;
  sourceHeight?: number;
  accent?: string;
};

export type ArtworkLayout = {
  maxWidth: number;
  maxHeight: number;
  manualScale: number;
  offsetX: number;
  offsetY: number;
};

export type Exhibit = {
  id: string;
  artworkId?: string;
  x: number;
  y: number;
  frame: FrameStyle;
  spotlight: boolean;
  layout?: Partial<ArtworkLayout>;
  secret?: boolean;
};

export type SceneLayer = {
  id: string;
  depth: number;
  parallax: number;
  asset?: string;
  alpha?: number;
  tint?: number;
};

export type Gallery = {
  id: string;
  title: string;
  curator: string;
  description: string;
  atmosphere: string;
  floorTint: number;
  wallTint: number;
  exhibits: Exhibit[];
  layers: SceneLayer[];
  secretArea?: {
    x: number;
    label: string;
  };
};

export type GalleryBundle = {
  gallery: Gallery;
  artworks: Artwork[];
};
