import { type RefObject, useEffect } from 'react';

export const SIRV_JS_URL = 'https://scripts.sirv.com/sirvjs/v3/sirv.js';

export interface SirvJsApi {
  start?: (target?: string | Element) => void;
  stop?: (target?: string | Element) => void;
}

interface SirvWindow {
  Sirv?: SirvJsApi;
}

export interface EnsureSirvJsOptions {
  document?: Document;
  scriptUrl?: string;
  onLoad?: (api: SirvJsApi | undefined) => void;
  onError?: (event: Event) => void;
}

export interface UseSirvJsOptions extends Omit<EnsureSirvJsOptions, 'document' | 'onLoad'> {
  root?: RefObject<Element | null>;
  autoStart?: boolean;
  restartKey?: unknown;
  startDelay?: number;
}

function isDocument(value: unknown): value is Document {
  return Boolean(value && typeof value === 'object' && 'createElement' in value);
}

function resolveDocument(options?: Document | EnsureSirvJsOptions): Document | undefined {
  if (isDocument(options)) return options;
  if (options?.document) return options.document;
  return typeof document === 'undefined' ? undefined : document;
}

function splitScriptOptions(src: string): { base: string; hasOptions: boolean } {
  const withoutHash = src.split('#', 1)[0] ?? src;
  const queryIndex = withoutHash.indexOf('?');
  return {
    base: queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex),
    hasOptions: queryIndex !== -1,
  };
}

function scriptSourceMatches(existingSrc: string, requestedSrc: string): boolean {
  if (!existingSrc) return false;
  if (existingSrc === requestedSrc) return true;

  const existing = splitScriptOptions(existingSrc);
  const requested = splitScriptOptions(requestedSrc);
  if (existing.base !== requested.base) return false;

  // The full bundle satisfies a module-limited request; a module-limited bundle does not
  // satisfy a later request for the full bundle or a different module list.
  return requested.hasOptions && !existing.hasOptions;
}

function findScript(doc: Document, scriptUrl: string): HTMLScriptElement | null {
  for (const script of Array.from(doc.scripts)) {
    const attrSrc = script.getAttribute('src') ?? '';
    if (scriptSourceMatches(attrSrc, scriptUrl) || scriptSourceMatches(script.src, scriptUrl)) {
      return script;
    }
  }

  return null;
}

/**
 * Injects sirv.js once per document (idempotent). Spins and views need it at runtime;
 * multiple components on a page share the single loader.
 */
export function ensureSirvJs(options?: Document | EnsureSirvJsOptions): HTMLScriptElement | null {
  const doc = resolveDocument(options);
  if (!doc) return null;
  const loaderOptions = isDocument(options) ? undefined : options;
  const scriptUrl = loaderOptions?.scriptUrl ?? SIRV_JS_URL;
  const win = doc.defaultView as (Window & SirvWindow) | null;
  if (win?.Sirv) {
    loaderOptions?.onLoad?.(win.Sirv);
    return null;
  }

  const existingScript = findScript(doc, scriptUrl);
  if (existingScript) {
    if (loaderOptions?.onLoad) {
      existingScript.addEventListener('load', () => loaderOptions.onLoad?.(win?.Sirv), {
        once: true,
      });
    }
    if (loaderOptions?.onError) {
      existingScript.addEventListener('error', loaderOptions.onError, { once: true });
    }
    return existingScript;
  }

  const script = doc.createElement('script');
  script.src = scriptUrl;
  script.async = true;
  if (loaderOptions?.onLoad) {
    script.addEventListener('load', () => loaderOptions.onLoad?.(win?.Sirv));
  }
  if (loaderOptions?.onError) {
    script.addEventListener('error', loaderOptions.onError);
  }
  (doc.head ?? doc.body ?? doc.documentElement).appendChild(script);
  return script;
}

/** Loads sirv.js on mount when enabled (no-op during SSR). */
export function useSirvJs(enabled = true, options: UseSirvJsOptions = {}): void {
  const { autoStart, onError, restartKey, root, scriptUrl, startDelay } = options;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;
    void restartKey;

    const doc = document;
    const win = doc.defaultView as (Window & SirvWindow) | null;
    const shouldAutoStart = autoStart ?? true;
    const resolvedStartDelay = startDelay ?? 50;
    const element = root?.current ?? undefined;
    const hasSirvApi = Boolean(win?.Sirv);
    let active = true;
    let startTimer: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      if (!active || !shouldAutoStart) return;
      win?.Sirv?.start?.(element);
    };

    ensureSirvJs({
      document: doc,
      scriptUrl,
      onError,
      onLoad: hasSirvApi ? undefined : start,
    });

    if (shouldAutoStart && hasSirvApi) {
      startTimer = setTimeout(start, resolvedStartDelay);
    }

    return () => {
      active = false;
      if (startTimer) clearTimeout(startTimer);
      if (shouldAutoStart && element) win?.Sirv?.stop?.(element);
    };
  }, [enabled, scriptUrl, onError, root, autoStart, restartKey, startDelay]);
}
