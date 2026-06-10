import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SIRV_JS_URL,
  SirvGallery,
  SirvImage,
  SirvMedia,
  SirvProvider,
  SirvSpin,
  SirvVideo,
  SirvView,
} from './index.js';
import type { SirvMediaLike } from './types.js';

afterEach(() => {
  for (const s of Array.from(document.querySelectorAll(`script[src="${SIRV_JS_URL}"]`))) s.remove();
});

describe('<SirvVideo>', () => {
  it('renders a video with Sirv src and a derived poster', () => {
    const { container } = render(
      <SirvVideo alias="d.sirv.com" path="/clips/intro.mp4" width={1280} />,
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.getAttribute('src')).toContain('d.sirv.com/clips/intro.mp4');
    expect(video.getAttribute('poster')).toContain('format=jpg');
  });
});

describe('<SirvSpin> / <SirvView>', () => {
  it('spin renders a Sirv container with the .spin data-src and injects sirv.js', () => {
    const { container } = render(<SirvSpin alias="d.sirv.com" path="/spins/car.spin" />);
    const el = container.querySelector('.Sirv') as HTMLElement;
    expect(el.getAttribute('data-src')).toBe('https://d.sirv.com/spins/car.spin');
    expect(document.querySelector(`script[src="${SIRV_JS_URL}"]`)).not.toBeNull();
  });

  it('view renders the .view data-src', () => {
    const { container } = render(<SirvView alias="d.sirv.com" path="/views/s.view" />);
    expect((container.querySelector('.Sirv') as HTMLElement).getAttribute('data-src')).toBe(
      'https://d.sirv.com/views/s.view',
    );
  });

  it('injects sirv.js only once across multiple spins', () => {
    render(
      <>
        <SirvSpin alias="d.sirv.com" path="/a.spin" />
        <SirvSpin alias="d.sirv.com" path="/b.spin" />
      </>,
    );
    expect(document.querySelectorAll(`script[src="${SIRV_JS_URL}"]`)).toHaveLength(1);
  });
});

describe('<SirvMedia>', () => {
  it('dispatches on _type', () => {
    const image: SirvMediaLike = {
      _type: 'sirv.image',
      asset: { sirvAlias: 'd.sirv.com', sirvPath: '/a.jpg' },
      alt: 'pic',
    };
    const { container } = render(<SirvMedia value={image} width={200} />);
    expect(container.querySelector('img')).not.toBeNull();

    const spin: SirvMediaLike = {
      _type: 'sirv.spin',
      asset: { sirvAlias: 'd.sirv.com', sirvPath: '/c.spin' },
    };
    const { container: c2 } = render(<SirvMedia value={spin} />);
    expect((c2.querySelector('.Sirv') as HTMLElement).getAttribute('data-src')).toContain('.spin');
  });
});

describe('<SirvGallery>', () => {
  const items: SirvMediaLike[] = [
    { _type: 'sirv.image', asset: { sirvAlias: 'd.sirv.com', sirvPath: '/a.jpg' } },
    { _type: 'sirv.video', asset: { sirvAlias: 'd.sirv.com', sirvPath: '/b.mp4' } },
    { _type: 'sirv.spin', asset: { sirvAlias: 'd.sirv.com', sirvPath: '/c.spin' } },
    { _type: 'sirv.view', asset: { sirvAlias: 'd.sirv.com', sirvPath: '/d.view' } },
  ];

  it('viewer layout combines all assets in one .Sirv container, zooming images', () => {
    const { container } = render(<SirvGallery items={items} layout="viewer" />);
    const root = container.querySelector('.Sirv') as HTMLElement;
    const children = Array.from(root.children) as HTMLElement[];
    expect(children).toHaveLength(4);
    expect(children.map((c) => c.getAttribute('data-src'))).toEqual([
      'https://d.sirv.com/a.jpg',
      'https://d.sirv.com/b.mp4',
      'https://d.sirv.com/c.spin',
      'https://d.sirv.com/d.view',
    ]);
    // Only the image gets data-type="zoom".
    const [imageChild, videoChild] = children;
    expect(imageChild?.getAttribute('data-type')).toBe('zoom');
    expect(videoChild?.getAttribute('data-type')).toBeNull();
    expect(document.querySelector(`script[src="${SIRV_JS_URL}"]`)).not.toBeNull();
  });

  it('separate layout renders one component per item (no combined .Sirv wrapper)', () => {
    const { container } = render(<SirvGallery items={items} layout="separate" />);
    expect(container.querySelectorAll('img')).toHaveLength(1); // the image
    expect(container.querySelectorAll('video')).toHaveLength(1); // the video
    // spin + view each render their own .Sirv container (no single combining wrapper).
    expect(container.querySelectorAll('.Sirv')).toHaveLength(2);
  });
});

describe('<SirvProvider>', () => {
  it('supplies a default alias to nested components', () => {
    const { getByAltText } = render(
      <SirvProvider alias="ctx.sirv.com">
        <SirvImage path="/a.jpg" alt="ctx" />
      </SirvProvider>,
    );
    expect((getByAltText('ctx') as HTMLImageElement).getAttribute('src')).toContain('ctx.sirv.com');
  });
});
