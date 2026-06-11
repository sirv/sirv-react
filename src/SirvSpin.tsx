import { type HTMLAttributes, useRef } from 'react';
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
  const sirvRef = useRef<HTMLDivElement>(null);
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvSpin');
  const src = buildSpinUrl(target);
  useSirvJs(true, {
    root: sirvRef,
    scriptUrl: config.scriptUrl,
    autoStart: config.autoStart,
    startDelay: config.startDelay,
    restartKey: src,
  });

  return (
    <div
      {...rest}
      ref={sirvRef}
      className={cx('Sirv', className)}
      data-src={src}
      data-alt={value?.alt}
      style={{ width, height, ...style }}
    />
  );
}
