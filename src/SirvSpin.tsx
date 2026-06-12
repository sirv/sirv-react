import type { HTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { type DataAttrValue, toDataAttributes } from './data-attrs.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvSpinLike } from './types.js';
import { buildSpinUrl } from './url/index.js';

/**
 * Common sirv.js 360-spin options. Each named field maps to a `data-*` attribute on the spin
 * container (camelCase -> kebab-case). Use `extras` for anything not modelled here. See
 * https://sirv.com/help/articles/360-spin/#options
 */
export interface SirvSpinOptions {
  /** Auto-rotate the spin: 'off' | 'once' | 'always'. */
  autospin?: 'off' | 'once' | 'always';
  /** Auto-rotate direction: 'cw' (clockwise) or 'ccw'. */
  autospinDirection?: 'cw' | 'ccw';
  /** Auto-rotate speed (frames per second). */
  autospinSpeed?: number;
  /** Drag rotation direction: 'cw' or 'ccw'. */
  spinDirection?: 'cw' | 'ccw';
  /** Drag rotation speed multiplier (higher = more sensitive). */
  spinSpeed?: number;
  /** Show the rotate-cursor hint: 'off' | 'once' | 'always'. */
  hint?: 'off' | 'once' | 'always';
  /** Show or hide the bottom action bar (zoom, fullscreen, ...). */
  bottomBar?: 'show' | 'hide';
  /** Allow pinch / wheel zoom into fullscreen. */
  fullscreenZoom?: boolean;
  /** Show or hide the on-screen controls overlay. */
  controls?: 'show' | 'hide';
  /** Escape hatch: emitted verbatim as `data-<kebab-case-key>` attributes. */
  extras?: Record<string, DataAttrValue>;
}

export interface SirvSpinProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: SirvSpinLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
  options?: SirvSpinOptions;
}

function spinOptionsToDataAttrs(options: SirvSpinOptions | undefined): Record<string, string> {
  if (!options) return {};
  const { extras, ...named } = options;
  return { ...toDataAttributes(named), ...(extras ? toDataAttributes(extras) : {}) };
}

/** 360 spin viewer. Renders the sirv.js spin container and auto-loads sirv.js. */
export function SirvSpin({
  value,
  alias,
  path,
  width,
  height,
  options,
  className,
  style,
  ...rest
}: SirvSpinProps) {
  const config = useSirvConfig();
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvSpin');
  useSirvJs(true);

  return (
    <div
      {...rest}
      className={cx('Sirv', className)}
      data-src={buildSpinUrl(target)}
      {...spinOptionsToDataAttrs(options)}
      style={{ width, height, ...style }}
    />
  );
}
