import type { Artwork, GalleryBundle } from '../domain/models';

export const artworks: Artwork[] = [
  {
    id: 'aurora-archive',
    title: 'Aurora Archive',
    artist: 'L. Magbitang',
    description: 'A study of distant lights suspended between memory and landscape.',
    imageUrl: '/assets/artworks/aurora-archive.svg',
    sourceWidth: 1600,
    sourceHeight: 2200,
    accent: '#a8d8ff'
  },
  {
    id: 'blue-interval',
    title: 'Blue Interval',
    artist: 'M. Reyes',
    description: 'Architectural fragments dissolve into an evening haze.',
    imageUrl: '/assets/artworks/blue-interval.svg',
    sourceWidth: 2400,
    sourceHeight: 1600,
    accent: '#7c9bff'
  },
  {
    id: 'nocturne-for-glass',
    title: 'Nocturne for Glass',
    artist: 'A. Santos',
    description: 'A quiet composition about reflections, still rooms, and leaving.',
    imageUrl: '/assets/artworks/nocturne-for-glass.svg',
    sourceWidth: 2000,
    sourceHeight: 2000,
    accent: '#b88cff'
  },
  {
    id: 'the-long-hall',
    title: 'The Long Hall',
    artist: 'J. Dela Cruz',
    description: 'An impossible corridor assembled from old photographs and imagined rooms.',
    imageUrl: '/assets/artworks/the-long-hall.svg',
    sourceWidth: 3200,
    sourceHeight: 1400,
    accent: '#78d7cf'
  },
  {
    id: 'afterimage',
    title: 'Afterimage',
    artist: 'C. Lim',
    description: 'Color and shadow remain after the original scene has vanished.',
    imageUrl: '/assets/artworks/afterimage.svg',
    sourceWidth: 1800,
    sourceHeight: 2600,
    accent: '#d5b8ff'
  }
];

export const memoryArchive: GalleryBundle = {
  gallery: {
    id: 'memory-archive',
    title: 'THE MEMORY ARCHIVE',
    curator: 'Studio / First Light',
    description: 'A first prototype exhibition: a tiled architectural corridor carrying artwork as spatial objects.',
    atmosphere: 'Monochrome stone · violet light · fractured memory',
    floorTint: 0x111218,
    wallTint: 0x34323a,
    exhibits: [
      {
        id: 'ex-01',
        artworkId: 'aurora-archive',
        x: 920,
        y: 330,
        frame: 'stone',
        spotlight: true
      },
      {
        id: 'ex-02',
        artworkId: 'blue-interval',
        x: 1640,
        y: 320,
        frame: 'brass',
        spotlight: true
      },
      {
        id: 'ex-03',
        artworkId: 'nocturne-for-glass',
        x: 2360,
        y: 330,
        frame: 'glass',
        spotlight: true
      },
      {
        id: 'ex-04',
        artworkId: 'the-long-hall',
        x: 3090,
        y: 330,
        frame: 'stone',
        spotlight: true
      },
      {
        id: 'ex-05',
        artworkId: 'afterimage',
        x: 3820,
        y: 330,
        frame: 'brass',
        spotlight: true
      }
    ],
    secretArea: {
      x: 4650,
      label: 'SECRET ARCHIVE'
    },
    layers: [
      {
        id: 'background',
        depth: 0,
        parallax: 0.08,
        asset: '/assets/gallery/background-architecture-1920x1080.svg',
        alpha: 0.95
      },
      {
        id: 'gallery-wall',
        depth: 2,
        parallax: 1,
        asset: '/assets/gallery/wall-tile-1024x512.svg'
      },
      {
        id: 'floor',
        depth: 3,
        parallax: 1,
        asset: '/assets/gallery/floor-tile-1024x512.svg'
      },
      {
        id: 'foreground',
        depth: 5,
        parallax: 1.12,
        asset: '/assets/gallery/foreground-pillar-512x1024.svg',
        alpha: 0.42
      }
    ]
  },
  artworks
};

export const galleryBundles: GalleryBundle[] = [memoryArchive];
