import { describe, it, expect } from "vitest";
import { compareMidiFiles } from "../diff.js";
import {
  buildScaleMidi,
  buildSyntheticMidi,
  buildMultiTrackMidi,
  buildTransposedMidi,
  SCALE_NOTES_C_MAJOR,
  SCALE_NOTES_D_MAJOR,
  buildChordMidi,
} from "@midim/shared";

describe("compareMidiFiles", () => {
  it("exact copy scores near 100", () => {
    const buf = buildScaleMidi(60, 8);
    const result = compareMidiFiles(buf, buf);
    expect(result.overall_similarity).toBeGreaterThanOrEqual(95);
    expect(result.similarity_label).toBe("IDENTICAL");
    expect(result.variability_level).toBe("V0");
    expect(result.basic_similarity_risk).toBe("HIGH");
  });

  it("metadata-only change: same notes, different tempo", () => {
    const buf1 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 120 }]);
    const buf2 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 240 }]);
    const result = compareMidiFiles(buf1, buf2);
    expect(result.scores.note_sequence_similarity).toBeGreaterThanOrEqual(90);
  });

  it("tempo-only change with allow_tempo_scaling gives high score", () => {
    const buf1 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 120 }]);
    const buf2 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 180 }]);
    const result = compareMidiFiles(buf1, buf2, { allow_tempo_scaling: true });
    expect(result.scores.tempo_similarity).toBe(100);
  });

  it("ignore_metadata: tempo_similarity is 100 regardless of tempo difference", () => {
    const buf1 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 60 }]);
    const buf2 = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR, tempo: 240 }]);
    const withoutFlag = compareMidiFiles(buf1, buf2);
    const withFlag = compareMidiFiles(buf1, buf2, { ignore_metadata: true });
    expect(withFlag.scores.tempo_similarity).toBe(100);
    expect(withoutFlag.scores.tempo_similarity).toBeLessThan(100);
    expect(withFlag.scores.note_sequence_similarity).toBeGreaterThanOrEqual(90);
  });

  it("ignore_metadata: options_applied reflects ignore_metadata: true", () => {
    const buf = buildSyntheticMidi([{ notes: SCALE_NOTES_C_MAJOR }]);
    const result = compareMidiFiles(buf, buf, { ignore_metadata: true });
    expect(result.options_applied.ignore_metadata).toBe(true);
    expect(result.scores.tempo_similarity).toBe(100);
  });

  it("velocity-only change with ignore_velocity gives high note_sequence score", () => {
    const loud = SCALE_NOTES_C_MAJOR.map((n) => ({ ...n, velocity: 120 }));
    const soft = SCALE_NOTES_C_MAJOR.map((n) => ({ ...n, velocity: 20 }));
    const buf1 = buildSyntheticMidi([{ notes: loud }]);
    const buf2 = buildSyntheticMidi([{ notes: soft }]);
    const result = compareMidiFiles(buf1, buf2, { ignore_velocity: true });
    expect(result.scores.note_sequence_similarity).toBeGreaterThanOrEqual(90);
  });

  it("instrument-only change with ignore_instrumentation gives high instrumentation score", () => {
    const buf1 = buildSyntheticMidi([
      { notes: SCALE_NOTES_C_MAJOR, instrument: 0 },
    ]);
    const buf2 = buildSyntheticMidi([
      { notes: SCALE_NOTES_C_MAJOR, instrument: 40 },
    ]);
    const result = compareMidiFiles(buf1, buf2, { ignore_instrumentation: true });
    expect(result.scores.instrumentation_similarity).toBe(100);
  });

  it("transposed melody with allow_transposition scores high", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildTransposedMidi(SCALE_NOTES_C_MAJOR, 5);
    const result = compareMidiFiles(buf1, buf2, { allow_transposition: true });
    expect(result.scores.note_sequence_similarity).toBeGreaterThanOrEqual(80);
  });

  it("added track scores lower overall similarity", () => {
    const singleTrack = buildScaleMidi(60, 8);
    const multiTrack = buildMultiTrackMidi();
    const result = compareMidiFiles(singleTrack, multiTrack);
    expect(result.overall_similarity).toBeLessThan(80);
  });

  it("removed track is equivalent to added track (symmetric ish)", () => {
    const multiTrack = buildMultiTrackMidi();
    const singleTrack = buildScaleMidi(60, 8);
    const r1 = compareMidiFiles(multiTrack, singleTrack);
    const r2 = compareMidiFiles(singleTrack, multiTrack);
    expect(Math.abs(r1.overall_similarity - r2.overall_similarity)).toBeLessThan(20);
  });

  it("reordered tracks: same notes on different tracks gives high note-level similarity", () => {
    const original = buildSyntheticMidi([
      { name: "A", instrument: 0, notes: SCALE_NOTES_C_MAJOR.slice(0, 4) },
      { name: "B", instrument: 25, notes: SCALE_NOTES_C_MAJOR.slice(4, 8) },
    ]);
    const reordered = buildSyntheticMidi([
      { name: "B", instrument: 25, notes: SCALE_NOTES_C_MAJOR.slice(4, 8) },
      { name: "A", instrument: 0, notes: SCALE_NOTES_C_MAJOR.slice(0, 4) },
    ]);
    const result = compareMidiFiles(original, reordered, { ignore_instrumentation: true });
    expect(result.scores.pitch_class_similarity).toBeGreaterThan(80);
  });

  it("shared motif gives moderate similarity", () => {
    const sharedNotes = SCALE_NOTES_C_MAJOR.slice(0, 4);
    const extra1 = [{ pitch: 72, time: 2.0, duration: 0.4, velocity: 80 }];
    const extra2 = [{ pitch: 55, time: 2.0, duration: 0.4, velocity: 80 }];
    const buf1 = buildSyntheticMidi([{ notes: [...sharedNotes, ...extra1] }]);
    const buf2 = buildSyntheticMidi([{ notes: [...sharedNotes, ...extra2] }]);
    const result = compareMidiFiles(buf1, buf2);
    expect(result.overall_similarity).toBeGreaterThan(30);
  });

  it("same chord progression scores high harmony", () => {
    const chords = [[60, 64, 67], [65, 69, 72], [67, 71, 74]] as number[][];
    const buf1 = buildChordMidi(chords, 0);
    const buf2 = buildChordMidi(chords, 25);
    const result = compareMidiFiles(buf1, buf2);
    expect(result.scores.harmonic_similarity).toBeGreaterThan(60);
  });

  it("same style different notes gives moderate similarity (not identical)", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildScaleMidi(62, 8);
    const result = compareMidiFiles(buf1, buf2);
    expect(result.overall_similarity).toBeGreaterThan(20);
    expect(result.overall_similarity).toBeLessThan(100);
    expect(result.similarity_label).not.toBe("IDENTICAL");
  });

  it("completely unrelated MIDI scores low", () => {
    const buf1 = buildScaleMidi(60, 8);
    const buf2 = buildSyntheticMidi([
      {
        notes: [
          { pitch: 24, time: 0, duration: 2.0, velocity: 40 },
          { pitch: 96, time: 2.0, duration: 0.1, velocity: 127 },
        ],
      },
    ]);
    const result = compareMidiFiles(buf1, buf2);
    expect(result.overall_similarity).toBeLessThan(60);
  });

  it("result contains required disclaimer", () => {
    const buf = buildScaleMidi(60, 4);
    const result = compareMidiFiles(buf, buf);
    expect(result.disclaimer).toContain("DISCLAIMER");
    expect(result.disclaimer).toContain("MIDIM.net");
  });

  it("result does not contain forbidden terms", () => {
    const buf = buildScaleMidi(60, 4);
    const result = compareMidiFiles(buf, buf);
    const json = JSON.stringify(result);
    expect(json.toLowerCase()).not.toContain('"infringing"');
    expect(json.toLowerCase()).not.toContain('"not infringing"');
    expect(json.toLowerCase()).not.toContain("marketplace_eligible");
    expect(json.toLowerCase()).not.toContain("rights_confidence");
  });

  it("produces 9 scores", () => {
    const buf = buildScaleMidi(60, 8);
    const result = compareMidiFiles(buf, buf);
    expect(Object.keys(result.scores)).toHaveLength(9);
  });
});
