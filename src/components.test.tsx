import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SIRV_JS_URL,
  SirvGallery,
  SirvImage,
  SirvMedia,
  SirvProvider,
  SirvSpin,
  SirvVideo,
  SirvView,
  ensureSirvJs,
  serializeSirvOptions,
} from './index.js';
import type { SirvMediaLike } from './types.js';

afterEach(() => {
  for (const s of Array.from(document.querySelectorAll(`script[src^="${SIRV_JS_URL}"]`))) {
    s.remove();
  }
  (window as typeof window & { Sirv?: unknown }).Sirv = undefined;
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

  it('honors stored playback controls and renders caller-provided tracks', () => {
    const { container } = render(
      <SirvVideo
        value={{
          _type: 'sirv.video',
          asset: { sirvAlias: 'd.sirv.com', sirvPath: '/clips/intro.mp4' },
          controls: false,
        }}
      >
        <track kind="captions" src="/captions.vtt" srcLang="en" label="English" />
      </SirvVideo>,
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.hasAttribute('controls')).toBe(false);
    const track = video.querySelector('track') as HTMLTrackElement;
    expect(track.getAttribute('src')).toBe('/captions.vtt');
    expect(track.getAttribute('label')).toBe('English');
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

  it('uses provider script settings and starts/stops the mounted Sirv element', async () => {
    const sirv = { start: vi.fn(), stop: vi.fn() };
    (window as typeof window & { Sirv?: typeof sirv }).Sirv = sirv;

    const { container, unmount } = render(
      <SirvProvider scriptUrl={`${SIRV_JS_URL}?modules=spin`}>
        <SirvSpin alias="d.sirv.com" path="/spins/car.spin" />
      </SirvProvider>,
    );
    const el = container.querySelector('.Sirv') as HTMLElement;

    await waitFor(() => expect(sirv.start).toHaveBeenCalledWith(el));
    await new Promise((resolve) => setTimeout(resolve, 75));
    expect(sirv.start).toHaveBeenCalledTimes(1);
    unmount();
    expect(sirv.stop).toHaveBeenCalledWith(el);
  });

  it('uses the provider script URL for injected sirv.js scripts', async () => {
    render(
      <SirvProvider scriptUrl={`${SIRV_JS_URL}?modules=spin`}>
        <SirvSpin alias="d.sirv.com" path="/spins/car.spin" />
      </SirvProvider>,
    );

    await waitFor(() => {
      const script = document.querySelector(`script[src^="${SIRV_JS_URL}"]`) as HTMLScriptElement;
      expect(script.getAttribute('src')).toBe(`${SIRV_JS_URL}?modules=spin`);
    });
  });
});

describe('ensureSirvJs', () => {
  it('does not treat a module-limited script as satisfying a full bundle request', () => {
    ensureSirvJs({ document, scriptUrl: `${SIRV_JS_URL}?modules=spin` });
    ensureSirvJs({ document });

    expect(document.querySelectorAll(`script[src^="${SIRV_JS_URL}"]`)).toHaveLength(2);
  });

  it('treats the full bundle as satisfying later module-limited requests', () => {
    ensureSirvJs({ document });
    ensureSirvJs({ document, scriptUrl: `${SIRV_JS_URL}?modules=spin` });

    expect(document.querySelectorAll(`script[src^="${SIRV_JS_URL}"]`)).toHaveLength(1);
  });

  it('attaches load handlers to an existing in-flight script', () => {
    const firstLoad = vi.fn();
    const secondLoad = vi.fn();
    const script = ensureSirvJs({ document, onLoad: firstLoad }) as HTMLScriptElement;

    ensureSirvJs({ document, onLoad: secondLoad });
    script.dispatchEvent(new Event('load'));

    expect(firstLoad).toHaveBeenCalledTimes(1);
    expect(secondLoad).toHaveBeenCalledTimes(1);
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

  it('throws a helpful error for values without a supported _type', () => {
    expect(() =>
      render(
        <SirvMedia
          value={{ asset: { sirvAlias: 'd.sirv.com', sirvPath: '/missing-type.jpg' } } as never}
        />,
      ),
    ).toThrow(/unsupported media type/i);
  });
});

describe('<SirvGallery>', () => {
  const items: SirvMediaLike[] = [
    {
      _type: 'sirv.image',
      asset: { sirvAlias: 'd.sirv.com', sirvPath: '/a.jpg' },
      alt: 'Gallery image',
    },
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
    expect(imageChild?.getAttribute('data-alt')).toBe('Gallery image');
    expect(videoChild?.getAttribute('data-type')).toBeNull();
    expect(document.querySelector(`script[src="${SIRV_JS_URL}"]`)).not.toBeNull();
  });

  it('passes viewer, breakpoint, and item options through as Sirv data attributes', () => {
    const { container } = render(
      <SirvGallery
        items={items}
        layout="viewer"
        viewerOptions={{
          autostart: 'created',
          'layout.aspectRatio': '1/1',
          'fullscreen.enable': true,
        }}
        breakpoints="640:layout.type:slider"
        itemOptions={(item) =>
          item._type === 'sirv.video' ? { autoplay: false, 'controls.enable': true } : undefined
        }
      />,
    );
    const root = container.querySelector('.Sirv') as HTMLElement;
    expect(root.getAttribute('data-options')).toBe(
      'autostart:created; layout.aspectRatio:1/1; fullscreen.enable:true',
    );
    expect(root.getAttribute('data-breakpoints')).toBe('640:layout.type:slider');

    const videoChild = root.children[1] as HTMLElement;
    expect(videoChild.getAttribute('data-options')).toBe('autoplay:false; controls.enable:true');
  });

  it('separate layout renders one component per item (no combined .Sirv wrapper)', () => {
    const { container } = render(<SirvGallery items={items} layout="separate" />);
    expect(container.querySelectorAll('img')).toHaveLength(1); // the image
    expect(container.querySelectorAll('video')).toHaveLength(1); // the video
    // spin + view each render their own .Sirv container (no single combining wrapper).
    expect(container.querySelectorAll('.Sirv')).toHaveLength(2);
  });
});

describe('serializeSirvOptions', () => {
  it('serializes object options and omits nullish values', () => {
    expect(
      serializeSirvOptions({
        autostart: 'created',
        'fullscreen.enable': true,
        'controls.enable': false,
        ignored: undefined,
      }),
    ).toBe('autostart:created; fullscreen.enable:true; controls.enable:false');
  });

  it('returns string options unchanged', () => {
    expect(serializeSirvOptions('autostart:created; thumbnails.position:bottom')).toBe(
      'autostart:created; thumbnails.position:bottom',
    );
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
