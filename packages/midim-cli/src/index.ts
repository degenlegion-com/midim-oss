#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { Command } from "commander";
import { generateFingerprint } from "@midim/fingerprint";
import { compareMidiFiles } from "@midim/diff";
import {
  generateKeyPair,
  hashAsset,
  signCertificate,
  verifyCertificate,
} from "@midim/poim";
import type { PoimCertificate } from "@midim/shared";

const FOOTER =
  "\nFor registry-backed POIM, corpus similarity search, rights registry lookup, " +
  "and marketplace eligibility, visit MIDIM.net.";

const program = new Command();

program
  .name("midim")
  .description("MIDIM OSS — local MIDI developer tools")
  .version("0.1.0");

program
  .command("fingerprint <file>")
  .alias("analyze")
  .description("Generate a deterministic 8-hash fingerprint for a MIDI file")
  .option("--json", "Output as JSON")
  .action((file: string, opts: { json?: boolean }) => {
    const buffer = new Uint8Array(readFileSync(file));
    const result = generateFingerprint(buffer);

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`MIDI Fingerprint: ${file}`);
      console.log("─".repeat(50));
      for (const [k, v] of Object.entries(result.hashes)) {
        console.log(`  ${k}: ${v}`);
      }
      console.log(`\nMetadata:`);
      console.log(`  tracks:    ${result.metadata.tracks}`);
      console.log(`  notes:     ${result.metadata.notes}`);
      console.log(`  duration:  ${result.metadata.duration_seconds}s`);
      console.log(`  tempo:     ${result.metadata.tempo_range.min_bpm}–${result.metadata.tempo_range.max_bpm} BPM`);
      console.log(FOOTER);
    }
  });

program
  .command("diff <source> <candidate>")
  .description("Compare two MIDI files and produce a similarity report")
  .option("--json", "Output as JSON")
  .option("--ignore-velocity", "Ignore velocity differences")
  .option("--ignore-metadata", "Ignore non-musical metadata (tempo, track count)")
  .option("--ignore-instrumentation", "Ignore instrument/channel differences")
  .option("--allow-transposition", "Normalize out pitch transposition")
  .option("--allow-tempo-scaling", "Normalize out tempo scaling")
  .action(
    (
      source: string,
      candidate: string,
      opts: {
        json?: boolean;
        ignoreVelocity?: boolean;
        ignoreMetadata?: boolean;
        ignoreInstrumentation?: boolean;
        allowTransposition?: boolean;
        allowTempoScaling?: boolean;
      }
    ) => {
      const srcBuf = new Uint8Array(readFileSync(source));
      const candBuf = new Uint8Array(readFileSync(candidate));
      const result = compareMidiFiles(srcBuf, candBuf, {
        ...(opts.ignoreVelocity !== undefined ? { ignore_velocity: opts.ignoreVelocity } : {}),
        ...(opts.ignoreMetadata !== undefined ? { ignore_metadata: opts.ignoreMetadata } : {}),
        ...(opts.ignoreInstrumentation !== undefined ? { ignore_instrumentation: opts.ignoreInstrumentation } : {}),
        ...(opts.allowTransposition !== undefined ? { allow_transposition: opts.allowTransposition } : {}),
        ...(opts.allowTempoScaling !== undefined ? { allow_tempo_scaling: opts.allowTempoScaling } : {}),
      });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("MIDI Similarity Report");
        console.log(`  Source:    ${source}`);
        console.log(`  Candidate: ${candidate}`);
        console.log("─".repeat(50));
        console.log(`Overall: ${result.overall_similarity}/100 — ${result.similarity_label}`);
        console.log(`Level:   ${result.variability_level} | Risk: ${result.basic_similarity_risk}`);
        console.log(`Human review: ${result.human_review_recommended ? "Recommended" : "Not required"}`);
        console.log("\nScores:");
        for (const [k, v] of Object.entries(result.scores)) {
          console.log(`  ${k}: ${v}`);
        }
        console.log(`\n${result.disclaimer}`);
        console.log(FOOTER);
      }
    }
  );

