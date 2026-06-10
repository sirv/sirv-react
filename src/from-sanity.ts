import type { SirvMediaLike } from './types.js';

/**
 * The flat value stored by @sirv/sanity-plugin's `sirvMedia` field. Declared structurally so
 * @sirv/react needs no dependency on the plugin.
 */
export interface SanityMediaValue {
  mediaType: 'image' | 'video' | 'spin' | 'view';
  sirvAlias: string;
  sirvPath: string;
  width?: number;
  height?: number;
  durationSec?: number;
  alt?: string;
  transformations?: { quality?: number; format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png' };
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

/** Converts a stored sirvMedia field value into a value @sirv/react components can render. */
export function fromSanityMedia(value: SanityMediaValue): SirvMediaLike {
  const asset = {
    sirvAlias: value.sirvAlias,
    sirvPath: value.sirvPath,
    width: value.width,
    height: value.height,
  };
  switch (value.mediaType) {
    case 'image':
      return { _type: 'sirv.image', asset, alt: value.alt, transformations: value.transformations };
    case 'video':
      return {
        _type: 'sirv.video',
        asset: { ...asset, durationSec: value.durationSec },
        autoplay: value.autoplay,
        loop: value.loop,
        muted: value.muted,
        controls: value.controls,
      };
    case 'spin':
      return {
        _type: 'sirv.spin',
        asset: { sirvAlias: value.sirvAlias, sirvPath: value.sirvPath },
      };
    case 'view':
      return {
        _type: 'sirv.view',
        asset: { sirvAlias: value.sirvAlias, sirvPath: value.sirvPath },
      };
  }
}
