import { type Transformations, toQueryParams } from './transformations.js';

export interface SirvUrlInput {
  /** e.g. "alias.sirv.com" or a custom domain (with or without protocol). */
  alias: string;
  /** Absolute Sirv path, e.g. "/products/aw26/shoe-01.jpg". */
  path: string;
}

export interface SirvHostOptions {
  /** Additional custom CDN hosts that should be treated as Sirv delivery hosts. */
  customHosts?: readonly string[];
}

export interface ResponsiveSirvImageSource {
  src: string;
  srcSet?: string;
  sizes?: string;
}

export interface ResponsiveSirvImageOptions extends SirvHostOptions {
  maxWidth?: number;
  maxHeight?: number;
  sizes?: string;
  widths?: readonly number[];
  quality?: number;
  format?: Exclude<NonNullable<Transformations['format']>, 'original'>;
  scaleOption?: Transformations['scaleOption'];
}

const DEFAULT_RESPONSIVE_WIDTHS = [160, 240, 320, 480, 640, 768, 960, 1200, 1600] as const;
const SIRV_SERVICE_HOSTS = new Set([
  'api.sirv.com',
  'my.sirv.com',
  'scripts.sirv.com',
  'sirv.com',
  'stats.sirv.com',
  'video.sirv.com',
  'www.sirv.com',
]);

function origin(alias: string): string {
  return alias.includes('://') ? alias.replace(/\/+$/, '') : `https://${alias}`;
}

function withQuery(base: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Percent-encodes each path segment (preserving the slashes) so paths with spaces or Unicode
 * (e.g. "/my folder/Кира.jpg") produce valid delivery URLs. Sirv decodes them server-side.
 * Already-safe paths like "/products/shoe-01.jpg" pass through unchanged.
 */
function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function baseUrl(input: SirvUrlInput): string {
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  return `${origin(input.alias)}${encodePath(path)}`;
}

function normalizeHost(host: string): string {
  return host
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

function decodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join('/');
}

function absoluteBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/, 1)[0] ?? url;
  }
}

function normalizeResponsiveCandidateWidths(
  widths: readonly number[] | undefined,
  maxWidth?: number,
): number[] {
  const resolvedMaxWidth = maxWidth && maxWidth > 0 ? Math.round(maxWidth) : undefined;
  const baseWidths = widths?.length ? widths : DEFAULT_RESPONSIVE_WIDTHS;
  const normalized = Array.from(
    new Set(
      baseWidths
        .filter((width) => Number.isFinite(width) && width > 0)
        .map((width) => Math.round(width))
        .filter((width) => (resolvedMaxWidth ? width <= resolvedMaxWidth : true)),
    ),
  ).sort((left, right) => left - right);

  if (resolvedMaxWidth && !normalized.includes(resolvedMaxWidth)) {
    normalized.push(resolvedMaxWidth);
    normalized.sort((left, right) => left - right);
  }

  return normalized;
}

function responsiveCandidateHeight(
  width: number,
  maxWidth?: number,
  maxHeight?: number,
): number | undefined {
  if (!maxHeight) return undefined;
  if (!maxWidth || maxWidth <= 0) return Math.max(1, Math.round(maxHeight));
  return Math.max(1, Math.round((width / maxWidth) * maxHeight));
}

/** Builds a Sirv delivery URL with optional transformation query params. */
export function buildUrl(input: SirvUrlInput, transformations: Transformations = {}): string {
  return withQuery(baseUrl(input), toQueryParams(transformations));
}

/** Builds a transformed URL from an already-absolute Sirv/custom-CDN URL. Existing query params are replaced. */
export function buildSirvUrl(url: string, transformations: Transformations = {}): string {
  return withQuery(absoluteBaseUrl(url), toQueryParams(transformations));
}

/** Image delivery URL (alias of buildUrl, for symmetry with the other media types). */
export const buildImageUrl = buildUrl;

/** Builds a width-descriptor srcset string for responsive images. */
export function buildSrcSet(
  input: SirvUrlInput,
  widths: number[],
  transformations: Transformations = {},
): string {
  return widths.map((w) => `${buildUrl(input, { ...transformations, width: w })} ${w}w`).join(', ');
}

/**
 * Video delivery URL. Sirv serves the video file directly; sizing/format params apply.
 * Format defaults to leaving the source untouched.
 */
export function buildVideoUrl(
  input: SirvUrlInput,
  options: { width?: number; height?: number } = {},
): string {
  return buildUrl(input, { width: options.width, height: options.height });
}

/**
 * A still poster frame for a video, as an image. Sirv derives a JPG frame from the video
 * when an image format is requested.
 */
