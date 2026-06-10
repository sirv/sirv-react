import { describe, expect, it } from 'vitest';
import { fromSanityMedia } from './from-sanity.js';

describe('fromSanityMedia', () => {
  it('maps an image value to a sirv.image renderable', () => {
    const result = fromSanityMedia({
      mediaType: 'image',
      sirvAlias: 'demo.sirv.com',
      sirvPath: '/a.jpg',
      width: 800,
      height: 600,
      alt: 'A shoe',
      transformations: { quality: 80 },
    });
    expect(result).toEqual({
      _type: 'sirv.image',
      asset: { sirvAlias: 'demo.sirv.com', sirvPath: '/a.jpg', width: 800, height: 600 },
      alt: 'A shoe',
      transformations: { quality: 80 },
    });
  });

  it('maps a video value with playback options', () => {
    const result = fromSanityMedia({
      mediaType: 'video',
      sirvAlias: 'demo.sirv.com',
      sirvPath: '/c.mp4',
      durationSec: 12,
      controls: true,
      muted: true,
    });
    expect(result).toMatchObject({ _type: 'sirv.video', controls: true, muted: true });
  });

  it('maps spin and view values', () => {
    expect(fromSanityMedia({ mediaType: 'spin', sirvAlias: 'd', sirvPath: '/c.spin' })._type).toBe(
      'sirv.spin',
    );
    expect(fromSanityMedia({ mediaType: 'view', sirvAlias: 'd', sirvPath: '/s.view' })._type).toBe(
      'sirv.view',
    );
  });
});
