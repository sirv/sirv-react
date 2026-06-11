// Sirv dynamic-imaging parameters. See https://sirv.com/help/articles/dynamic-imaging/.
// Values are bare pixels unless noted.

/**
 * Output format. Sirv negotiates AVIF/WebP via `format=optimal` (there is no standalone
 * `avif` param); 'auto' and 'avif' are accepted as friendly aliases that map to 'optimal'.
 */
export type SirvFormat = 'optimal' | 'webp' | 'jpg' | 'png' | 'original' | 'auto' | 'avif' | 'jpeg';

/** Sirv scale.option values. */
export type ScaleOption = 'fit' | 'fill' | 'ignore' | 'noup';

export type SirvPosition =
  | 'north'
  | 'northeast'
  | 'northwest'
  | 'center'
  | 'south'
  | 'southeast'
  | 'southwest'
  | 'east'
  | 'west';

/** Crop type. */
export type CropType = 'trim' | 'poi' | 'face';

export type SirvColorTone =
  | 'sepia'
  | 'warm'
  | 'cold'
  | 'sunset'
  | 'purpletan'
  | 'texas'
  | 'aurora'
  | 'blackberry'
  | 'coffee'
  | 'clearwater'
  | 'dusk'
  | 'stereo'
  | 'none';

export interface CropOptions {
  width?: number;
  height?: number;
  /** Crop offset from the left (px). */
  x?: number;
  /** Crop offset from the top (px). */
  y?: number;
  type?: CropType;
  padWidth?: number | string;
  padHeight?: number | string;
}

export interface CanvasOptions {
  width?: number | string;
  height?: number | string;
  color?: string;
  position?: SirvPosition;
  opacity?: number;
  aspectRatio?: string;
}

export interface TextOverlayOptions {
  value: string;
  size?: number | string;
  fontSize?: number | string;
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  fontWeight?: 300 | 400 | 600 | 700 | 800;
  color?: string;
  opacity?: number;
  align?: 'left' | 'center' | 'right';
  position?: SirvPosition;
  x?: number | string;
  y?: number | string;
  gravity?: SirvPosition;
  outlineWidth?: number | string;
  outlineColor?: string;
  outlineOpacity?: number;
  outlineBlur?: number | string;
  backgroundColor?: string;
  backgroundOpacity?: number;
}

export interface WatermarkOptions {
  imagePath: string;
  position?: SirvPosition | 'tile';
  x?: number | string;
  y?: number | string;
  gravity?: SirvPosition;
  scaleWidth?: number | string;
  scaleHeight?: number | string;
  scaleOption?: ScaleOption;
  rotate?: number;
  opacity?: number;
  layer?: 'front' | 'back';
  canvasColor?: string;
  canvasOpacity?: number;
  canvasWidth?: number | string;
  canvasHeight?: number | string;
  cropX?: number | string;
  cropY?: number | string;
  cropWidth?: number | string;
  cropHeight?: number | string;
}

export interface Transformations {
  // Sizing
  width?: number;
  height?: number;
  /** Longest dimension (Sirv `s`). */
  maxSize?: number;
  scale?: ScaleOption;
  /** Alias for `scale`, matching Sirv's `scale.option` parameter name. */
  scaleOption?: ScaleOption;
  /** Square thumbnail size (Sirv `thumbnail`). */
  thumbnail?: number;
  // Output
  quality?: number;
  format?: SirvFormat;
  webpFallback?: 'jpg' | 'png';
  pngOptimize?: boolean;
  // Crop
  crop?: CropOptions;
  // Canvas
  canvas?: CanvasOptions;
  // Geometry
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  // Color / effects
  blur?: number;
  sharpen?: number;
  grayscale?: boolean;
  brightness?: number;
  contrast?: number;
  exposure?: number;
  saturation?: number;
  hue?: number;
  colortone?: SirvColorTone | string;
  colorTone?: SirvColorTone;
  // Overlays
  text?: string | TextOverlayOptions;
  watermark?: string | WatermarkOptions;
  // Misc
  /** Saved Sirv profile/preset name. */
  profile?: string;
  /** Page number for multi-page sources (PDF). */
  page?: number;
  /** Force download (Sirv `dl`). */
  download?: boolean;
  /** Escape hatch for any param not modelled above; emitted verbatim. */
  extras?: Record<string, string | number | boolean>;
}

