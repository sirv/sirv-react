import { describe, expect, it } from 'vitest';
import { sirvLoader } from './next.js';

describe('sirvLoader', () => {
  it('adds width, quality and optimal format to a Sirv URL', () => {
    const url = sirvLoader({ src: 'https://demo.sirv.com/a.jpg', width: 800, quality: 75 });
    const params = new URL(url).searchParams;
    expect(params.get('w')).toBe('800');
    expect(params.get('q')).toBe('75');
    expect(params.get('format')).toBe('optimal');
  });

  it('preserves existing params and does not override an explicit format', () => {
    const url = sirvLoader({
      src: 'https://demo.sirv.com/a.jpg?format=webp&grayscale=true',
      width: 400,
    });
    const params = new URL(url).searchParams;
    expect(params.get('format')).toBe('webp');
    expect(params.get('grayscale')).toBe('true');
    expect(params.get('w')).toBe('400');
  });
});
