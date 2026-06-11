import { describe, expect, it } from 'vitest';
import { createSirvMediaValue, inferSirvMediaType } from './index.js';

describe('media type helpers', () => {
  it('infers Sirv media discriminators from paths, URLs, filenames, and MIME types', () => {
    expect(inferSirvMediaType('/products/watch.spin')).toBe('sirv.spin');
    expect(inferSirvMediaType('https://demo.sirv.com/products/gallery.view')).toBe('sirv.view');
    expect(inferSirvMediaType({ filename: 'intro.mp4' })).toBe('sirv.video');
    expect(inferSirvMediaType({ mimeType: 'video/webm' })).toBe('sirv.video');
    expect(inferSirvMediaType({ filename: 'front.avif' })).toBe('sirv.image');
  });

  it('creates discriminated Sirv media values from alias/path input', () => {
    expect(
      createSirvMediaValue({
        alias: 'demo.sirv.com',
        path: '/clips/intro.mp4',
        alt: 'Intro video',
      }),
    ).toEqual({
      _type: 'sirv.video',
      asset: { sirvAlias: 'demo.sirv.com', sirvPath: '/clips/intro.mp4' },
      alt: 'Intro video',
    });
  });
});
