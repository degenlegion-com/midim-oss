# @midim/diff

[![npm](https://img.shields.io/npm/v/%40midim%2Fdiff?label=npm)](https://www.npmjs.com/package/@midim/diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Local MIDI similarity scoring — 9 scores, variability level, and a risk label. No network calls, no corpus lookups, fully local.

## Install

```bash
pnpm add @midim/diff
# or globally for CLI use:
pnpm add -g @midim/diff
```

## CLI Usage

```bash
# Human-readable similarity report
midim-diff source.mid candidate.mid

# JSON output
midim-diff source.mid candidate.mid --json

# Normalization flags
midim-diff source.mid candidate.mid --ignore-velocity --allow-transposition
```

### Example JSON output

```json
{
  "scores": {
    "note_sequence_similarity":    92,
    "rhythm_similarity":           88,
    "pitch_class_similarity":      95,
    "tempo_similarity":            100,
    "structure_similarity":        90,
    "melodic_contour_similarity":  91,
    "harmonic_similarity":         86,
    "dynamic_similarity":          78,
    "instrumentation_similarity":  100
  },
  "overall_similarity": 91,
  "variability_level": "V1",
  "similarity_label": "NEAR_IDENTICAL",
  "human_review_recommended": true,
  "basic_similarity_risk": "HIGH",
  "options_applied": { "allow_transposition": true },
  "disclaimer": "DISCLAIMER: ..."
}
```

## TypeScript API

```typescript
import { compareMidiFiles } from "@midim/diff";
import { readFileSync } from "node:fs";

const src = new Uint8Array(readFileSync("source.mid"));
const cand = new Uint8Array(readFileSync("candidate.mid"));

const result = compareMidiFiles(src, cand, {
  ignore_velocity: true,
  allow_transposition: false,
  allow_tempo_scaling: false,
  ignore_instrumentation: false,
});

console.log(result.overall_similarity);      // 0–100
console.log(result.variability_level);       // "V0"–"V9"
console.log(result.similarity_label);        // "IDENTICAL" | "NEAR_IDENTICAL" | ...
console.log(result.basic_similarity_risk);   // "NONE" | "LOW" | "MEDIUM" | "HIGH"
```

## Variability levels

| Level | Overall similarity | Meaning |
|-------|-------------------|---------|
| V0 | ≥98 | Identical |
| V1 | ≥90 | Near-identical |
| V2 | ≥80 | Highly similar |
| V3 | ≥70 | Similar |
| V4 | ≥60 | Moderately similar |
| V5 | ≥50 | Low similarity |
| V6–V9 | <50 | Different |

## Important legal disclaimer

This tool provides **local mathematical similarity scores only**. It does **not** determine copyright ownership, infringement, or marketplace eligibility. Similarity scores are not legal opinions. Consult a qualified attorney for rights questions.

This tool will **never** output "infringing", "not infringing", "marketplace eligible", or "rights confidence" — those determinations belong to qualified humans and legal processes.

For registry-backed POIM, corpus similarity search, rights registry lookup, and marketplace eligibility, visit [MIDIM.net](https://midim.net).

## License

MIT
