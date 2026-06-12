import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SIRV_JS_URL,
  SirvGallery,
  SirvImage,
  SirvMedia,
  SirvModel,
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

  it('model renders the .glb data-src and injects sirv.js', () => {
    const { container } = render(<SirvModel alias="d.sirv.com" path="/models/chair.glb" />);
    expect((container.querySelector('.Sirv') as HTMLElement).getAttribute('data-src')).toBe(
      'https://d.sirv.com/models/chair.glb',
    );
    expect(document.querySelector(`script[src="${SIRV_JS_URL}"]`)).not.toBeNull();
  });

  it('spin emits the provided options as data-* attributes', () => {
    const { container } = render(
      <SirvSpin
        alias="d.sirv.com"
        path="/a.spin"
        options={{
          autospin: 'always',
          autospinSpeed: 200,
          spinDirection: 'cw',
          hint: 'once',
          bottomBar: 'hide',
          fullscreenZoom: true,
          extras: { 'mouse-scale': 1.5 },
        }}
      />,
    );
    const el = container.querySelector('.Sirv') as HTMLElement;
    expect(el.getAttribute('data-autospin')).toBe('always');
    expect(el.getAttribute('data-autospin-speed')).toBe('200');
    expect(el.getAttribute('data-spin-direction')).toBe('cw');
    expect(el.getAttribute('data-hint')).toBe('once');
    expect(el.getAttribute('data-bottom-bar')).toBe('hide');
    expect(el.getAttribute('data-fullscreen-zoom')).toBe('true');
    expect(el.getAttribute('data-mouse-scale')).toBe('1.5');
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

    const model: SirvMediaLike = {
      _type: 'sirv.model',
      asset: { sirvAlias: 'd.sirv.com', sirvPath: '/m.glb' },
    };
    const { container: c3 } = render(<SirvMedia value={model} />);
    expect((c3.querySelector('.Sirv') as HTMLElement).getAttribute('data-src')).toContain('.glb');
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

  it('viewer layout forwards viewer options as data-* attributes', () => {
    const { container } = render(
      <SirvGallery
        items={items}
        layout="viewer"
        viewer={{
          thumbnails: 'bottom',
          thumbnailsType: 'image',
          autoplay: 4000,
          autoplayPauseOnHover: true,
          slideDuration: 600,
          zoom: true,
          fullscreen: true,
          arrows: true,
          loop: true,
        }}
      />,
    );
    const root = container.querySelector('.Sirv') as HTMLElement;
    expect(root.getAttribute('data-thumbnails')).toBe('bottom');
    expect(root.getAttribute('data-thumbnails-type')).toBe('image');
    expect(root.getAttribute('data-autoplay')).toBe('4000');
    expect(root.getAttribute('data-autoplay-pause-on-hover')).toBe('true');
    expect(root.getAttribute('data-slide-duration')).toBe('600');
    expect(root.getAttribute('data-zoom')).toBe('true');
    expect(root.getAttribute('data-fullscreen')).toBe('true');
    expect(root.getAttribute('data-arrows')).toBe('true');
    expect(root.getAttribute('data-loop')).toBe('true');
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
