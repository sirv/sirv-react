// Structural value types for stored Sirv asset values. Declared locally so the package has no
// runtime dependencies. A CMS's stored value (e.g. the Sirv Sanity plugin's sirvMedia) is
// structurally assignable to these; see fromSanityMedia() for a ready-made adapter.

export type LazyMode = 'native' | 'sirvjs' | 'none';

export interface SirvAssetLike {
  sirvAlias: string;
  sirvPath: string;
  width?: number;
  height?: number;
}

export interface SirvImageTransformLike {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
}

export interface SirvImageLike {
  _type?: 'sirv.image';
  asset: SirvAssetLike;
  transformations?: SirvImageTransformLike;
  alt?: string;
}

export interface SirvVideoLike {
  _type?: 'sirv.video';
  asset: SirvAssetLike & { durationSec?: number };
  poster?: SirvImageLike;
  alt?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export interface SirvSpinLike {
  _type?: 'sirv.spin';
  asset: { sirvAlias: string; sirvPath: string };
  alt?: string;
}

export interface SirvViewLike {
  _type?: 'sirv.view';
  asset: { sirvAlias: string; sirvPath: string };
  alt?: string;
}

export type SirvMediaLike =
  | (SirvImageLike & { _type: 'sirv.image' })
  | (SirvVideoLike & { _type: 'sirv.video' })
  | (SirvSpinLike & { _type: 'sirv.spin' })
  | (SirvViewLike & { _type: 'sirv.view' });
