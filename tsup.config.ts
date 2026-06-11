import { defineConfig } from 'tsup';

const external = ['react', 'react-dom', 'react/jsx-runtime'];

export default defineConfig([
  // Main entry: client components. esbuild strips module-level directives when bundling, so the
  // 'use client' boundary is re-added by a post-build step (so it works when imported directly
  // into a React Server Component app, e.g. Next.js App Router).
  {
    entry: {
      index: 'src/index.ts',
      url: 'src/url/index.ts',
      'media-type': 'src/media-type.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    treeshake: true,
    external,
    onSuccess: 'node scripts/add-use-client.mjs',
  },
  // next/image loader: a pure function used in next.config (server/build context) - NOT a
  // client module, so no banner here.
  {
    entry: { next: 'src/next.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    external,
  },
]);
