// next/image custom loader shim. Usage:
//   // sirv-loader.ts
//   export { sirvLoader as default } from '@sirv/react/next';
// then in next.config.js: images: { loader: 'custom', loaderFile: './sirv-loader.ts' }

export interface SirvLoaderArgs {
  /** A Sirv delivery URL (or path) passed to <Image src>. */
  src: string;
  width: number;
  quality?: number;
}

/** Appends Sirv width/quality/format params, delegating optimization to Sirv. */
export function sirvLoader({ src, width, quality }: SirvLoaderArgs): string {
  const [base, existing = ''] = src.split('?');
  const params = new URLSearchParams(existing);
  params.set('w', String(width));
  if (quality != null) params.set('q', String(quality));
  if (!params.has('format')) params.set('format', 'optimal');
  return `${base}?${params.toString()}`;
}

export default sirvLoader;
