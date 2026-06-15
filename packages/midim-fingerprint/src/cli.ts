#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { generateFingerprint } from "./fingerprint.js";

const FOOTER =
  "\nFor registry-backed POIM, corpus similarity search, rights registry lookup, " +
  "and marketplace eligibility, visit MIDIM.net.";

function main(): void {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes("--json");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error("Usage: midim-fingerprint <file.mid> [--json]");
    process.exit(1);
  }

  const buffer = new Uint8Array(readFileSync(filePath));
  const result = generateFingerprint(buffer);

  if (jsonFlag) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`MIDI Fingerprint: ${filePath}`);
    console.log("─".repeat(50));
    console.log("Hashes:");
    for (const [key, val] of Object.entries(result.hashes)) {
      console.log(`  ${key}: ${val}`);
    }
    console.log("\nMetadata:");
    console.log(`  tracks: ${result.metadata.tracks}`);
    console.log(`  notes: ${result.metadata.notes}`);
    console.log(`  duration: ${result.metadata.duration_seconds}s`);
    console.log(`  instruments: ${result.metadata.instruments.join(", ") || "none"}`);
    console.log(
      `  tempo: ${result.metadata.tempo_range.min_bpm}–${result.metadata.tempo_range.max_bpm} BPM`
    );
    console.log(FOOTER);
  }
}

main();
