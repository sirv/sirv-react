import { describe, expect, it } from 'vitest';
import {
  buildResponsiveSirvImageSource,
  buildSirvUrl,
  buildSpinUrl,
  buildSrcSet,
  buildUrl,
  buildVideoPosterUrl,
  buildVideoUrl,
  buildViewUrl,
  createThumbnail,
  extractSirvHostedPath,
  extractSirvPath,
  isSirvUrl,
} from './index.js';

const input = { alias: 'demo.sirv.com', path: '/products/shoe-01.jpg' };

describe('buildUrl', () => {
  it('builds a plain delivery URL', () => {
    expect(buildUrl(input)).toBe('https://demo.sirv.com/products/shoe-01.jpg');
  });

  it('appends transformation params', () => {
    expect(buildUrl(input, { width: 800, quality: 85, format: 'optimal' })).toBe(
      'https://demo.sirv.com/products/shoe-01.jpg?w=800&q=85&format=optimal',
    );
  });

  it('accepts an alias with protocol and a path without a leading slash', () => {
    expect(buildUrl({ alias: 'https://cdn.example.com', path: 'a/b.jpg' }, { width: 100 })).toBe(
      'https://cdn.example.com/a/b.jpg?w=100',
    );
  });

  it('percent-encodes path segments with spaces and Unicode (preserving slashes)', () => {
    expect(buildUrl({ alias: 'demo.sirv.com', path: '/my folder/Кира.jpg' })).toBe(
      'https://demo.sirv.com/my%20folder/%D0%9A%D0%B8%D1%80%D0%B0.jpg',
    );
  });
});

describe('Sirv URL helpers', () => {
  it('detects Sirv delivery hosts and custom CDN hosts', () => {
    expect(isSirvUrl('https://demo.sirv.com/products/shoe.jpg')).toBe(true);
    expect(isSirvUrl('https://cdn.example.com/products/shoe.jpg')).toBe(false);
    expect(
      isSirvUrl('https://cdn.example.com/products/shoe.jpg', {
        customHosts: ['cdn.example.com'],
      }),
    ).toBe(true);
  });

  it('does not treat Sirv service domains as asset delivery hosts', () => {
    expect(isSirvUrl('https://sirv.com/help/articles/dynamic-imaging/')).toBe(false);
    expect(isSirvUrl('https://www.sirv.com/')).toBe(false);
    expect(isSirvUrl('https://scripts.sirv.com/sirvjs/v3/sirv.js')).toBe(false);
    expect(isSirvUrl('https://my.sirv.com/')).toBe(false);
    expect(isSirvUrl('https://api.sirv.com/v2/files/search')).toBe(false);
  });

  it('extracts decoded paths from full URLs and path inputs', () => {
    expect(extractSirvPath('https://demo.sirv.com/my%20folder/%D0%9A.jpg')).toBe(
      '/my folder/К.jpg',
    );
    expect(extractSirvPath('/already/a-path.jpg')).toBe('/already/a-path.jpg');
    expect(extractSirvHostedPath('https://cdn.example.com/a.jpg')).toBeNull();
    expect(extractSirvHostedPath('https://demo.sirv.com/a.jpg')).toBe('/a.jpg');
  });

  it('builds transformations onto an absolute Sirv URL while replacing prior query params', () => {
    expect(
      buildSirvUrl('https://demo.sirv.com/products/shoe.jpg?old=1', {
        width: 900,
        scaleOption: 'noup',
      }),
    ).toBe('https://demo.sirv.com/products/shoe.jpg?w=900&scale.option=noup');
  });

  it('builds responsive sources from an absolute Sirv URL', () => {
    const source = buildResponsiveSirvImageSource('https://demo.sirv.com/products/shoe.jpg', {
      maxWidth: 900,
      maxHeight: 600,
      widths: [320, 640],
      quality: 82,
      scaleOption: 'noup',
    });

    expect(source.sizes).toBe('100vw');
    expect(source.src).toBe(
      'https://demo.sirv.com/products/shoe.jpg?w=900&h=600&scale.option=noup&q=82&format=optimal',
    );
    expect(source.srcSet).toBe(
      'https://demo.sirv.com/products/shoe.jpg?w=320&h=213&scale.option=noup&q=82&format=optimal 320w, ' +
        'https://demo.sirv.com/products/shoe.jpg?w=640&h=427&scale.option=noup&q=82&format=optimal 640w, ' +
        'https://demo.sirv.com/products/shoe.jpg?w=900&h=600&scale.option=noup&q=82&format=optimal 900w',
    );
  });

  it('leaves non-Sirv absolute URLs untouched for responsive sources', () => {
    expect(buildResponsiveSirvImageSource('https://example.com/a.jpg')).toEqual({
      sizes: '100vw',
      src: 'https://example.com/a.jpg',
    });
  });

  it('provides small convenience builders for common delivery transforms', () => {
    expect(createThumbnail('https://demo.sirv.com/a.jpg', 128)).toBe(
      'https://demo.sirv.com/a.jpg?thumbnail=128&q=80&format=jpg',
    );
  });
});

describe('buildSrcSet', () => {
  it('builds a width-descriptor srcset preserving other transforms', () => {
    expect(buildSrcSet(input, [400, 800], { quality: 70 })).toBe(
      'https://demo.sirv.com/products/shoe-01.jpg?w=400&q=70 400w, ' +
        'https://demo.sirv.com/products/shoe-01.jpg?w=800&q=70 800w',
    );
  });
});

describe('media-type builders', () => {
  const video = { alias: 'demo.sirv.com', path: '/clips/intro.mp4' };
  const spin = { alias: 'demo.sirv.com', path: '/spins/car.spin' };
  const view = { alias: 'demo.sirv.com', path: '/views/scene.view' };

  it('builds a video URL with optional sizing', () => {
    expect(buildVideoUrl(video, { width: 1280 })).toBe(
      'https://demo.sirv.com/clips/intro.mp4?w=1280',
    );
  });

  it('builds a JPG poster frame for a video', () => {
    expect(buildVideoPosterUrl(video, { width: 640 })).toBe(
      'https://demo.sirv.com/clips/intro.mp4?w=640&format=jpg',
    );
  });

  it('builds bare spin and view URLs (sirv.js consumes these via data-src)', () => {
    expect(buildSpinUrl(spin)).toBe('https://demo.sirv.com/spins/car.spin');
    expect(buildViewUrl(view)).toBe('https://demo.sirv.com/views/scene.view');
  });
});
