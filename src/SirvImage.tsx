import type { ImgHTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { LazyMode, SirvImageLike } from './types.js';
import { type Transformations, buildSrcSet, buildUrl } from './url/index.js';

export interface SirvImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  /** A stored SirvImageValue (from @sirv/core). Alternative to alias + path. */
  value?: SirvImageLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  /** true => eager load, above the fold. */
  priority?: boolean;
  /** native (default) | sirvjs (DPR-aware via sirv.js) | none (eager). */
  lazyMode?: LazyMode;
  /** Width descriptors for the generated srcset (native mode). */
  srcSetWidths?: number[];
}

const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];

export function SirvImage({
  value,
  alias,
  path,
  width,
  height,
  quality,
  sizes,
  priority = false,
  lazyMode,
  srcSetWidths = DEFAULT_WIDTHS,
  alt,
  className,
  ...rest
}: SirvImageProps) {
  const config = useSirvConfig();
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvImage');
  const effectiveAlt = alt ?? value?.alt ?? '';
  const mode: LazyMode = priority ? 'none' : (lazyMode ?? config.lazyMode ?? 'native');

  // sirv.js owns srcset/DPR in sirvjs mode; load it (conditionally) without breaking hook order.
  useSirvJs(mode === 'sirvjs');

  const transforms: Transformations = {
    quality: quality ?? value?.transformations?.quality ?? config.quality,
    format: value?.transformations?.format ?? 'optimal',
  };

  if (mode === 'sirvjs') {
    return (
      <img
        {...rest}
        className={cx('Sirv', className)}
        data-src={buildUrl(target, transforms)}
        width={width}
        height={height}
        alt={effectiveAlt}
      />
    );
  }

  return (
    <img
      {...rest}
      className={className}
      src={buildUrl(target, { ...transforms, width })}
      srcSet={buildSrcSet(target, srcSetWidths, transforms)}
      sizes={sizes}
      width={width}
      height={height}
      alt={effectiveAlt}
      loading={mode === 'none' ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
