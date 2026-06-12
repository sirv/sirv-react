import type { HTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { cx } from './cx.js';
import { resolveTarget } from './resolve.js';
import { useSirvJs } from './sirvjs-loader.js';
import type { SirvModelLike } from './types.js';
import { buildModelUrl } from './url/index.js';

export interface SirvModelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: SirvModelLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
}

/** 3D model (.glb) viewer. Renders the sirv.js container and auto-loads sirv.js. */
export function SirvModel({
  value,
  alias,
  path,
  width,
  height,
  className,
  style,
  ...rest
}: SirvModelProps) {
  const config = useSirvConfig();
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvModel');
  useSirvJs(true);

  return (
    <div
      {...rest}
      className={cx('Sirv', className)}
      data-src={buildModelUrl(target)}
      style={{ width, height, ...style }}
    />
  );
}
