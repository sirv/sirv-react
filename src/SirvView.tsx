import type { HTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvViewLike } from './types.js';
import { buildViewUrl } from './url/index.js';

export interface SirvViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: SirvViewLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
}

/** Sirv composite view. Renders the sirv.js view container and auto-loads sirv.js. */
export function SirvView({
  value,
  alias,
  path,
  width,
  height,
  className,
  style,
  ...rest
}: SirvViewProps) {
  const config = useSirvConfig();
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvView');
  useSirvJs(true);

  return (
    <div
      {...rest}
      className={cx('Sirv', className)}
      data-src={buildViewUrl(target)}
      style={{ width, height, ...style }}
    />
  );
}
