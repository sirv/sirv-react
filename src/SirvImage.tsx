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
  /**
   * Sirv dynamic-imaging parameters (crop, rotate, blur, grayscale, profile, colortone, ...).
   * Merged on top of any `value.transformations`; `width`/`height`/`quality` props still win
   * for the matching keys. See https://sirv.com/help/articles/dynamic-imaging/
   */
  transformations?: Transformations;
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
  transformations,
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

  // Precedence: explicit `transformations` prop > value.transformations > config defaults.
  // `width`/`height` HTML props are layout hints (passed to <img>), not URL params - only
  // include `height` in URL params when it came in via `transformations`.
  const transforms: Transformations = {
    ...value?.transformations,
    ...transformations,
    quality:
      quality ?? transformations?.quality ?? value?.transformations?.quality ?? config.quality,
    format: transformations?.format ?? value?.transformations?.format ?? 'optimal',
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
