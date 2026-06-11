# @sirv/react

React components for displaying [Sirv](https://sirv.com) assets in any React app - responsive
images, videos, 360 spins, Sirv "views", and combined media-viewer galleries.

- **Zero runtime dependencies** (only `react` / `react-dom` as peers).
- Works with **Next.js (App Router & Pages), Vite, Remix, CRA** - anything React 18/19.
- Responsive `srcset` + native lazy loading, or sirv.js DPR-aware mode.
- `sirv.js` auto-loaded only when a spin / view / viewer needs it, with provider-level script URL
  support.
- Pure Sirv helpers for Dynamic Imaging URLs, Media Viewer options, spin frame URLs, and media type
  inference.
- Ships ESM + CJS + types, with a `'use client'` boundary so the components drop straight into
  React Server Component apps.

Full API reference: open [`docs/index.html`](docs/index.html).

## Install

```bash
npm install @sirv/react
```

## Quick start

```tsx
import { SirvProvider, SirvImage } from '@sirv/react';

export default function App() {
  return (
    <SirvProvider alias="demo.sirv.com" quality={82}>
      <SirvImage
        path="/products/shoe.jpg"
        width={800}
        height={600}
        alt="Product shoe"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </SirvProvider>
  );
}
```

**Set your alias once.** `<SirvProvider alias="...">` goes near your app root (e.g. the root
layout); every nested component inherits the alias from context, so you never pass it again. A
component's own `alias` prop is just an optional override for a one-off asset from another
account. (You can skip the provider entirely and pass `alias` per component, but that's the
verbose path.)

## Components

| Component | What it renders |
|---|---|
| `<SirvImage>` | Responsive image (auto `srcset` + lazy), or sirv.js DPR mode |
| `<SirvVideo>` | Sirv-delivered video with a derived poster |
| `<SirvSpin>` | 360° spin (sirv.js) |
| `<SirvView>` | Sirv composite "view" (sirv.js) |
| `<SirvMedia>` | Polymorphic - picks the right component from a value's `_type` |
| `<SirvGallery>` | A list of mixed assets, `layout="separate"` or combined `layout="viewer"` |

### Gallery: separate vs combined viewer

```tsx
import { SirvGallery } from '@sirv/react';

// Each asset as its own component, in a responsive grid:
<SirvGallery items={items} layout="separate" itemWidth={300} />

// All assets combined into ONE Sirv Media Viewer (image + video + spin + view together);
// images are zoomable (data-type="zoom"):
<SirvGallery items={items} layout="viewer" width={640} height={480} />
```

`items` is an array of `SirvMediaLike` values (`{ _type, asset: { sirvAlias, sirvPath }, ... }`).
Use `viewerOptions`, `breakpoints`, and `itemOptions` to pass through Sirv Media Viewer
`data-options`, `data-breakpoints`, and per-item options:

```tsx
<SirvGallery
  items={items}
  layout="viewer"
  viewerOptions={{ autostart: 'created', 'fullscreen.enable': true }}
  breakpoints="640:layout.type:slider"
/>
```

## Dynamic Imaging utilities

```ts
import { buildResponsiveSirvImageSource, createThumbnail } from '@sirv/react/url';

const source = buildResponsiveSirvImageSource('https://demo.sirv.com/products/shoe.jpg', {
  maxWidth: 1200,
  widths: [320, 640, 960],
  quality: 82,
  scaleOption: 'noup',
});

const thumb = createThumbnail('https://demo.sirv.com/products/shoe.jpg', 256);
```

The URL helpers include `buildSirvUrl`, `isSirvUrl`, `extractSirvPath`, `resizeImage`,
`convertFormat`, `applyAspectRatio`, and `getDownloadUrl`.

## Media helpers

```ts
import { createSirvMediaValue } from '@sirv/react/media-type';

const media = createSirvMediaValue({
  alias: 'demo.sirv.com',
  path: '/clips/intro.mp4',
  alt: 'Intro video',
});
```

## next/image loader

Use Sirv as the optimizer behind `next/image`:

```ts
// sirv-loader.ts
export { sirvLoader as default } from '@sirv/react/next';
```

```js
// next.config.mjs
export default { images: { loader: 'custom', loaderFile: './sirv-loader.ts' } };
```

## Using stored CMS values

If you store Sirv assets with the Sirv Sanity plugin (`sirvMedia` field), convert them with
`fromSanityMedia()`:

```tsx
import { SirvMedia, fromSanityMedia } from '@sirv/react';

<SirvMedia value={fromSanityMedia(post.heroMedia)} width={640} />
```

`SirvMediaLike` is structural, so values from any source that match the shape work directly.

## Development

```bash
pnpm install
pnpm test         # vitest
pnpm typecheck
pnpm build        # tsup -> dist (ESM + CJS + d.ts)
pnpm docs         # regenerate docs/index.html
```

## License

MIT
