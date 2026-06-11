import { describe, expect, it } from 'vitest';
import { type Transformations, toQueryParams } from './transformations.js';

describe('toQueryParams', () => {
  it('maps sizing params', () => {
    expect(toQueryParams({ width: 800, height: 600, maxSize: 1200, scale: 'fit' })).toEqual({
      w: '800',
      h: '600',
      s: '1200',
      'scale.option': 'fit',
    });
  });

  it('maps quality and format, with optimal/auto/avif all collapsing to optimal', () => {
    expect(toQueryParams({ quality: 85, format: 'optimal' })).toEqual({
      q: '85',
      format: 'optimal',
    });
    expect(toQueryParams({ format: 'auto' }).format).toBe('optimal');
    expect(toQueryParams({ format: 'avif' }).format).toBe('optimal');
    expect(toQueryParams({ format: 'jpeg' }).format).toBe('jpg');
    expect(toQueryParams({ format: 'webp' }).format).toBe('webp');
  });

  it('maps crop params', () => {
    expect(
      toQueryParams({ crop: { width: 400, height: 300, x: 10, y: 20, type: 'face' } }),
    ).toEqual({ cw: '400', ch: '300', cx: '10', cy: '20', 'crop.type': 'face' });
  });

  it('maps geometry and boolean flags only when true', () => {
    expect(toQueryParams({ rotate: 90, flip: true, flop: false })).toEqual({
      rotate: '90',
      flip: 'yes',
    });
  });

  it('maps colour/effect params', () => {
    const t: Transformations = {
      blur: 5,
      sharpen: 3,
      grayscale: true,
      brightness: 10,
      contrast: -5,
      saturation: 20,
      hue: 45,
      colortone: 'sepia',
    };
    expect(toQueryParams(t)).toEqual({
      blur: '5',
      sharpen: '3',
      grayscale: 'true',
      brightness: '10',
      contrast: '-5',
      saturation: '20',
      hue: '45',
      colortone: 'sepia',
    });
  });

  it('maps misc params and passes extras through verbatim', () => {
    expect(
      toQueryParams({
        profile: 'MyPreset',
        page: 2,
        download: true,
        extras: { 'watermark.text': 'Hi' },
      }),
    ).toEqual({ profile: 'MyPreset', page: '2', dl: '', 'watermark.text': 'Hi' });
  });

  it('maps advanced dynamic-imaging params', () => {
    expect(
      toQueryParams({
        scaleOption: 'noup',
        thumbnail: 256,
        webpFallback: 'jpg',
        pngOptimize: true,
        exposure: 12,
        crop: { width: 600, height: 400, padWidth: 20, padHeight: '5%' },
        canvas: {
          width: 1200,
          height: 1200,
          color: 'ffffff',
          position: 'center',
          aspectRatio: '1:1',
        },
        text: {
          value: 'Proof',
          size: '28%',
          color: 'ffffff',
          position: 'south',
          fontFamily: 'Open Sans',
          fontWeight: 700,
        },
        watermark: {
          imagePath: '/brand/watermark.png',
          position: 'tile',
          scaleWidth: '20%',
          opacity: 35,
        },
      }),
    ).toEqual({
      'scale.option': 'noup',
      thumbnail: '256',
      'webp-fallback': 'jpg',
      'png.optimize': 'true',
      exposure: '12',
      cw: '600',
      ch: '400',
      'crop.pad.width': '20',
      'crop.pad.height': '5%',
      'canvas.width': '1200',
      'canvas.height': '1200',
      'canvas.color': 'ffffff',
      'canvas.position': 'center',
      'canvas.aspectratio': '1:1',
      text: 'Proof',
      'text.size': '28%',
      'text.color': 'ffffff',
      'text.position': 'south',
      'text.font.family': 'Open Sans',
      'text.font.weight': '700',
      watermark: '/brand/watermark.png',
      'watermark.position': 'tile',
      'watermark.scale.width': '20%',
      'watermark.opacity': '35',
    });
  });

  it('emits nothing for an empty transformation set', () => {
    expect(toQueryParams({})).toEqual({});
  });
});
