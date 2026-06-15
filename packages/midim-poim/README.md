# @midim/poim

[![npm](https://img.shields.io/npm/v/%40midim%2Fpoim?label=npm)](https://www.npmjs.com/package/@midim/poim)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Local self-signed POIM (Proof of Intent and Mastery) certificates for MIDI files. Uses Ed25519 signatures + BLAKE3 hashing. Fully local — no POIM registry, no network calls.

## Install

```bash
pnpm add @midim/poim
# or globally for CLI use:
pnpm add -g @midim/poim
```

## CLI Usage

```bash
# Generate a keypair
midim-poim keygen mykey.json

# Hash a MIDI file
midim-poim hash song.mid

# Sign a MIDI file (produces song.mid.poim.json)
midim-poim sign song.mid --private-key mykey.json

# Verify a MIDI file against its certificate
midim-poim verify song.mid song.mid.poim.json
```

### Example certificate JSON

```json
{
  "poim_version": "1.0",
  "certificate_type": "local_self_signed",
  "cert_id": "550e8400-e29b-41d4-a716-446655440000",
  "asset_type": "midi",
  "asset_hash_alg": "BLAKE3",
  "asset_hash": "a3f9...c1d2",
  "asset_filename": "song.mid",
  "creator_pubkey_ed25519": null,
  "issuer_pubkey_ed25519": "d75a...9f11",
  "source_work": null,
  "rights_statement": {
    "statement": "Self-certified: creator asserts original authorship or rights to this MIDI file.",
    "license": null
  },
  "issued_at": "2024-06-15T12:00:00.000Z",
  "signature_alg": "Ed25519",
  "signature": "7f3c...ab12",
  "disclaimer": "This is a LOCAL SELF-SIGNED certificate..."
}
```

## TypeScript API

```typescript
import { generateKeyPair, hashAsset, signCertificate, verifyCertificate } from "@midim/poim";
import { readFileSync, writeFileSync } from "node:fs";

// 1. Generate a keypair (do this once, save it securely)
const keypair = generateKeyPair();
// { pubkey_hex: "...", privkey_hex: "..." }

// 2. Hash your MIDI file
const buffer = new Uint8Array(readFileSync("song.mid"));
const hash = hashAsset(buffer, "BLAKE3");

// 3. Sign to produce a certificate
const cert = signCertificate(buffer, keypair.privkey_hex, keypair.pubkey_hex, {
  filename: "song.mid",
  source_work: { title: "My Composition", composer: "Jane Doe" },
});
writeFileSync("song.poim.json", JSON.stringify(cert, null, 2));

// 4. Verify
const result = verifyCertificate(buffer, cert);
console.log(result.valid); // true
```

## What this certificate is (and is not)

**Is:**
- A local cryptographic proof that you possessed this exact MIDI file at the time of signing
- A self-asserted declaration of your rights claim
- A tamper-evident record bound to the specific MIDI bytes

**Is NOT:**
- A POIM registry certificate (requires MIDIM.net)
- A legal determination of copyright ownership
- A marketplace eligibility certificate
- A rights confidence score

This certificate contains a `disclaimer` field that must always be preserved.

## Open-core boundary

| Feature | This package (OSS) | MIDIM.net (commercial) |
|---------|-------------------|----------------------|
| Key generation | ✓ | ✓ |
| BLAKE3/SHA-256 hashing | ✓ | ✓ |
| Self-signed certificate | ✓ | — |
| Ed25519 signature + verify | ✓ | ✓ |
| POIM registry submission | — | ✓ |
| Provenance graph | — | ✓ |
| Rights confidence score | — | ✓ |
| Marketplace eligibility | — | ✓ |
| Claim resolution | — | ✓ |

For registry-backed POIM, provenance graph, and marketplace eligibility, visit [MIDIM.net](https://midim.net).

## License

MIT
