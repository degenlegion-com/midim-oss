import {
  parseMidi,
  hashBlake3,
  hashSha256,
  hashString,
  canonicalJson,
  getMidiInstruments,
  type FingerprintResult,
  type MidiNote,
} from "@midim/shared";

export interface FingerprintOptions {
  phraseWindowTicks?: number;
}

function computeNormalizedMidiHash(notes: MidiNote[]): string {
  const normalized = [...notes]
    .sort((a, b) => a.startTick - b.startTick || a.pitch - b.pitch)
    .map((n) => ({
      p: n.pitch,
      s: n.startTick,
      d: n.durationTicks,
      v: n.velocity,
      c: n.channel,
      t: n.trackIndex,
    }));
  return hashString(canonicalJson(normalized));
}

function computeNoteSequenceHash(notes: MidiNote[]): string {
  const pitches = [...notes]
    .sort((a, b) => a.startTick - b.startTick || a.pitch - b.pitch)
    .map((n) => n.pitch);
  return hashString(JSON.stringify(pitches));
}

function computeRhythmHash(notes: MidiNote[]): string {
  if (notes.length === 0) return hashString("empty");
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  const firstTick = sorted[0]!.startTick;
  const durations = sorted.map((n) => ({
    offset: n.startTick - firstTick,
    dur: n.durationTicks,
  }));
  return hashString(JSON.stringify(durations));
}

function computePitchClassHash(notes: MidiNote[]): string {
  const classCounts = new Array<number>(12).fill(0);
  for (const note of notes) {
    classCounts[note.pitch % 12]!++;
  }
  return hashString(JSON.stringify(classCounts));
}

function computeBasicChordHash(notes: MidiNote[], tickWindow = 10): string {
  if (notes.length === 0) return hashString("empty");
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  const chords: number[][] = [];
  let currentChordStart = sorted[0]!.startTick;
  let currentChord: number[] = [];

  for (const note of sorted) {
    if (note.startTick - currentChordStart <= tickWindow) {
      currentChord.push(note.pitch % 12);
    } else {
      if (currentChord.length > 0) {
        chords.push([...new Set(currentChord)].sort((a, b) => a - b));
      }
      currentChordStart = note.startTick;
      currentChord = [note.pitch % 12];
    }
  }
  if (currentChord.length > 0) {
    chords.push([...new Set(currentChord)].sort((a, b) => a - b));
  }
  return hashString(JSON.stringify(chords));
}

function computeBasicRepeatedPhraseHash(
  notes: MidiNote[],
  phraseWindowTicks = 1920
): string {
  if (notes.length < 4) return hashString("short");
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  const phraseMap = new Map<string, number>();
  const phraseCounts: Array<[string, number]> = [];

  let windowStart = 0;
  while (windowStart < sorted.length) {
    const startTick = sorted[windowStart]!.startTick;
    const windowNotes = sorted
      .slice(windowStart)
      .filter((n) => n.startTick - startTick < phraseWindowTicks);

    if (windowNotes.length < 2) break;

    const phrase = windowNotes.map((n) => n.pitch).join(",");
    const count = (phraseMap.get(phrase) ?? 0) + 1;
    phraseMap.set(phrase, count);

    windowStart += Math.max(1, Math.floor(windowNotes.length / 2));
  }

  for (const [phrase, count] of phraseMap.entries()) {
    if (count > 1) phraseCounts.push([phrase, count]);
  }

  phraseCounts.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return hashString(JSON.stringify(phraseCounts.slice(0, 20)));
}

export function generateFingerprint(
  buffer: Uint8Array | Buffer,
  options: FingerprintOptions = {}
): FingerprintResult {
  const phraseWindowTicks = options.phraseWindowTicks ?? 1920;

  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as Buffer);

  const parsed = parseMidi(bytes);
  const { allNotes, tracks, tempos, durationSeconds } = parsed;

  const rawFileHashBlake3 = hashBlake3(bytes);
  const rawFileHashSha256 = hashSha256(bytes);
  const normalizedMidiHash = computeNormalizedMidiHash(allNotes);
  const noteSequenceHash = computeNoteSequenceHash(allNotes);
  const rhythmHash = computeRhythmHash(allNotes);
  const pitchClassHash = computePitchClassHash(allNotes);
  const basicChordHash = computeBasicChordHash(allNotes);
  const basicRepeatedPhraseHash = computeBasicRepeatedPhraseHash(
    allNotes,
    phraseWindowTicks
  );

  const instruments = getMidiInstruments(tracks);
  const bpms = tempos.map((us) => Math.round(60_000_000 / us));

  return {
    hashes: {
      raw_file_hash_blake3: rawFileHashBlake3,
      raw_file_hash_sha256: rawFileHashSha256,
      normalized_midi_hash: normalizedMidiHash,
      note_sequence_hash: noteSequenceHash,
      rhythm_hash: rhythmHash,
      pitch_class_hash: pitchClassHash,
      basic_chord_hash: basicChordHash,
      basic_repeated_phrase_hash: basicRepeatedPhraseHash,
    },
    metadata: {
      tracks: tracks.length,
      notes: allNotes.length,
      duration_seconds: Math.round(durationSeconds * 100) / 100,
      instruments,
      tempo_range: {
        min_bpm: bpms.length > 0 ? Math.min(...bpms) : 120,
        max_bpm: bpms.length > 0 ? Math.max(...bpms) : 120,
      },
    },
    fingerprint_version: "1.0",
  };
}
