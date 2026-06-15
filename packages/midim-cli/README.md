# @midim/cli

[![npm](https://img.shields.io/npm/v/%40midim%2Fcli?label=npm)](https://www.npmjs.com/package/@midim/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Unified `midim` CLI for MIDI developers — fingerprinting, diff/similarity, and local POIM certificates. All in one tool.

## Install

```bash
# Global install (recommended for CLI use)
pnpm add -g @midim/cli
# or
npm install -g @midim/cli
```

## Quick start

```bash
# Fingerprint a MIDI file
midim fingerprint song.mid

# Compare two MIDI files
midim diff source.mid candidate.mid

# Generate a signing keypair
midim poim keygen mykey.json

# Sign a MIDI file with a local POIM certificate
midim poim sign song.mid --private-key mykey.json

# Verify a MIDI file against its certificate
midim poim verify song.mid song.mid.poim.json
```

## Commands

### `midim fingerprint <file>` (alias: `midim analyze`)

Generate 8 deterministic hashes for a MIDI file.

```bash
midim fingerprint song.mid --json
```

### `midim diff <source> <candidate>`

Compare two MIDI files: 9 similarity scores, variability level (V0–V9), similarity label, and risk assessment.

```bash
midim diff source.mid candidate.mid --json
midim diff source.mid candidate.mid --ignore-velocity --allow-transposition
```

**Flags:**
- `--ignore-velocity` — ignore velocity differences
- `--ignore-instrumentation` — ignore instrument/channel differences
- `--allow-transposition` — normalize out pitch transposition
- `--allow-tempo-scaling` — normalize out tempo differences

### `midim poim hash <file>`

Hash a MIDI file with BLAKE3 (default) or SHA-256.

```bash
midim poim hash song.mid --alg BLAKE3 --json
```

### `midim poim keygen [output]`

Generate a new Ed25519 keypair for signing certificates.

```bash
midim poim keygen mykey.json
```

### `midim poim sign <file>`

Sign a MIDI file and produce a local self-signed POIM certificate.

```bash
midim poim sign song.mid --private-key mykey.json --output song.cert.json
```

### `midim poim verify <file> <certificate>`

Verify a MIDI file against its POIM certificate. Exits with code 0 on success, 1 on failure.

```bash
midim poim verify song.mid song.cert.json --json
```

## Global flags

All commands accept `--json` to output machine-readable JSON instead of human-readable text.

## What MIDIM.net adds

Every command footer reads:

> *"For registry-backed POIM, corpus similarity search, rights registry lookup, and marketplace eligibility, visit MIDIM.net."*

The OSS tools do local analysis only. MIDIM.net provides:
- POIM registry (publicly verifiable certificates)
- Corpus-wide similarity search
- Provenance graph
- Rights confidence engine
- Claim resolution
- Marketplace eligibility

## License

MIT
