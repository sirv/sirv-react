import type { SirvMediaLike } from './types.js';

export type SirvMediaType = SirvMediaLike['_type'];

export interface SirvMediaTypeSource {
  url?: string;
  path?: string;
  filename?: string;
  mimeType?: string | null;
}

export interface CreateSirvMediaValueInput extends SirvMediaTypeSource {
  alias: string;
  path: string;
  alt?: string;
  type?: SirvMediaType;
}

function sourceText(source: string | SirvMediaTypeSource): string {
  if (typeof source === 'string') return source.toLowerCase();
  return [source.path, source.url, source.filename].filter(Boolean).join(' ').toLowerCase();
}

/** Infers the @sirv/react media discriminator from URL/path, filename, or MIME type. */
export function inferSirvMediaType(source: string | SirvMediaTypeSource): SirvMediaType {
  const text = sourceText(source);
  const mimeType =
    typeof source === 'string' ? '' : (source.mimeType?.toLowerCase().split(';', 1)[0] ?? '');

  if (/\.spin(?:[?#]|$|\s)/i.test(text)) return 'sirv.spin';
  if (/\.view(?:[?#]|$|\s)/i.test(text)) return 'sirv.view';
  if (mimeType.startsWith('video/') || /\.(mp4|mov|webm|m4v)(?:[?#]|$|\s)/i.test(text)) {
    return 'sirv.video';
  }

  return 'sirv.image';
}

/** Creates a discriminated Sirv media value from alias/path input. */
export function createSirvMediaValue(input: CreateSirvMediaValueInput): SirvMediaLike {
  const type = input.type ?? inferSirvMediaType(input);
  const asset = { sirvAlias: input.alias, sirvPath: input.path };

  switch (type) {
    case 'sirv.video':
      return { _type: type, asset, alt: input.alt };
    case 'sirv.spin':
      return { _type: type, asset, alt: input.alt };
    case 'sirv.view':
      return { _type: type, asset, alt: input.alt };
    case 'sirv.image':
      return { _type: type, asset, alt: input.alt };
  }
}
