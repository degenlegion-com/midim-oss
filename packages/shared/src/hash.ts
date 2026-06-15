import { blake3 } from "@noble/hashes/blake3.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { HashError } from "./errors.js";

export { bytesToHex, hexToBytes };

export function hashBlake3(data: Uint8Array): string {
  try {
    return bytesToHex(blake3(data));
  } catch (err) {
    throw new HashError("BLAKE3 hash failed", err);
  }
}

export function hashSha256(data: Uint8Array): string {
  try {
    return bytesToHex(sha256(data));
  } catch (err) {
    throw new HashError("SHA-256 hash failed", err);
  }
}

export function hashString(s: string, algorithm: "BLAKE3" | "SHA-256" = "BLAKE3"): string {
  const bytes = new TextEncoder().encode(s);
  return algorithm === "BLAKE3" ? hashBlake3(bytes) : hashSha256(bytes);
}