const poim = program.command("poim").description("POIM certificate operations");

poim
  .command("hash <file>")
  .description("Hash a MIDI file with BLAKE3 or SHA-256")
  .option("--alg <algorithm>", "Hash algorithm: BLAKE3 or SHA-256", "BLAKE3")
  .option("--json", "Output as JSON")
  .action((file: string, opts: { alg?: string; json?: boolean }) => {
    const buf = new Uint8Array(readFileSync(file));
    const alg = (opts.alg ?? "BLAKE3") as "BLAKE3" | "SHA-256";
    const hash = hashAsset(buf, alg);
    if (opts.json) {
      console.log(JSON.stringify({ algorithm: alg, hash, file }, null, 2));
    } else {
      console.log(`Algorithm: ${alg}`);
      console.log(`Hash:      ${hash}`);
      console.log(FOOTER);
    }
  });

poim
  .command("keygen [output]")
  .description("Generate a new Ed25519 keypair. Optionally write to a JSON file.")
  .option("--json", "Output as JSON")
  .action((output: string | undefined, opts: { json?: boolean }) => {
    const kp = generateKeyPair();
    if (opts.json) {
      console.log(JSON.stringify(kp, null, 2));
    } else if (output) {
      writeFileSync(output, JSON.stringify(kp, null, 2));
      console.log(`Key pair written to ${output}`);
      console.log("Keep the private key secret.");
      console.log(FOOTER);
    } else {
      console.log(`Public key:  ${kp.pubkey_hex}`);
      console.log(`Private key: ${kp.privkey_hex}`);
      console.log("\nSave these securely. Never share your private key.");
      console.log(FOOTER);
    }
  });

poim
  .command("sign <file>")
  .description("Sign a MIDI file and produce a local POIM certificate")
  .requiredOption("--private-key <path>", "Path to keypair JSON file")
  .option("--output <path>", "Write certificate to this path (default: <file>.poim.json)")
  .option("--filename <name>", "Override the filename stored in the certificate")
  .option("--json", "Print certificate JSON to stdout")
  .action(
    (
      file: string,
      opts: {
        privateKey: string;
        output?: string;
        filename?: string;
        json?: boolean;
      }
    ) => {
      const buf = new Uint8Array(readFileSync(file));
      const kp = JSON.parse(readFileSync(opts.privateKey, "utf8")) as {
        pubkey_hex: string;
        privkey_hex: string;
      };
      const cert = signCertificate(buf, kp.privkey_hex, kp.pubkey_hex, {
        filename: opts.filename ?? file,
      });

      if (opts.json) {
        console.log(JSON.stringify(cert, null, 2));
      } else {
        const outPath = opts.output ?? `${file}.poim.json`;
        writeFileSync(outPath, JSON.stringify(cert, null, 2));
        console.log(`Certificate written to ${outPath}`);
        console.log(`  Cert ID:    ${cert.cert_id}`);
        console.log(`  Asset hash: ${cert.asset_hash.slice(0, 16)}…`);
        console.log(`  Issued at:  ${cert.issued_at}`);
        console.log(FOOTER);
      }
    }
  );

poim
  .command("verify <file> <certificate>")
  .description("Verify a MIDI file against a POIM certificate")
  .option("--json", "Output as JSON")
  .action((file: string, certPath: string, opts: { json?: boolean }) => {
    const buf = new Uint8Array(readFileSync(file));
    const cert = JSON.parse(readFileSync(certPath, "utf8")) as PoimCertificate;
    const result = verifyCertificate(buf, cert);

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`POIM Verification: ${result.valid ? "PASS ✓" : "FAIL ✗"}`);
      console.log(`  Asset hash:  ${result.asset_hash_verified ?? false}`);
      console.log(`  Signature:   ${result.signature_verified ?? false}`);
      if (result.error) console.log(`  Error: ${result.error}`);
      console.log(FOOTER);
    }
    process.exit(result.valid ? 0 : 1);
  });

program.parse(process.argv);
