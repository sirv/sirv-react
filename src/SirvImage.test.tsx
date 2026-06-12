import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SirvImage } from './index.js';
import type { SirvImageLike } from './types.js';

describe('<SirvImage>', () => {
  it('renders from explicit alias + path with srcset and lazy loading', () => {
    const { getByAltText } = render(
      <SirvImage alias="demo.sirv.com" path="/products/shoe-01.jpg" width={800} alt="A shoe" />,
    );
    const img = getByAltText('A shoe') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('https://demo.sirv.com/products/shoe-01.jpg');
    expect(img.getAttribute('src')).toContain('w=800');
    expect(img.getAttribute('srcset')).toContain('1024w');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('renders from a stored value and uses its alt', () => {
    const value: SirvImageLike = {
      _type: 'sirv.image',
      asset: { sirvAlias: 'demo.sirv.com', sirvPath: '/a.jpg', width: 800, height: 600 },
      alt: 'Stored alt',
    };
    const { getByAltText } = render(<SirvImage value={value} width={400} />);
    const img = getByAltText('Stored alt') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('demo.sirv.com/a.jpg');
  });

  it('eager-loads when priority is set', () => {
    const { getByAltText } = render(
      <SirvImage alias="d.sirv.com" path="/a.jpg" alt="x" priority />,
    );
    expect((getByAltText('x') as HTMLImageElement).getAttribute('loading')).toBe('eager');
  });

  it('sirvjs mode emits class="Sirv" + data-src and no eager src', () => {
    const { getByAltText } = render(
      <SirvImage alias="d.sirv.com" path="/a.jpg" alt="x" lazyMode="sirvjs" />,
    );
    const img = getByAltText('x') as HTMLImageElement;
    expect(img.className).toContain('Sirv');
    expect(img.getAttribute('data-src')).toContain('d.sirv.com/a.jpg');
    expect(img.getAttribute('src')).toBeNull();
  });

  it('applies dynamic-imaging transformations from the prop', () => {
    const { getByAltText } = render(
      <SirvImage
        alias="d.sirv.com"
        path="/people/jane.jpg"
        width={400}
        alt="jane"
        transformations={{
          crop: { width: 400, height: 400, type: 'face' },
          grayscale: true,
          sharpen: 30,
          profile: 'Hero',
        }}
      />,
    );
    const img = getByAltText('jane') as HTMLImageElement;
    const src = img.getAttribute('src') ?? '';
    expect(src).toContain('cw=400');
    expect(src).toContain('ch=400');
    expect(src).toContain('crop.type=face');
    expect(src).toContain('grayscale=true');
    expect(src).toContain('sharpen=30');
    expect(src).toContain('profile=Hero');
    // srcset descriptors keep their per-width override, transformations propagate to every entry.
    expect(img.getAttribute('srcset')).toContain('crop.type=face');
  });

  it('merges value.transformations with the transformations prop (prop wins)', () => {
    const value: SirvImageLike = {
      _type: 'sirv.image',
      asset: { sirvAlias: 'd.sirv.com', sirvPath: '/a.jpg' },
      transformations: { quality: 60, format: 'webp' },
    };
    const { getByAltText } = render(
      <SirvImage value={value} alt="x" width={200} transformations={{ quality: 90, blur: 5 }} />,
    );
    const src = (getByAltText('x') as HTMLImageElement).getAttribute('src') ?? '';
    expect(src).toContain('q=90'); // prop overrides value
    expect(src).toContain('format=webp'); // value still wins where prop is silent
    expect(src).toContain('blur=5'); // only the prop sets blur
  });

  it('throws a helpful error when alias is missing', () => {
    // Suppress React's error boundary console noise is unnecessary; render throws synchronously.
    expect(() => render(<SirvImage path="/a.jpg" alt="x" />)).toThrow(/alias/);
  });
});
