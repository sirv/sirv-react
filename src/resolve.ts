import type { SirvConfig } from './SirvProvider.js';

export interface ResolvedTarget {
  alias: string;
  path: string;
}

/** Resolves the Sirv alias + path from a stored value, explicit props, or provider config. */
export function resolveTarget(
  asset: { sirvAlias: string; sirvPath: string } | undefined,
  props: { alias?: string; path?: string },
  config: SirvConfig,
  component: string,
): ResolvedTarget {
  const alias = props.alias ?? asset?.sirvAlias ?? config.alias;
  const path = props.path ?? asset?.sirvPath;
  if (!alias) {
    throw new Error(
      `<${component}>: no Sirv alias (pass alias, a value, or wrap in <SirvProvider>).`,
    );
  }
  if (!path) {
    throw new Error(`<${component}>: no Sirv path (pass path or a value).`);
  }
  return { alias, path };
}
