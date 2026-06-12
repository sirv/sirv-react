// Generates docs/index.html - a single, self-contained, branded documentation page for
// @sirv/react (styled after the Sirv REST API SDK docs). Run with: node scripts/build-docs.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const pkg = { name: '@sirv/react', version: '0.2.1' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A documented component/API: name, blurb, prop rows [name, type, desc], and a code example. */
const SECTIONS = [
  {
    id: 'provider',
    name: '<SirvProvider>',
    blurb:
      'Sets your Sirv account alias (and image defaults) ONCE for the whole app. Place it near the root; every nested component inherits the alias, so you never pass it again. Use it once, not per component.',
    props: [
      [
        'alias',
        'string',
        'Your account alias, e.g. "demo.sirv.com". Set once; inherited everywhere.',
      ],
      ['quality', 'number', 'Default image quality (0-100).'],
      ['lazyMode', "'native' | 'sirvjs' | 'none'", 'Default lazy-load mode for images.'],
      ['children', 'ReactNode', 'Your app.'],
    ],
    code: `import { SirvProvider, SirvImage } from '@sirv/react';

export function App() {
  return (
    <SirvProvider alias="demo.sirv.com" quality={82}>
      <SirvImage path="/products/shoe.jpg" width={800} alt="Shoe" />
    </SirvProvider>
  );
}`,
  },
  {
    id: 'image',
    name: '<SirvImage>',
    blurb:
      'Responsive image with an auto-generated srcset and native lazy loading, or a sirv.js DPR-aware mode. Accepts either a stored value or alias + path.',
    props: [
      ['value', 'SirvImageLike', 'A stored Sirv image value (alternative to alias + path).'],
      ['alias', 'string', 'Optional override. Normally set once on <SirvProvider>; omit it here.'],
      ['path', 'string', 'Absolute Sirv path, e.g. "/products/shoe.jpg".'],
      ['width', 'number', 'Rendered width; also the largest src candidate.'],
      ['height', 'number', 'Rendered height.'],
      ['quality', 'number', 'Image quality 0-100 (overrides the provider).'],
      ['sizes', 'string', 'The <img> sizes attribute for responsive selection.'],
      ['priority', 'boolean', 'Eager-load above-the-fold images.'],
      ['lazyMode', "'native' | 'sirvjs' | 'none'", 'Lazy strategy (default native).'],
      ['srcSetWidths', 'number[]', 'Width descriptors for the generated srcset.'],
      ['alt', 'string', 'Alt text (falls back to the value’s alt).'],
      [
        'transformations',
        'Transformations',
        'Sirv dynamic-imaging params (crop, rotate, blur, grayscale, profile, page, ...). Merged on top of value.transformations.',
      ],
    ],
    code: `<SirvImage
  path="/products/shoe.jpg"
  width={800}
  height={600}
  alt="Product shoe"
  sizes="(min-width: 1024px) 50vw, 100vw"
/>

// Dynamic imaging: face-cropped, slightly sharpened, grayscale.
<SirvImage
  path="/people/jane.jpg"
  width={400}
  height={400}
  alt="Jane"
  transformations={{
    crop: { width: 400, height: 400, type: 'face' },
    grayscale: true,
    sharpen: 30,
  }}
/>

// Apply a saved Sirv profile:
<SirvImage path="/products/shoe.jpg" width={1200} alt="Shoe" transformations={{ profile: 'Hero' }} />`,
  },
  {
    id: 'video',
    name: '<SirvVideo>',
    blurb:
      'Renders a Sirv-delivered video with a derived poster frame (or your own). Accepts a stored value or alias + path.',
    props: [
      ['value', 'SirvVideoLike', 'A stored Sirv video value.'],
      [
        'alias / path',
        'string',
        'alias (optional, inherited from <SirvProvider>) / absolute path.',
      ],
      ['width / height', 'number', 'Rendered size.'],
      ['poster', 'SirvImageLike', 'Explicit poster; otherwise a Sirv-derived frame.'],
      [
        'autoPlay / loop / muted / controls',
        'boolean',
        'Standard playback flags (controls default true).',
      ],
    ],
    code: `<SirvVideo path="/clips/intro.mp4" width={800} controls />`,
  },
  {
    id: 'spin',
    name: '<SirvSpin>',
    blurb: 'A 360° spin. Renders the sirv.js container and auto-loads sirv.js once per page.',
    props: [
      ['value', 'SirvSpinLike', 'A stored Sirv spin value.'],
      [
        'alias / path',
        'string',
        'alias (optional, inherited from <SirvProvider>) / absolute .spin path.',
      ],
      ['width / height', 'number', 'Container size.'],
      [
        'options',
        'SirvSpinOptions',
        'sirv.js spin options (autospin, spinDirection, spinSpeed, hint, bottomBar, fullscreenZoom, controls, extras). Emitted as data-* on the container.',
      ],
    ],
    code: `<SirvSpin path="/spins/watch.spin" width={500} height={500} />

// With autospin, hint, bottom bar hidden, and fullscreen zoom enabled:
<SirvSpin
  path="/spins/watch.spin"
  width={500}
  height={500}
  options={{
    autospin: 'always',
    autospinSpeed: 200,
    spinDirection: 'cw',
    hint: 'once',
    bottomBar: 'hide',
    fullscreenZoom: true,
  }}
/>`,
  },
  {
    id: 'view',
    name: '<SirvView>',
    blurb:
      'A Sirv "view" - a composite layout of images / videos / spins driven by sirv.js. Auto-loads sirv.js.',
    props: [
      ['value', 'SirvViewLike', 'A stored Sirv view value.'],
      [
        'alias / path',
        'string',
        'alias (optional, inherited from <SirvProvider>) / absolute .view path.',
      ],
      ['width / height', 'number', 'Container size.'],
    ],
    code: `<SirvView path="/views/scene.view" width={800} height={450} />`,
  },
  {
    id: 'model',
    name: '<SirvModel>',
    blurb:
      'A 3D model (.glb) viewer, rendered by sirv.js the same way as a spin or view. Auto-loads sirv.js.',
    props: [
      ['value', 'SirvModelLike', 'A stored Sirv model value.'],
      [
        'alias / path',
        'string',
        'alias (optional, inherited from <SirvProvider>) / absolute .glb path.',
      ],
      ['width / height', 'number', 'Container size.'],
    ],
    code: `<SirvModel path="/models/chair.glb" width={600} height={600} />`,
  },
  {
    id: 'media',
    name: '<SirvMedia>',
    blurb:
      'Polymorphic renderer: picks <SirvImage> / <SirvVideo> / <SirvSpin> / <SirvView> / <SirvModel> from the value’s _type discriminator. Ideal for a CMS field whose type varies.',
    props: [
      ['value', 'SirvMediaLike', 'A discriminated value ({ _type: "sirv.image" | ... }).'],
      ['width / height', 'number', 'Passed to the chosen component.'],
      ['className', 'string', 'Passed through.'],
      [
        'transformations',
        'Transformations',
        'Forwarded to <SirvImage> when the value is an image.',
      ],
      ['spinOptions', 'SirvSpinOptions', 'Forwarded to <SirvSpin> when the value is a spin.'],
    ],
    code: `<SirvMedia
  value={{ _type: 'sirv.image', asset: { sirvAlias: 'demo.sirv.com', sirvPath: '/a.jpg' }, alt: 'Hero' }}
  width={800}
/>`,
  },
  {
    id: 'gallery',
    name: '<SirvGallery>',
    blurb:
      'Renders a list of mixed Sirv assets two ways. layout="separate" (default) lays each asset out as its own component in a grid. layout="viewer" combines them all into ONE Sirv Media Viewer (a single .Sirv container with a data-src per asset); images get data-type="zoom".',
    props: [
      ['items', 'SirvMediaLike[]', 'The assets to show (any mix of types).'],
      ['layout', "'separate' | 'viewer'", 'Render mode (default "separate").'],
      ['width / height', 'number', 'Container size (mainly for "viewer").'],
      ['itemWidth / itemHeight', 'number', 'Per-item size in "separate".'],
      ['gap', 'number', 'Grid gap in px ("separate").'],
      ['zoomImages', 'boolean', 'Add data-type="zoom" to images in "viewer" (default true).'],
      [
        'viewer',
        'SirvViewerOptions',
        'Sirv Media Viewer options for "viewer" layout (thumbnails, autoplay, slideDuration, zoom, fullscreen, arrows, loop, extras). Emitted as data-* on the container.',
      ],
    ],
    code: `// Separate components in a grid:
<SirvGallery items={items} layout="separate" itemWidth={300} />

// One combined Sirv Media Viewer (image + video + spin + view together):
<SirvGallery items={items} layout="viewer" width={640} height={480} />

// With bottom thumbnails, autoplay, fullscreen and arrows:
<SirvGallery
  items={items}
  layout="viewer"
  width={800}
  height={600}
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
/>`,
  },
  {
    id: 'next',
    name: 'next/image loader',
    blurb:
      'Use Sirv as the optimizer behind next/image. Re-export the loader, then point next.config at it.',
    props: [
      ['sirvLoader', '({ src, width, quality }) => string', 'Imported from "@sirv/react/next".'],
    ],
    code: `// sirv-loader.ts
export { sirvLoader as default } from '@sirv/react/next';

// next.config.mjs
export default { images: { loader: 'custom', loaderFile: './sirv-loader.ts' } };`,
  },
  {
    id: 'from-sanity',
    name: 'fromSanityMedia()',
    blurb:
      'Adapter that converts the Sirv Sanity plugin’s stored sirvMedia value into a value <SirvMedia> can render. Optional - only needed when consuming Sanity content.',
    props: [
      ['value', 'SanityMediaValue', 'The stored sirvMedia field value.'],
      ['returns', 'SirvMediaLike', 'Pass straight to <SirvMedia value={...} />.'],
    ],
    code: `import { SirvMedia, fromSanityMedia } from '@sirv/react';

<SirvMedia value={fromSanityMedia(post.heroMedia)} width={640} />`,
  },
];

