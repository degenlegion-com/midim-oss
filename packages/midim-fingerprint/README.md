# @midim/fingerprint

[![npm](https://img.shields.io/npm/v/%40midim%2Ffingerprint?label=npm)](https://www.npmjs.com/package/@midim/fingerprint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Deterministic MIDI fingerprinting — 8 content hashes from any MIDI file. No network calls, no corpus lookups, fully local.

## Install

```bash
pnpm add @midim/fingerprint
# or globally for CLI use:
pnpm add -g @midim/fingerprint
```

## CLI Usage

```bash
# Human-readable output
midim-fingerprint song.mid

# Machine-readable JSON
midim-fingerprint song.mid --json
```

### Example output

```json
{
  "hashes": {
    "raw_file_hash_blake3":       "a3f9...c1d2",
    "raw_file_hash_sha256":       "7b2e...9f80",
    "normalized_midi_hash":       "c44a...3e01",
    "note_sequence_hash":         "8812...ab4f",
    "rhythm_hash":                "0d3c...7711",
    "pitch_class_hash":           "f90e...2210",
    "basic_chord_hash":           "3ab1...cc00",
    "basic_repeated_phrase_hash": "6fe3...8890"
  },
  "metadata": {
    "tracks": 2,
    "notes": 144,
    "duration_seconds": 32.5,
    "instruments": [0, 32],
    "tempo_range": { "min_bpm": 120, "max_bpm": 120 }
  },
  "fingerprint_version": "1.0"
}
```

## TypeScript API

```typescript
import { generateFingerprint } from "@midim/fingerprint";
import { readFileSync } from "node:fs";

const buffer = new Uint8Array(readFileSync("song.mid"));
const result = generateFingerprint(buffer);

// All 8 hashes are deterministic hex strings
console.log(result.hashes.raw_file_hash_blake3);
console.log(result.metadata.notes, "notes");
```

## Hash descriptions

| Hash | What it captures |
|------|-----------------|
| `raw_file_hash_blake3` | Exact file identity (BLAKE3) |
| `raw_file_hash_sha256` | Exact file identity (SHA-256) |
| `normalized_midi_hash` | All note data normalized |
| `note_sequence_hash` | Pitch sequence only |
| `rhythm_hash` | Timing/duration pattern |
| `pitch_class_hash` | Pitch class distribution |
| `basic_chord_hash` | Chord sequence |
| `basic_repeated_phrase_hash` | Repeated phrase patterns |

## What is NOT included

- Corpus similarity search (MIDIM.net commercial)
- Motif registry lookup (MIDIM.net commercial)
- Embedding/vector similarity (MIDIM.net commercial)
- Rights confidence scoring (MIDIM.net commercial)

For registry-backed POIM, corpus similarity search, rights registry lookup, and marketplace eligibility, visit [MIDIM.net](https://midim.net).

## Disclaimer

This tool computes local file hashes only. It does not determine copyright ownership, provenance registry status, or marketplace eligibility.

## License

MIT
