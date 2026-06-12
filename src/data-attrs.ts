// Converts a flat map of option keys to React-ready `data-*` attribute props. Keys are
// camelCase in TypeScript and emitted in kebab-case for the DOM (sirv.js convention).
// Undefined / null values are skipped; booleans become "true" / "false"; numbers are
// stringified. Used by <SirvSpin> and <SirvGallery> to forward options to sirv.js.

function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export type DataAttrValue = string | number | boolean | undefined | null;

export function toDataAttributes(options: Record<string, DataAttrValue>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value == null) continue;
    out[`data-${camelToKebab(key)}`] = String(value);
  }
  return out;
}
