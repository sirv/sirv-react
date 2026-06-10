import { SirvImage } from './SirvImage.js';
import { SirvSpin } from './SirvSpin.js';
import { SirvVideo } from './SirvVideo.js';
import { SirvView } from './SirvView.js';
import type { SirvMediaLike } from './types.js';

export interface SirvMediaProps {
  value: SirvMediaLike;
  width?: number;
  height?: number;
  className?: string;
}

/** Polymorphic renderer: picks the right component from the value's `_type` discriminator. */
export function SirvMedia({ value, ...rest }: SirvMediaProps) {
  switch (value._type) {
    case 'sirv.image':
      return <SirvImage value={value} {...rest} />;
    case 'sirv.video':
      return <SirvVideo value={value} {...rest} />;
    case 'sirv.spin':
      return <SirvSpin value={value} {...rest} />;
    case 'sirv.view':
      return <SirvView value={value} {...rest} />;
    default:
      return null;
  }
}
