import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const nobleBase = resolve(
  __dirname,
  "../../node_modules/.pnpm/@noble+curves@2.2.0/node_modules/@noble/curves"
);
const nobleHashesBase = resolve(
  __dirname,
  "../../node_modules/.pnpm/@noble+hashes@2.2.0/node_modules/@noble/hashes"
);

export default defineConfig({
  resolve: {
    alias: {
      "@midim/shared": resolve(__dirname, "../shared/src/index.ts"),
      "@noble/curves/ed25519.js": resolve(nobleBase, "ed25519.js"),
      "@noble/curves/ed25519": resolve(nobleBase, "ed25519.js"),
      "@noble/hashes/utils.js": resolve(nobleHashesBase, "utils.js"),
      "@noble/hashes/utils": resolve(nobleHashesBase, "utils.js"),
      "@noble/hashes/blake3.js": resolve(nobleHashesBase, "blake3.js"),
      "@noble/hashes/blake3": resolve(nobleHashesBase, "blake3.js"),
      "@noble/hashes/sha2.js": resolve(nobleHashesBase, "sha2.js"),
      "@noble/hashes/sha2": resolve(nobleHashesBase, "sha2.js"),
    },
    conditions: ["node", "import", "module", "default"],
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    pool: "forks",
    server: {
      deps: {
        inline: ["json-canonicalize"],
      },
    },
  },
});
