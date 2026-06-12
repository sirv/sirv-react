# @sirv/react

React components for displaying [Sirv](https://sirv.com) assets in any React app - responsive
images, videos, 360 spins, Sirv "views", and combined media-viewer galleries.

- **Zero runtime dependencies** (only `react` / `react-dom` as peers).
- Works with **Next.js (App Router & Pages), Vite, Remix, CRA** - anything React 18/19.
- Responsive `srcset` + native lazy loading, or sirv.js DPR-aware mode.
- `sirv.js` auto-loaded only when a spin / view / viewer needs it.
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

## Dynamic imaging

`<SirvImage>` accepts a `transformations` prop that maps onto Sirv's
[dynamic-imaging parameters](https://sirv.com/help/articles/dynamic-imaging/) - crop, rotate,
blur, grayscale, brightness, profiles, page (for PDFs), and more. Use it for face-cropped
avatars, sepia hero variants, LQIP placeholders, or to apply a saved Sirv profile:

```tsx
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
<SirvImage path="/products/shoe.jpg" width={1200} alt="Shoe" transformations={{ profile: 'Hero' }} />

// Cheap LQIP placeholder (10px wide, blurred):
<SirvImage path="/products/shoe.jpg" width={10} alt="" transformations={{ blur: 20 }} />
```

Precedence: the `transformations` prop wins over `value.transformations` (from your CMS),
which wins over provider defaults. `width`/`height` HTML props remain layout hints; put
`height` inside `transformations` if you want it baked into the delivered URL too. Use
`transformations.extras` for any parameter not modelled in the type (it's emitted verbatim).

## 360 spin options

`<SirvSpin>` takes a `options` prop mapping the common sirv.js
[spin options](https://sirv.com/help/articles/360-spin/#options) onto `data-*` attributes:

```tsx
// Before
<SirvSpin path="/products/shoe.spin" width={600} height={600} />

// After: autospin, hide the bottom bar, allow fullscreen zoom
<SirvSpin
  path="/products/shoe.spin"
  width={600}
  height={600}
  options={{
    autospin: 'always',
    autospinSpeed: 200,
    spinDirection: 'cw',
    hint: 'once',
    bottomBar: 'hide',
    fullscreenZoom: true,
  }}
/>
```

Anything not modelled goes through `options.extras` (camelCase keys become `data-<kebab-case>`).

## Sirv Media Viewer options

`<SirvGallery layout="viewer">` takes a `viewer` prop modelling the common
[Sirv Media Viewer](https://sirv.com/help/articles/sirv-media-viewer/) knobs:

```tsx
// Before
<SirvGallery items={items} layout="viewer" width={800} height={600} />

// After: bottom thumbnails, autoplay every 4s, zoom + fullscreen + arrows
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
/>
```

Each named field becomes a `data-*` attribute on the `.Sirv` container; use `viewer.extras` for
anything else.

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