export function buildVideoPosterUrl(
  input: SirvUrlInput,
  options: { width?: number; height?: number; quality?: number } = {},
): string {
  return buildUrl(input, {
    width: options.width,
    height: options.height,
    quality: options.quality,
    format: 'jpg',
  });
}

/** Spin (.spin) delivery URL - pointed at by sirv.js `data-src`. */
export function buildSpinUrl(input: SirvUrlInput): string {
  return baseUrl(input);
}

/** View (.view) delivery URL - pointed at by sirv.js `data-src`. */
export function buildViewUrl(input: SirvUrlInput): string {
  return baseUrl(input);
}

/** Returns true for Sirv delivery hosts, with optional custom CDN hosts. */
export function isSirvUrl(url: string, options: SirvHostOptions = {}): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.endsWith('.sirv.com') && !SIRV_SERVICE_HOSTS.has(host)) {
      return true;
    }
    return options.customHosts?.some((customHost) => host === normalizeHost(customHost)) ?? false;
  } catch {
    return false;
  }
}

/** Extracts a decoded path from a full URL or returns the decoded path input as-is. */
export function extractSirvPath(urlOrPath: string): string | null {
  try {
    return decodePath(new URL(urlOrPath).pathname);
  } catch {
    return urlOrPath.startsWith('/') ? decodePath(urlOrPath) : null;
  }
}

/** Extracts a decoded path only when the URL is hosted on a Sirv delivery domain. */
export function extractSirvHostedPath(url: string): string | null {
  return isSirvUrl(url) ? extractSirvPath(url) : null;
}

/**
 * Builds a responsive source object from a Sirv URL or alias/path input.
 * Non-Sirv absolute URLs are returned untouched, so callers can safely pass mixed sources.
 */
export function buildResponsiveSirvImageSource(
  input: SirvUrlInput | string,
  options: ResponsiveSirvImageOptions = {},
): ResponsiveSirvImageSource {
  const sizes = options.sizes ?? '100vw';
  const sourceUrl = typeof input === 'string' ? input : baseUrl(input);

  if (typeof input === 'string' && !isSirvUrl(input, { customHosts: options.customHosts })) {
    return { sizes, src: input };
  }

  const candidateWidths = normalizeResponsiveCandidateWidths(options.widths, options.maxWidth);
  const candidates = candidateWidths.map((width) => ({
    width,
    url: buildSirvUrl(sourceUrl, {
      width,
      height: responsiveCandidateHeight(width, options.maxWidth, options.maxHeight),
      scaleOption: options.scaleOption ?? 'fit',
      quality: options.quality,
      format: options.format ?? 'optimal',
    }),
  }));
  const fallback =
    candidates.at(-1)?.url ??
    buildSirvUrl(sourceUrl, {
      width: options.maxWidth,
      height: options.maxHeight,
      scaleOption: options.scaleOption ?? 'fit',
      quality: options.quality,
      format: options.format ?? 'optimal',
    });

  return {
    sizes,
    src: fallback,
    srcSet: candidates.length
      ? candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(', ')
      : undefined,
  };
}

/** Common square thumbnail transform. */
export function createThumbnail(url: string, size = 256): string {
  return buildSirvUrl(url, { thumbnail: size, quality: 80, format: 'jpg' });
}

/** Converts an image format, optionally turning the result into a download URL. */
export function convertFormat(
  url: string,
  format: NonNullable<Transformations['format']>,
  options: { quality?: number; download?: boolean } = {},
): string {
  return buildSirvUrl(url, {
    format,
    quality: options.quality,
    download: options.download,
    pngOptimize: format === 'png',
  });
}

/** Resizes an image while keeping the Sirv scale option explicit. */
export function resizeImage(
  url: string,
  options: {
    width?: number;
    height?: number;
    maxSize?: number;
    scaleOption?: Transformations['scaleOption'];
  },
): string {
  return buildSirvUrl(url, {
    width: options.width,
    height: options.height,
    maxSize: options.maxSize,
    scaleOption: options.scaleOption ?? 'fit',
  });
}

/** Applies a canvas aspect ratio around the image. */
export function applyAspectRatio(
  url: string,
  aspectRatio: string,
  options: {
    canvasColor?: string;
    position?: NonNullable<Transformations['canvas']>['position'];
  } = {},
): string {
  return buildSirvUrl(url, {
    canvas: {
      aspectRatio,
      color: options.canvasColor ?? 'ffffff',
      position: options.position ?? 'center',
    },
  });
}

/** Adds Sirv's download flag, with optional image transform params. */
export function getDownloadUrl(
  url: string,
  format?: NonNullable<Transformations['format']>,
  options: { width?: number; height?: number; quality?: number } = {},
): string {
  return buildSirvUrl(url, {
    format,
    width: options.width,
    height: options.height,
    quality: options.quality,
    download: true,
  });
}
