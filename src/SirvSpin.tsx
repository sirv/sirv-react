import type { HTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvSpinLike } from './types.js';
import { buildSpinUrl } from './url/index.js';

export interface SirvSpinProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: SirvSpinLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
}

/** 360 spin viewer. Renders the sirv.js spin container and auto-loads sirv.js. */
export function SirvSpin({
  value,
  alias,
  path,
  width,
  height,
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
      style={{ width, height, ...style }}
    />
  );
}
