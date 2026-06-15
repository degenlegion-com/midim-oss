import { describe, it, expect } from "vitest";
import {
  hashBlake3,
  hashSha256,
  canonicalJson,
  canonicalJsonExcluding,
  parseMidi,
  buildScaleMidi,
  buildSyntheticMidi,
  buildEmptyMidi,
  SCALE_NOTES_C_MAJOR,
} from "../index.js";

describe("hash helpers", () => {
  it("hashBlake3 produces 64-hex-char string", () => {
    const bytes = new TextEncoder().encode("hello midi");
    expect(hashBlake3(bytes)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashSha256 produces 64-hex-char string", () => {
    const bytes = new TextEncoder().encode("hello midi");
    expect(hashSha256(bytes)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("BLAKE3 and SHA-256 produce different hashes", () => {
    const bytes = new TextEncoder().encode("same input");
    expect(hashBlake3(bytes)).not.toEqual(hashSha256(bytes));
  });
});

describe("canonical JSON", () => {
  it("sorts keys alphabetically", () => {
    expect(canonicalJson({ z: 1, a: 2 })).toBe('{"a":2,"z":1}');
  });

  it("canonicalJsonExcluding removes specified keys", () => {
    const result = canonicalJsonExcluding(
      { a: 1, signature: "sig", b: 2 },
      ["signature"]
    );
    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(parsed["signature"]).toBeUndefined();
    expect(parsed["a"]).toBe(1);
  });
});

describe("MIDI parsing", () => {
  it("parses synthetic MIDI and returns allNotes", () => {
    const buf = buildScaleMidi(60, 8);
    const parsed = parseMidi(buf);
    expect(parsed.allNotes.length).toBe(8);
    expect(parsed.tracks.length).toBeGreaterThan(0);
    expect(parsed.durationSeconds).toBeGreaterThan(0);
  });

  it("allNotes are sorted by startTick", () => {
    const buf = buildScaleMidi(60, 8);
    const parsed = parseMidi(buf);
    for (let i = 1; i < parsed.allNotes.length; i++) {
      expect(parsed.allNotes[i]!.startTick).toBeGreaterThanOrEqual(
        parsed.allNotes[i - 1]!.startTick
      );
    }
  });

  it("empty MIDI parses without error", () => {
    const buf = buildEmptyMidi();
    const parsed = parseMidi(buf);
    expect(parsed.allNotes.length).toBe(0);
  });

  it("notes contain correct pitch values for C-major scale", () => {
    const buf = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR }]);
    const parsed = parseMidi(buf);
    const pitches = parsed.allNotes.map((n) => n.pitch);
    expect(pitches).toContain(60);
    expect(pitches).toContain(67);
  });
});
