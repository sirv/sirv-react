import type { HTMLAttributes } from 'react';
import { SirvMedia } from './SirvMedia.js';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvMediaLike } from './types.js';
import { buildUrl } from './url/index.js';

export type SirvGalleryLayout = 'separate' | 'viewer';

export interface SirvGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The assets to show (mixed types allowed). */
  items: SirvMediaLike[];
  /**
   * How to render multiple items:
   * - `separate` (default): each item is its own component (<SirvImage>/<SirvVideo>/...), laid
   *   out in a responsive grid.
   * - `viewer`: a single Sirv Media Viewer - one `.Sirv` container with a `data-src` child per
   *   asset - so sirv.js combines images, videos, spins and views into one gallery.
   */
  layout?: SirvGalleryLayout;
  /** Container size (mainly for the `viewer` layout). */
  width?: number;
  height?: number;
  /** Per-item size in the `separate` layout. */
  itemWidth?: number;
  itemHeight?: number;
  /** Grid gap (px) in the `separate` layout. */
  gap?: number;
  /** Add `data-type="zoom"` to images in the `viewer` layout (default true). */
  zoomImages?: boolean;
}

function isImage(item: SirvMediaLike): boolean {
  return item._type === 'sirv.image';
}

function keyFor(item: SirvMediaLike, index: number): string {
  return item.asset?.sirvPath ?? String(index);
}

/**
 * Renders a list of Sirv assets either as separate components or as one combined Sirv Media
 * Viewer. Framework-agnostic: pass `SirvMediaLike` values (e.g. via `fromSanityMedia`).
 */
export function SirvGallery({
  items,
  layout = 'separate',
  width,
  height,
  itemWidth = 320,
  itemHeight,
  gap = 16,
  zoomImages = true,
  className,
  style,
  ...rest
}: SirvGalleryProps) {
  const config = useSirvConfig();
  // The viewer (and any spins/views in `separate` mode) need sirv.js.
  useSirvJs(layout === 'viewer');

  if (layout === 'viewer') {
    return (
      <div {...rest} className={cx('Sirv', className)} style={{ width, height, ...style }}>
        {items.map((item, index) => {
          const target = resolveTarget(item.asset, {}, config, 'SirvGallery');
          const zoom = zoomImages && isImage(item);
          return (
            <div
              key={keyFor(item, index)}
              data-src={buildUrl(target)}
              {...(zoom ? { 'data-type': 'zoom' } : {})}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth}px, 1fr))`,
        gap,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <SirvMedia key={keyFor(item, index)} value={item} width={itemWidth} height={itemHeight} />
      ))}
    </div>
  );
}
