import { canonicalize } from "json-canonicalize";

export function canonicalJson(obj: unknown): string {
  return canonicalize(obj as Record<string, unknown>);
}

export function canonicalJsonBytes(obj: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalJson(obj));
}

export function canonicalJsonExcluding(
  obj: Record<string, unknown>,
  excludeKeys: string[]
): string {
  const filtered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!excludeKeys.includes(k)) {
      filtered[k] = v;
    }
  }
  return canonicalize(filtered);
}
