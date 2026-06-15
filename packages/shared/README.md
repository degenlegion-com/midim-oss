# @midim/shared

[![npm](https://img.shields.io/npm/v/%40midim%2Fshared?label=npm)](https://www.npmjs.com/package/@midim/shared)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Shared utilities for MIDIM OSS tools: MIDI parsing, hashing, canonical JSON, types, error classes, and synthetic MIDI fixtures for testing.

## Install

```bash
pnpm add @midim/shared
```

## API Usage

```typescript
import { parseMidi, hashBlake3, hashSha256, canonicalJson } from "@midim/shared";
import { readFileSync } from "node:fs";

// Parse a MIDI file
const buffer = new Uint8Array(readFileSync("song.mid"));
const parsed = parseMidi(buffer);
console.log(parsed.allNotes.length, "notes in", parsed.durationSeconds, "seconds");

// Hash it
const blake3Hash = hashBlake3(buffer);
const sha256Hash = hashSha256(buffer);

// Canonical JSON (RFC 8785)
const canonical = canonicalJson({ z: 1, a: 2 }); // → '{"a":2,"z":1}'
```

## Types

```typescript
import type { MidiNote, MidiTrack, ParsedMidi, FingerprintResult, DiffResult } from "@midim/shared";

// MidiNote
interface MidiNote {
  pitch: number;       // MIDI pitch 0–127
  startTick: number;   // absolute tick position
  durationTicks: number;
  velocity: number;    // 0–127
  channel: number;
  trackIndex: number;
}
```

## Test Fixtures

Synthetic MIDI generators for unit tests — no `.mid` files needed:

```typescript
import { buildScaleMidi, buildChordMidi, buildSyntheticMidi } from "@midim/shared";

const cMajorScale = buildScaleMidi(60, 8);           // 8-note C-major scale
const chords = buildChordMidi([[60,64,67],[65,69,72]]); // two chords
```

## Disclaimer

This package is part of MIDIM OSS tools. It provides local-only analysis utilities. For registry-backed POIM, corpus similarity search, rights registry lookup, and marketplace eligibility, visit [MIDIM.net](https://midim.net).

## License

MIT
