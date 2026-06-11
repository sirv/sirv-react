import type { VideoHTMLAttributes } from 'react';
import { useSirvConfig } from './SirvProvider.js';
import { resolveTarget } from './resolve.js';
import type { SirvVideoLike } from './types.js';
import { buildUrl, buildVideoPosterUrl, buildVideoUrl } from './url/index.js';

export interface SirvVideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'width' | 'height' | 'poster'> {
  value?: SirvVideoLike;
  alias?: string;
  path?: string;
  width?: number;
  height?: number;
  /** Explicit poster value; otherwise a Sirv-derived frame is used. */
  poster?: SirvVideoLike['poster'];
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function SirvVideo({
  value,
  alias,
  path,
  width,
  height,
  poster,
  autoPlay,
  loop,
  muted,
  controls,
  children,
  ...rest
}: SirvVideoProps) {
  const config = useSirvConfig();
  const target = resolveTarget(value?.asset, { alias, path }, config, 'SirvVideo');

  const posterValue = poster ?? value?.poster;
  const posterUrl = posterValue
    ? buildUrl(
        { alias: posterValue.asset.sirvAlias, path: posterValue.asset.sirvPath },
        { width, format: 'jpg' },
      )
    : buildVideoPosterUrl(target, { width, height });

  return (
    <video
      {...rest}
      src={buildVideoUrl(target, { width, height })}
      poster={posterUrl}
      width={width}
      height={height}
      autoPlay={autoPlay ?? value?.autoplay}
      loop={loop ?? value?.loop}
      muted={muted ?? value?.muted}
      controls={controls ?? value?.controls ?? true}
    >
      {children}
    </video>
  );
}
