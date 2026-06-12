import { SirvImage } from './SirvImage.js';
import { SirvModel } from './SirvModel.js';
import { SirvSpin, type SirvSpinOptions } from './SirvSpin.js';
import { SirvVideo } from './SirvVideo.js';
import { SirvView } from './SirvView.js';
import type { SirvMediaLike } from './types.js';
import type { Transformations } from './url/index.js';

export interface SirvMediaProps {
  value: SirvMediaLike;
  width?: number;
  height?: number;
  className?: string;
  /** Dynamic-imaging params; forwarded to `<SirvImage>` when the value is an image. */
  transformations?: Transformations;
  /** Spin viewer options; forwarded to `<SirvSpin>` when the value is a spin. */
  spinOptions?: SirvSpinOptions;
}

/** Polymorphic renderer: picks the right component from the value's `_type` discriminator. */
export function SirvMedia({ value, transformations, spinOptions, ...rest }: SirvMediaProps) {
  switch (value._type) {
    case 'sirv.image':
      return <SirvImage value={value} transformations={transformations} {...rest} />;
    case 'sirv.video':
      return <SirvVideo value={value} {...rest} />;
    case 'sirv.spin':
      return <SirvSpin value={value} options={spinOptions} {...rest} />;
    case 'sirv.view':
      return <SirvView value={value} {...rest} />;
    case 'sirv.model':
      return <SirvModel value={value} {...rest} />;
    default:
      return null;
  }
}
