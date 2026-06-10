import { type ReactNode, createContext, useContext } from 'react';
import type { LazyMode } from './types.js';

export interface SirvConfig {
  /** Your Sirv account alias, e.g. "demo.sirv.com". Set it once here; nested components inherit it. */
  alias?: string;
  /** Default image quality (0-100). */
  quality?: number;
  /** Default lazy-load mode for images. */
  lazyMode?: LazyMode;
}

const SirvContext = createContext<SirvConfig>({});

export interface SirvProviderProps extends SirvConfig {
  children: ReactNode;
}

/**
 * Sets your Sirv account alias (and image defaults) ONCE for the whole app. Place it near the
 * root (e.g. your root layout); every nested @sirv/react component inherits the alias from
 * context, so you never pass `alias` again. A component's own `alias` prop is just an optional
 * override for a one-off asset from a different account.
 */
export function SirvProvider({ children, ...config }: SirvProviderProps) {
  return <SirvContext.Provider value={config}>{children}</SirvContext.Provider>;
}

export function useSirvConfig(): SirvConfig {
  return useContext(SirvContext);
}
