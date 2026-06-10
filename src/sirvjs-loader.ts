import { useEffect } from 'react';

export const SIRV_JS_URL = 'https://scripts.sirv.com/sirvjs/v3/sirv.js';

interface SirvWindow {
  Sirv?: unknown;
}

/**
 * Injects sirv.js once per document (idempotent). Spins and views need it at runtime;
 * multiple components on a page share the single loader.
 */
export function ensureSirvJs(doc: Document = document): void {
  const win = doc.defaultView as (Window & SirvWindow) | null;
  if (win?.Sirv) return;
  if (doc.querySelector(`script[src="${SIRV_JS_URL}"]`)) return;
  const script = doc.createElement('script');
  script.src = SIRV_JS_URL;
  script.async = true;
  (doc.head ?? doc.body ?? doc.documentElement).appendChild(script);
}

/** Loads sirv.js on mount when enabled (no-op during SSR). */
export function useSirvJs(enabled = true): void {
  useEffect(() => {
    if (enabled && typeof document !== 'undefined') ensureSirvJs(document);
  }, [enabled]);
}
