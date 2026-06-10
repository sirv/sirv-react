import { type ReactNode, createContext, useContext } from 'react';
import type { LazyMode } from './types.js';

export interface SirvConfig {
  /** Default account alias, e.g. "demo.sirv.com". Lets components omit it. */
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

/** Optional global config for @sirv/react components (alias, defaults). */
export function SirvProvider({ children, ...config }: SirvProviderProps) {
  return <SirvContext.Provider value={config}>{children}</SirvContext.Provider>;
}

export function useSirvConfig(): SirvConfig {
  return useContext(SirvContext);
}
