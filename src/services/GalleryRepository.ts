import { galleryBundles } from '../data/mockContent';
import type { GalleryBundle } from '../domain/models';

export interface GalleryRepository {
  list(): Promise<GalleryBundle[]>;
  get(id: string): Promise<GalleryBundle | undefined>;
}

export class MockGalleryRepository implements GalleryRepository {
  async list() {
    return galleryBundles;
  }

  async get(id: string) {
    return galleryBundles.find((bundle) => bundle.gallery.id === id);
  }
}
