export type SirvViewerOptionValue = string | number | boolean | null | undefined;
export type SirvViewerOptions = string | Record<string, SirvViewerOptionValue>;

/** Serializes Sirv Media Viewer options for `data-options`. */
export function serializeSirvOptions(
  options: SirvViewerOptions | null | undefined,
): string | undefined {
  if (options == null) return undefined;
  if (typeof options === 'string') return options;

  const serialized = Object.entries(options)
    .filter(([, value]) => value != null)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('; ');

  return serialized || undefined;
}