const FORMAT_MAP: Record<SirvFormat, string> = {
  optimal: 'optimal',
  auto: 'optimal',
  avif: 'optimal',
  webp: 'webp',
  jpg: 'jpg',
  jpeg: 'jpg',
  png: 'png',
  original: 'original',
};

/** Maps the friendly transformation shape onto Sirv's query-string parameter names. */
export function toQueryParams(t: Transformations): Record<string, string> {
  const p: Record<string, string> = {};
  if (t.width != null) p.w = String(t.width);
  if (t.height != null) p.h = String(t.height);
  if (t.maxSize != null) p.s = String(t.maxSize);
  if (t.scaleOption ?? t.scale) p['scale.option'] = String(t.scaleOption ?? t.scale);
  if (t.thumbnail != null) p.thumbnail = String(t.thumbnail);
  if (t.quality != null) p.q = String(t.quality);
  if (t.format != null) p.format = FORMAT_MAP[t.format];
  if (t.webpFallback != null) p['webp-fallback'] = t.webpFallback;
  if (t.pngOptimize) p['png.optimize'] = 'true';

  if (t.crop) {
    if (t.crop.width != null) p.cw = String(t.crop.width);
    if (t.crop.height != null) p.ch = String(t.crop.height);
    if (t.crop.x != null) p.cx = String(t.crop.x);
    if (t.crop.y != null) p.cy = String(t.crop.y);
    if (t.crop.type != null) p['crop.type'] = t.crop.type;
    if (t.crop.padWidth != null) p['crop.pad.width'] = String(t.crop.padWidth);
    if (t.crop.padHeight != null) p['crop.pad.height'] = String(t.crop.padHeight);
  }

  if (t.canvas) {
    if (t.canvas.width != null) p['canvas.width'] = String(t.canvas.width);
    if (t.canvas.height != null) p['canvas.height'] = String(t.canvas.height);
    if (t.canvas.color != null) p['canvas.color'] = t.canvas.color;
    if (t.canvas.position != null) p['canvas.position'] = t.canvas.position;
    if (t.canvas.opacity != null) p['canvas.opacity'] = String(t.canvas.opacity);
    if (t.canvas.aspectRatio != null) p['canvas.aspectratio'] = t.canvas.aspectRatio;
  }

  if (t.rotate != null) p.rotate = String(t.rotate);
  if (t.flip) p.flip = 'yes';
  if (t.flop) p.flop = 'yes';

  if (t.blur != null) p.blur = String(t.blur);
  if (t.sharpen != null) p.sharpen = String(t.sharpen);
  if (t.grayscale) p.grayscale = 'true';
  if (t.brightness != null) p.brightness = String(t.brightness);
  if (t.contrast != null) p.contrast = String(t.contrast);
  if (t.exposure != null) p.exposure = String(t.exposure);
  if (t.saturation != null) p.saturation = String(t.saturation);
  if (t.hue != null) p.hue = String(t.hue);
  const colorTone = t.colorTone ?? t.colortone;
  if (colorTone != null && colorTone !== 'none') p.colortone = colorTone;

  if (typeof t.text === 'string') {
    p.text = t.text;
  } else if (t.text) {
    p.text = t.text.value;
    if (t.text.size != null) p['text.size'] = String(t.text.size);
    if (t.text.fontSize != null) p['text.font.size'] = String(t.text.fontSize);
    if (t.text.fontStyle != null) p['text.font.style'] = t.text.fontStyle;
    if (t.text.fontFamily != null) p['text.font.family'] = t.text.fontFamily;
    if (t.text.fontWeight != null) p['text.font.weight'] = String(t.text.fontWeight);
    if (t.text.color != null) p['text.color'] = t.text.color;
    if (t.text.opacity != null) p['text.opacity'] = String(t.text.opacity);
    if (t.text.align != null) p['text.align'] = t.text.align;
    if (t.text.position != null) p['text.position'] = t.text.position;
    if (t.text.x != null) p['text.position.x'] = String(t.text.x);
    if (t.text.y != null) p['text.position.y'] = String(t.text.y);
    if (t.text.gravity != null) p['text.position.gravity'] = t.text.gravity;
    if (t.text.outlineWidth != null) p['text.outline.width'] = String(t.text.outlineWidth);
    if (t.text.outlineColor != null) p['text.outline.color'] = t.text.outlineColor;
    if (t.text.outlineOpacity != null) p['text.outline.opacity'] = String(t.text.outlineOpacity);
    if (t.text.outlineBlur != null) p['text.outline.blur'] = String(t.text.outlineBlur);
    if (t.text.backgroundColor != null) p['text.background.color'] = t.text.backgroundColor;
    if (t.text.backgroundOpacity != null) {
      p['text.background.opacity'] = String(t.text.backgroundOpacity);
    }
  }

  if (typeof t.watermark === 'string') {
    p.watermark = t.watermark;
  } else if (t.watermark) {
    p.watermark = t.watermark.imagePath;
    if (t.watermark.position != null) p['watermark.position'] = t.watermark.position;
    if (t.watermark.x != null) p['watermark.position.x'] = String(t.watermark.x);
    if (t.watermark.y != null) p['watermark.position.y'] = String(t.watermark.y);
    if (t.watermark.gravity != null) p['watermark.position.gravity'] = t.watermark.gravity;
    if (t.watermark.scaleWidth != null) {
      p['watermark.scale.width'] = String(t.watermark.scaleWidth);
    }
    if (t.watermark.scaleHeight != null) {
      p['watermark.scale.height'] = String(t.watermark.scaleHeight);
    }
    if (t.watermark.scaleOption != null) p['watermark.scale.option'] = t.watermark.scaleOption;
    if (t.watermark.rotate != null) p['watermark.rotate'] = String(t.watermark.rotate);
    if (t.watermark.opacity != null) p['watermark.opacity'] = String(t.watermark.opacity);
    if (t.watermark.layer != null) p['watermark.layer'] = t.watermark.layer;
    if (t.watermark.canvasColor != null) p['watermark.canvas.color'] = t.watermark.canvasColor;
    if (t.watermark.canvasOpacity != null) {
      p['watermark.canvas.opacity'] = String(t.watermark.canvasOpacity);
    }
    if (t.watermark.canvasWidth != null) {
      p['watermark.canvas.width'] = String(t.watermark.canvasWidth);
    }
    if (t.watermark.canvasHeight != null) {
      p['watermark.canvas.height'] = String(t.watermark.canvasHeight);
    }
    if (t.watermark.cropX != null) p['watermark.crop.x'] = String(t.watermark.cropX);
    if (t.watermark.cropY != null) p['watermark.crop.y'] = String(t.watermark.cropY);
    if (t.watermark.cropWidth != null) {
      p['watermark.crop.width'] = String(t.watermark.cropWidth);
    }
    if (t.watermark.cropHeight != null) {
      p['watermark.crop.height'] = String(t.watermark.cropHeight);
    }
  }

  if (t.profile != null) p.profile = t.profile;
  if (t.page != null) p.page = String(t.page);
  if (t.download) p.dl = '';

  if (t.extras) {
    for (const [key, value] of Object.entries(t.extras)) p[key] = String(value);
  }
  return p;
}
