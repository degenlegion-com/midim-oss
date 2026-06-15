import { describe, it, expect } from "vitest";
import { generateFingerprint } from "../fingerprint.js";
import {
  buildScaleMidi,
  buildSyntheticMidi,
  buildMultiTrackMidi,
  SCALE_NOTES_C_MAJOR,
  buildTransposedMidi,
} from "@midim/shared";

describe("generateFingerprint", () => {
  it("produces 8 hashes for a simple MIDI", () => {
    const buf = buildScaleMidi(60, 8);
    const result = generateFingerprint(buf);
    expect(Object.keys(result.hashes)).toHaveLength(8);
    expect(result.hashes.raw_file_hash_blake3).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.raw_file_hash_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.normalized_midi_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.note_sequence_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.rhythm_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.pitch_class_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.basic_chord_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.hashes.basic_repeated_phrase_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same buffer produces same fingerprint", () => {
    const buf = buildScaleMidi(60, 8);
    const r1 = generateFingerprint(buf);
    const r2 = generateFingerprint(buf);
    expect(r1.hashes).toEqual(r2.hashes);
  });

  it("raw hashes differ for different files", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildScaleMidi(62, 8);
    const r1 = generateFingerprint(buf1);
    const r2 = generateFingerprint(buf2);
    expect(r1.hashes.raw_file_hash_blake3).not.toEqual(r2.hashes.raw_file_hash_blake3);
    expect(r1.hashes.note_sequence_hash).not.toEqual(r2.hashes.note_sequence_hash);
  });

  it("metadata tracks the correct counts", () => {
    const buf = buildMultiTrackMidi();
    const result = generateFingerprint(buf);
    expect(result.metadata.tracks).toBe(2);
    expect(result.metadata.notes).toBeGreaterThan(0);
    expect(result.metadata.duration_seconds).toBeGreaterThan(0);
    expect(result.fingerprint_version).toBe("1.0");
  });

  it("pitch_class_hash same for transposed melody by 12 semitones (octave)", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildScaleMidi(72, 8);
    const r1 = generateFingerprint(buf1);
    const r2 = generateFingerprint(buf2);
    expect(r1.hashes.pitch_class_hash).toEqual(r2.hashes.pitch_class_hash);
  });

  it("note_sequence_hash differs for different pitch contours", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildTransposedMidi(SCALE_NOTES_C_MAJOR, 5);
    const r1 = generateFingerprint(buf1);
    const r2 = generateFingerprint(buf2);
    expect(r1.hashes.note_sequence_hash).not.toEqual(r2.hashes.note_sequence_hash);
  });

  it("velocity-only changes do not affect note_sequence_hash", () => {
    const notes = SCALE_NOTES_C_MAJOR.map((n) => ({ ...n, velocity: 80 }));
    const notesSoft = SCALE_NOTES_C_MAJOR.map((n) => ({ ...n, velocity: 30 }));
    const buf1 = buildSyntheticMidi([{ notes }]);
    const buf2 = buildSyntheticMidi([{ notes: notesSoft }]);
    const r1 = generateFingerprint(buf1);
    const r2 = generateFingerprint(buf2);
    expect(r1.hashes.note_sequence_hash).toEqual(r2.hashes.note_sequence_hash);
  });
});
