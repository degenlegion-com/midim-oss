import { ed25519 } from "@noble/curves/ed25519.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { hashBlake3, hashSha256, canonicalJsonExcluding } from "@midim/shared";
import type { HashAlgorithm, PoimKeyPair } from "@midim/shared";
import { PoimError } from "@midim/shared";

export { bytesToHex, hexToBytes };

export function generateKeyPair(): PoimKeyPair {
  const privKey = ed25519.utils.randomSecretKey();
  const pubKey = ed25519.getPublicKey(privKey);
  return {
    pubkey_hex: bytesToHex(pubKey),
    privkey_hex: bytesToHex(privKey),
  };
}

export function hashAsset(
  buffer: Uint8Array,
  algorithm: HashAlgorithm = "BLAKE3"
): string {
  if (algorithm === "BLAKE3") return hashBlake3(buffer);
  return hashSha256(buffer);
}

export function canonicalizeCertPayload(
  cert: Record<string, unknown>
): string {
  return canonicalJsonExcluding(cert, ["signature"]);
}

export function signCertPayload(
  payload: Record<string, unknown>,
  privkeyHex: string
): string {
  if (!/^[0-9a-f]{64}$/i.test(privkeyHex)) {
    throw new PoimError("Invalid private key: expected 64 hex characters");
  }
  const canonical = canonicalizeCertPayload(payload);
  const msgBytes = new TextEncoder().encode(canonical);
  const sig = ed25519.sign(msgBytes, hexToBytes(privkeyHex));
  return bytesToHex(sig);
}

export function verifyCertSignature(
  cert: Record<string, unknown>
): { valid: boolean; error?: string } {
  try {
    const sig = cert["signature"] as string | undefined;
    const pubkey = cert["issuer_pubkey_ed25519"] as string | undefined;

    if (!sig) return { valid: false, error: "Missing signature" };
    if (!pubkey) return { valid: false, error: "Missing issuer_pubkey_ed25519" };
    if (!/^[0-9a-f]{128}$/i.test(sig)) {
      return { valid: false, error: "Malformed signature: expected 128 hex chars" };
    }
    if (!/^[0-9a-f]{64}$/i.test(pubkey)) {
      return {
        valid: false,
        error: "Malformed issuer_pubkey_ed25519: expected 64 hex chars",
      };
    }

    const canonical = canonicalizeCertPayload(cert);
    const msgBytes = new TextEncoder().encode(canonical);
    const valid = ed25519.verify(hexToBytes(sig), msgBytes, hexToBytes(pubkey));

    if (!valid) {
      return {
        valid: false,
        error: "Signature cryptographically invalid — payload may have been tampered",
      };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