const navLinks = SECTIONS.map((s) => `<a href="#${s.id}">${esc(s.name)}</a>`).join('\n        ');

const sectionsHtml = SECTIONS.map(
  (s) => `
    <section id="${s.id}" class="card">
      <h2>${esc(s.name)}</h2>
      <p>${esc(s.blurb)}</p>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          ${s.props
            .map(
              ([n, t, d]) =>
                `<tr><td><code>${esc(n)}</code></td><td><code class="type">${esc(t)}</code></td><td>${esc(d)}</td></tr>`,
            )
            .join('\n          ')}
        </tbody>
      </table>
      <pre><code>${esc(s.code)}</code></pre>
    </section>`,
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pkg.name} - Documentation</title>
  <style>
    :root {
      --primary: #327bba; --primary-dark: #004d99; --text: #333; --muted: #666;
      --bg: #fff; --bg-light: #f8f9fa; --code-bg: #f4f4f4; --border: #e1e4e8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; color: var(--text); background: var(--bg); }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    header { background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff; padding: 56px 0; text-align: center; }
    header h1 { font-size: 2.4rem; margin-bottom: 8px; }
    header p { font-size: 1.1rem; opacity: .92; }
    header .ver { display: inline-block; margin-top: 14px; padding: 4px 12px;
      background: rgba(255,255,255,.2); border-radius: 20px; font-size: .85rem; }
    nav { position: sticky; top: 0; background: var(--bg); border-bottom: 1px solid var(--border);
      padding: 12px 0; z-index: 10; }
    nav .container { display: flex; flex-wrap: wrap; gap: 6px 16px; }
    nav a { font-size: .9rem; color: var(--muted); }
    main { padding: 32px 0 64px; }
    .card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 24px; margin-bottom: 24px; }
    .card h2 { color: var(--primary-dark); font-size: 1.4rem; margin-bottom: 8px; }
    .card > p { color: var(--muted); margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: .92rem; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border);
      vertical-align: top; }
    th { color: var(--muted); font-weight: 600; }
    code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: .88em;
      background: var(--code-bg); padding: 2px 6px; border-radius: 4px; }
    code.type { color: var(--primary-dark); background: #eef4fb; white-space: nowrap; }
    pre { background: #1e1e1e; color: #e6e6e6; padding: 16px; border-radius: 8px;
      overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; font-size: .85rem; line-height: 1.5; }
    .install pre { background: #1e1e1e; }
    footer { border-top: 1px solid var(--border); padding: 24px 0; color: var(--muted);
      font-size: .9rem; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${pkg.name}</h1>
      <p>React components for displaying Sirv assets - images, videos, 360 spins, views, galleries.</p>
      <span class="ver">v${pkg.version}</span>
    </div>
  </header>
  <nav>
    <div class="container">
      <a href="#install">Install</a>
        ${navLinks}
    </div>
  </nav>
  <main class="container">
    <section id="install" class="card install">
      <h2>Install</h2>
      <p>Requires React 18 or 19 (peer dependencies). Zero other runtime dependencies.</p>
      <pre><code>npm install ${pkg.name}</code></pre>
      <p>Wrap your app once in <code>&lt;SirvProvider alias="your.sirv.com"&gt;</code> to set your
      account alias - every nested component inherits it, so you set the alias in one place and
      never repeat it. Then use any component. Spins and views auto-load <code>sirv.js</code>.</p>
    </section>
${sectionsHtml}
  </main>
  <footer>
    <div class="container">
      ${pkg.name} · <a href="https://github.com/sirv/sirv-react">GitHub</a> ·
      <a href="https://sirv.com">Sirv</a> · generated by scripts/build-docs.mjs
    </div>
  </footer>
</body>
</html>
`;

await mkdir('docs', { recursive: true });
await writeFile('docs/index.html', html);
console.log('build-docs: wrote docs/index.html');
