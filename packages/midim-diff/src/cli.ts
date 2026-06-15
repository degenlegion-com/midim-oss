#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { compareMidiFiles } from "./diff.js";

const FOOTER =
  "\nFor registry-backed POIM, corpus similarity search, rights registry lookup, " +
  "and marketplace eligibility, visit MIDIM.net.";

function main(): void {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes("--json");
  const ignoreVelocity = args.includes("--ignore-velocity");
  const ignoreInstrumentation = args.includes("--ignore-instrumentation");
  const ignoreMetadata = args.includes("--ignore-metadata");
  const allowTransposition = args.includes("--allow-transposition");
  const allowTempoScaling = args.includes("--allow-tempo-scaling");

  const files = args.filter((a) => !a.startsWith("--"));
  if (files.length < 2) {
    console.error(
      "Usage: midim-diff <source.mid> <candidate.mid> [--json] [--ignore-velocity] " +
        "[--ignore-metadata] [--ignore-instrumentation] [--allow-transposition] [--allow-tempo-scaling]"
    );
    process.exit(1);
  }

  const [srcPath, candPath] = files;
  const srcBuf = new Uint8Array(readFileSync(srcPath!));
  const candBuf = new Uint8Array(readFileSync(candPath!));

  const result = compareMidiFiles(srcBuf, candBuf, {
    ignore_velocity: ignoreVelocity,
    ignore_metadata: ignoreMetadata,
    ignore_instrumentation: ignoreInstrumentation,
    allow_transposition: allowTransposition,
    allow_tempo_scaling: allowTempoScaling,
  });

  if (jsonFlag) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`MIDI Similarity Report`);
    console.log(`  Source:    ${srcPath}`);
    console.log(`  Candidate: ${candPath}`);
    console.log("─".repeat(50));
    console.log(`Overall Similarity: ${result.overall_similarity}/100`);
    console.log(`Variability Level:  ${result.variability_level}`);
    console.log(`Similarity Label:   ${result.similarity_label}`);
    console.log(`Risk Level:         ${result.basic_similarity_risk}`);
    console.log(`Human Review:       ${result.human_review_recommended ? "Recommended" : "Not required"}`);
    console.log("\nScores:");
    for (const [key, val] of Object.entries(result.scores)) {
      console.log(`  ${key}: ${val}`);
    }
    console.log(`\n${result.disclaimer}`);
    console.log(FOOTER);
  }
}

main();
