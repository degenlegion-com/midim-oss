# MIDIM OSS Tools

[![CI](https://github.com/degenlegion-com/midim-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/degenlegion-com/midim-oss/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Local MIDI developer tools: fingerprinting, diff/similarity, and self-signed POIM certificates. No network calls. No registry. Fully open-source.

> **For registry-backed POIM, corpus similarity search, rights registry lookup, and marketplace eligibility, visit [MIDIM.net](https://midim.net).**

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@midim/cli`](packages/midim-cli/) | Unified `midim` CLI | [![npm](https://img.shields.io/npm/v/%40midim%2Fcli?label=npm)](https://www.npmjs.com/package/@midim/cli) |
| [`@midim/fingerprint`](packages/midim-fingerprint/) | 8-hash MIDI fingerprinting | [![npm](https://img.shields.io/npm/v/%40midim%2Ffingerprint?label=npm)](https://www.npmjs.com/package/@midim/fingerprint) |
| [`@midim/diff`](packages/midim-diff/) | 9-score MIDI similarity | [![npm](https://img.shields.io/npm/v/%40midim%2Fdiff?label=npm)](https://www.npmjs.com/package/@midim/diff) |
| [`@midim/poim`](packages/midim-poim/) | Self-signed POIM certificates | [![npm](https://img.shields.io/npm/v/%40midim%2Fpoim?label=npm)](https://www.npmjs.com/package/@midim/poim) |
| [`@midim/shared`](packages/shared/) | Shared types & utilities | [![npm](https://img.shields.io/npm/v/%40midim%2Fshared?label=npm)](https://www.npmjs.com/package/@midim/shared) |

## Quick install

```bash
pnpm add -g @midim/cli
```

## CLI examples

```bash
# Fingerprint a MIDI file (8 deterministic hashes)
midim fingerprint song.mid --json

# Compare two MIDI files (9 similarity scores)
midim diff source.mid candidate.mid

# Generate a signing keypair
midim poim keygen mykey.json

# Sign a MIDI file with a local POIM certificate
midim poim sign song.mid --private-key mykey.json

# Verify a MIDI file against its certificate
midim poim verify song.mid song.mid.poim.json
```

## TypeScript API examples

### Fingerprinting

```typescript
import { generateFingerprint } from "@midim/fingerprint";
import { readFileSync } from "node:fs";

const buffer = new Uint8Array(readFileSync("song.mid"));
const result = generateFingerprint(buffer);

console.log(result.hashes.raw_file_hash_blake3);   // "a3f9...c1d2"
console.log(result.hashes.note_sequence_hash);      // "8812...ab4f"
console.log(result.metadata.notes);                 // 144
console.log(result.metadata.duration_seconds);      // 32.5
```

### Similarity diff

```typescript
import { compareMidiFiles } from "@midim/diff";
import { readFileSync } from "node:fs";

const src  = new Uint8Array(readFileSync("source.mid"));
const cand = new Uint8Array(readFileSync("candidate.mid"));

const result = compareMidiFiles(src, cand, {
  ignore_velocity: true,
  allow_transposition: false,
});

console.log(result.overall_similarity);   // 0–100
console.log(result.variability_level);    // "V0"–"V9"
console.log(result.similarity_label);     // "IDENTICAL" | "NEAR_IDENTICAL" | ...
console.log(result.basic_similarity_risk); // "NONE" | "LOW" | "MEDIUM" | "HIGH"
```

### POIM certificates

```typescript
import { generateKeyPair, signCertificate, verifyCertificate } from "@midim/poim";
import { readFileSync, writeFileSync } from "node:fs";

// Generate a keypair once (store securely)
const keypair = generateKeyPair();
writeFileSync("mykey.json", JSON.stringify(keypair, null, 2));

// Sign a MIDI file
const buffer = new Uint8Array(readFileSync("song.mid"));
const cert = signCertificate(buffer, keypair.privkey_hex, keypair.pubkey_hex, {
  filename: "song.mid",
  source_work: { title: "My Composition", composer: "Jane Doe" },
});
writeFileSync("song.poim.json", JSON.stringify(cert, null, 2));

// Verify
const result = verifyCertificate(buffer, cert);
console.log(result.valid); // true
```

## What is OSS vs MIDIM.net commercial

| Feature | OSS (this repo) | MIDIM.net |
|---------|----------------|-----------|
| Local fingerprinting (8 hashes) | ✅ | ✅ |
| Local similarity (9 scores) | ✅ | ✅ |
| Local self-signed POIM certificate | ✅ | — |
| Ed25519 keypair + signing | ✅ | ✅ |
| Corpus-wide similarity search | ❌ | ✅ |
| POIM registry | ❌ | ✅ |
| Provenance graph | ❌ | ✅ |
| Rights confidence score | ❌ | ✅ |
| Marketplace eligibility | ❌ | ✅ |
| Enterprise API | ❌ | ✅ |

See [`docs/OPEN_CORE_BOUNDARY.md`](docs/OPEN_CORE_BOUNDARY.md) for the full feature matrix.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint
pnpm lint
```

## Publishing to npm

Releases are automated via [Changesets](https://github.com/changesets/changesets) and the `.github/workflows/release.yml` GitHub Actions workflow.

### One-time setup

1. **Create the `@midim` npm scope** — log in to npmjs.com and ensure the `@midim` organisation exists.
2. **Generate an npm automation token** — go to npmjs.com → Access Tokens → Generate New Token (Automation).
3. **Add `NPM_TOKEN` to GitHub secrets** — in your repo go to Settings → Secrets → Actions → New repository secret named `NPM_TOKEN`.

### Automated release flow

Push to `main` triggers the release workflow:

- If un-released changesets exist, it opens (or updates) a **"Version Packages" PR** that bumps all affected packages.
- When that PR is merged, the workflow builds and publishes all changed packages to npm automatically.

### Manual release (local)

```bash
# 1. Describe your changes
pnpm changeset

# 2. Bump versions based on changesets
pnpm version-packages

# 3. Build and publish (requires NPM_TOKEN env var or `npm login`)
pnpm release
```

All packages are published under the `@midim` npm scope with `publishConfig.access: "public"`.

## License

MIT — see [LICENSE](LICENSE)

---

For registry-backed POIM, provenance graph, and marketplace eligibility, visit [MIDIM.net](https://midim.net).
