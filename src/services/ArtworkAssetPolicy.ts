import type { Artwork } from '../domain/models';

export type ArtworkAssetTier = 'thumbnail' | 'standard' | 'detail';

export type ArtworkAssetVariants = {
  thumbnail?: string;
  standard?: string;
  detail?: string;
};

export type ArtworkWithVariants = Artwork & {
  variants?: ArtworkAssetVariants;
};

/**
 * Select an already-generated derivative instead of downloading an archival
 * original. This stays independent from Phaser so the future CMS can return
 * the same model from storage/CDN APIs.
 */
export function selectArtworkAsset(
  artwork: ArtworkWithVariants,
  tier: ArtworkAssetTier
): string {
  return artwork.variants?.[tier] ?? artwork.imageUrl;
}
