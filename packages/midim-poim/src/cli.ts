#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { generateKeyPair, hashAsset } from "./crypto.js";
import { signCertificate, verifyCertificate } from "./certificate.js";
import type { PoimCertificate } from "@midim/shared";

const FOOTER =
  "\nFor registry-backed POIM, corpus similarity search, rights registry lookup, " +
  "and marketplace eligibility, visit MIDIM.net.";

function main(): void {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (!subcommand) {
    console.log("Usage: midim-poim <hash|keygen|sign|verify> [options]");
    process.exit(1);
  }

  switch (subcommand) {
    case "hash": {
      const filePath = args[1];
      if (!filePath) {
        console.error("Usage: midim-poim hash <file.mid> [--alg BLAKE3|SHA-256]");
        process.exit(1);
      }
      const alg = args.includes("--alg") ? args[args.indexOf("--alg") + 1] : "BLAKE3";
      const buf = new Uint8Array(readFileSync(filePath));
      const hash = hashAsset(buf, (alg as "BLAKE3" | "SHA-256") ?? "BLAKE3");
      if (args.includes("--json")) {
        console.log(JSON.stringify({ algorithm: alg, hash, file: filePath }, null, 2));
      } else {
        console.log(`Algorithm: ${alg}`);
        console.log(`Hash:      ${hash}`);
        console.log(FOOTER);
      }
      break;
    }

    case "keygen": {
      const keypair = generateKeyPair();
      if (args.includes("--json")) {
        console.log(JSON.stringify(keypair, null, 2));
      } else {
        const outFile = args[1];
        if (outFile) {
          writeFileSync(outFile, JSON.stringify(keypair, null, 2));
          console.log(`Key pair written to ${outFile}`);
        } else {
          console.log(`Public key:  ${keypair.pubkey_hex}`);
          console.log(`Private key: ${keypair.privkey_hex}`);
          console.log("\nSave these securely. Never share the private key.");
        }
        console.log(FOOTER);
      }
      break;
    }

    case "sign": {
      const fileArg = args.find((a, i) => i > 0 && !a.startsWith("--") && args[i - 1] !== "--private-key");
      const pkIdx = args.indexOf("--private-key");
      const keyPath = pkIdx !== -1 ? args[pkIdx + 1] : undefined;

      if (!fileArg || !keyPath) {
        console.error("Usage: midim-poim sign <file.mid> --private-key <key.json> [--json]");
        process.exit(1);
      }

      const buf = new Uint8Array(readFileSync(fileArg));
      const keyJson = JSON.parse(readFileSync(keyPath, "utf8")) as {
        pubkey_hex: string;
        privkey_hex: string;
      };

      const cert = signCertificate(buf, keyJson.privkey_hex, keyJson.pubkey_hex, {
        filename: fileArg,
      });

      if (args.includes("--json")) {
        console.log(JSON.stringify(cert, null, 2));
      } else {
        const outCertPath = `${fileArg}.poim.json`;
        writeFileSync(outCertPath, JSON.stringify(cert, null, 2));
        console.log(`Certificate written to ${outCertPath}`);
        console.log(`  Asset hash: ${cert.asset_hash.slice(0, 16)}…`);
        console.log(`  Cert ID:    ${cert.cert_id}`);
        console.log(`  Issued at:  ${cert.issued_at}`);
        console.log(FOOTER);
      }
      break;
    }

    case "verify": {
      const files = args.slice(1).filter((a) => !a.startsWith("--"));
      const [midiPath, certPath] = files;

      if (!midiPath || !certPath) {
        console.error("Usage: midim-poim verify <file.mid> <certificate.json> [--json]");
        process.exit(1);
      }

      const buf = new Uint8Array(readFileSync(midiPath));
      const cert = JSON.parse(readFileSync(certPath, "utf8")) as PoimCertificate;
      const result = verifyCertificate(buf, cert);

      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`POIM Verification: ${result.valid ? "PASS ✓" : "FAIL ✗"}`);
        console.log(`  Asset hash verified: ${result.asset_hash_verified ?? false}`);
        console.log(`  Signature verified:  ${result.signature_verified ?? false}`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
        console.log(FOOTER);
      }
      process.exit(result.valid ? 0 : 1);
      break;
    }

    default: {
      console.error(`Unknown subcommand: ${subcommand}`);
      console.log("Usage: midim-poim <hash|keygen|sign|verify> [options]");
      process.exit(1);
      break;
    }
  }
}

main();
