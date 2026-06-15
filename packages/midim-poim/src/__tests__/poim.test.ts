import { describe, it, expect } from "vitest";
import { generateKeyPair, hashAsset } from "../crypto.js";
import { signCertificate, verifyCertificate } from "../certificate.js";
import { buildScaleMidi, canonicalJson } from "@midim/shared";

describe("POIM certificate — generateKeyPair", () => {
  it("generates valid Ed25519 keypair", () => {
    const kp = generateKeyPair();
    expect(kp.pubkey_hex).toMatch(/^[0-9a-f]{64}$/);
    expect(kp.privkey_hex).toMatch(/^[0-9a-f]{64}$/);
    expect(kp.pubkey_hex).not.toEqual(kp.privkey_hex);
  });

  it("each call returns a unique keypair", () => {
    const kp1 = generateKeyPair();
    const kp2 = generateKeyPair();
    expect(kp1.privkey_hex).not.toEqual(kp2.privkey_hex);
  });
});

describe("POIM certificate — hashAsset", () => {
  it("produces deterministic BLAKE3 hash", () => {
    const buf = buildScaleMidi(60, 8);
    const h1 = hashAsset(buf, "BLAKE3");
    const h2 = hashAsset(buf, "BLAKE3");
    expect(h1).toEqual(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces deterministic SHA-256 hash", () => {
    const buf = buildScaleMidi(60, 8);
    const h = hashAsset(buf, "SHA-256");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("BLAKE3 and SHA-256 differ", () => {
    const buf = buildScaleMidi(60, 8);
    expect(hashAsset(buf, "BLAKE3")).not.toEqual(hashAsset(buf, "SHA-256"));
  });
});

describe("POIM certificate — signCertificate + verifyCertificate", () => {
  it("valid signature verifies correctly", () => {
    const { pubkey_hex, privkey_hex } = generateKeyPair();
    const buf = buildScaleMidi(60, 8);
    const cert = signCertificate(buf, privkey_hex, pubkey_hex);

    expect(cert.certificate_type).toBe("local_self_signed");
    expect(cert.asset_hash_alg).toBe("BLAKE3");
    expect(cert.signature_alg).toBe("Ed25519");
    expect(cert.signature).toMatch(/^[0-9a-f]{128}$/);
    expect(cert.disclaimer).toContain("MIDIM.net");

    const result = verifyCertificate(buf, cert);
    expect(result.valid).toBe(true);
    expect(result.asset_hash_verified).toBe(true);
    expect(result.signature_verified).toBe(true);
  });

  it("tampered POIM payload fails verification", () => {
    const { pubkey_hex, privkey_hex } = generateKeyPair();
    const buf = buildScaleMidi(60, 8);
    const cert = signCertificate(buf, privkey_hex, pubkey_hex);

    const tampered = { ...cert, issued_at: "1970-01-01T00:00:00.000Z" };
    const result = verifyCertificate(buf, tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("wrong public key fails verification", () => {
    const kp1 = generateKeyPair();
    const kp2 = generateKeyPair();
    const buf = buildScaleMidi(60, 8);
    const cert = signCertificate(buf, kp1.privkey_hex, kp1.pubkey_hex);

    const wrongKeycert = { ...cert, issuer_pubkey_ed25519: kp2.pubkey_hex };
    const result = verifyCertificate(buf, wrongKeycert);
    expect(result.valid).toBe(false);
  });

  it("changed MIDI after cert issuance fails asset hash check", () => {
    const { pubkey_hex, privkey_hex } = generateKeyPair();
    const buf = buildScaleMidi(60, 8);
    const cert = signCertificate(buf, privkey_hex, pubkey_hex);

    const differentBuf = buildScaleMidi(62, 8);
    const result = verifyCertificate(differentBuf, cert);
    expect(result.valid).toBe(false);
    expect(result.asset_hash_verified).toBe(false);
    expect(result.error).toContain("hash mismatch");
  });

  it("cert does not contain forbidden registry fields", () => {
    const { pubkey_hex, privkey_hex } = generateKeyPair();
    const buf = buildScaleMidi(60, 8);
    const cert = signCertificate(buf, privkey_hex, pubkey_hex);
    const json = JSON.stringify(cert);

    expect(json).not.toContain("poimLevel");
    expect(json).not.toContain("rights_confidence");
    expect(json).not.toContain("marketplace_eligible");
    expect(json).not.toContain('"certId"');
  });
});

describe("canonical JSON edge cases", () => {
  it("canonicalize is deterministic regardless of key order", () => {
    const a = canonicalJson({ z: 1, a: 2, m: 3 });
    const b = canonicalJson({ m: 3, z: 1, a: 2 });
    expect(a).toBe(b);
  });

  it("canonicalize handles nested objects", () => {
    const obj = { b: { d: 4, c: 3 }, a: { f: 6, e: 5 } };
    const result = canonicalJson(obj);
    expect(result).toBe('{"a":{"e":5,"f":6},"b":{"c":3,"d":4}}');
  });

  it("canonicalize handles null and arrays", () => {
    const obj = { arr: [3, 1, 2], nullable: null };
    const result = canonicalJson(obj);
    expect(result).toBe('{"arr":[3,1,2],"nullable":null}');
  });
});
