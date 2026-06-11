import { type HTMLAttributes, useRef } from 'react';
import { SirvMedia } from './SirvMedia.js';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvMediaLike } from './types.js';
import { buildUrl } from './url/index.js';
import { type SirvViewerOptions, serializeSirvOptions } from './viewer-options.js';

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
  /** Sirv Media Viewer options serialized to `data-options` on the viewer root. */
  viewerOptions?: SirvViewerOptions;
  /** Sirv Media Viewer responsive breakpoint string serialized to `data-breakpoints`. */
  breakpoints?: string;
  /** Per-item Sirv Media Viewer options serialized to child `data-options`. */
  itemOptions?:
    | SirvViewerOptions
    | ((item: SirvMediaLike, index: number) => SirvViewerOptions | undefined);
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
  viewerOptions,
  breakpoints,
  itemOptions,
  className,
  style,
  ...rest
}: SirvGalleryProps) {
  const config = useSirvConfig();
  const sirvRef = useRef<HTMLDivElement>(null);
  // The viewer (and any spins/views in `separate` mode) need sirv.js.
  useSirvJs(layout === 'viewer', {
    root: sirvRef,
    scriptUrl: config.scriptUrl,
    autoStart: config.autoStart,
    startDelay: config.startDelay,
    restartKey: items.map((item) => item.asset?.sirvPath).join('|'),
  });

  if (layout === 'viewer') {
    const rootOptions = serializeSirvOptions(viewerOptions);
    return (
      <div
        {...rest}
        ref={sirvRef}
        className={cx('Sirv', className)}
        data-options={rootOptions}
        data-breakpoints={breakpoints}
        style={{ width, height, ...style }}
      >
        {items.map((item, index) => {
          const target = resolveTarget(item.asset, {}, config, 'SirvGallery');
          const zoom = zoomImages && isImage(item);
          const resolvedItemOptions =
            typeof itemOptions === 'function' ? itemOptions(item, index) : itemOptions;
          return (
            <div
              key={keyFor(item, index)}
              data-src={buildUrl(target)}
              data-alt={item.alt}
              data-options={serializeSirvOptions(resolvedItemOptions)}
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
