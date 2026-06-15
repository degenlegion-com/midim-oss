import { Midi } from "@tonejs/midi";

export interface SyntheticNote {
  pitch: number;
  time: number;
  duration: number;
  velocity?: number;
}

export interface SyntheticTrackDef {
  name?: string;
  instrument?: number;
  notes: SyntheticNote[];
  tempo?: number;
}

export function buildSyntheticMidi(
  tracks: SyntheticTrackDef[],
  options: { ppq?: number; tempo?: number } = {}
): Uint8Array {
  const ppq = options.ppq ?? 480;
  const globalTempo = options.tempo ?? tracks[0]?.tempo ?? 120;

  const midi = new Midi();
  midi.fromJSON({
    header: {
      ppq,
      tempos: [{ bpm: globalTempo, ticks: 0 }],
      timeSignatures: [{ timeSignature: [4, 4], ticks: 0 }],
      keySignatures: [],
      meta: [],
      name: "",
    },
    tracks: [],
  });

  for (const trackDef of tracks) {
    const track = midi.addTrack();
    track.name = trackDef.name ?? "Synthetic";
    if (trackDef.instrument !== undefined) {
      track.instrument.number = trackDef.instrument;
    }

    for (const note of trackDef.notes) {
      track.addNote({
        midi: note.pitch,
        time: note.time,
        duration: note.duration,
        velocity: (note.velocity ?? 80) / 127,
      });
    }
  }

  return new Uint8Array(midi.toArray());
}

export function buildScaleMidi(
  startPitch = 60,
  noteCount = 8,
  instrument = 0
): Uint8Array {
  const notes: SyntheticNote[] = Array.from({ length: noteCount }, (_, i) => ({
    pitch: startPitch + i,
    time: i * 0.5,
    duration: 0.4,
    velocity: 80,
  }));
  return buildSyntheticMidi([{ name: "Melody", instrument, notes }]);
}

export function buildChordMidi(
  chords: number[][] = [
    [60, 64, 67],
    [65, 69, 72],
    [67, 71, 74],
  ],
  instrument = 0
): Uint8Array {
  const notes: SyntheticNote[] = [];
  chords.forEach((chord, chordIdx) => {
    chord.forEach((pitch) => {
      notes.push({ pitch, time: chordIdx * 1.0, duration: 0.9, velocity: 70 });
    });
  });
  return buildSyntheticMidi([{ name: "Chords", instrument, notes }]);
}

export function buildEmptyMidi(): Uint8Array {
  return buildSyntheticMidi([{ name: "Empty", notes: [] }]);
}

export function buildSingleNoteMidi(pitch = 60, instrument = 0): Uint8Array {
  return buildSyntheticMidi([
    {
      name: "Single",
      instrument,
      notes: [{ pitch, time: 0, duration: 1.0, velocity: 80 }],
    },
  ]);
}

export function buildMultiTrackMidi(): Uint8Array {
  return buildSyntheticMidi([
    {
      name: "Piano",
      instrument: 0,
      notes: [
        { pitch: 60, time: 0, duration: 0.5 },
        { pitch: 62, time: 0.5, duration: 0.5 },
        { pitch: 64, time: 1.0, duration: 0.5 },
      ],
    },
    {
      name: "Bass",
      instrument: 32,
      notes: [
        { pitch: 36, time: 0, duration: 1.0 },
        { pitch: 38, time: 1.0, duration: 1.0 },
      ],
    },
  ]);
}

export function buildTransposedMidi(
  original: SyntheticNote[],
  semitones: number,
  instrument = 0
): Uint8Array {
  const transposed = original.map((n) => ({
    ...n,
    pitch: n.pitch + semitones,
  }));
  return buildSyntheticMidi([{ name: "Transposed", instrument, notes: transposed }]);
}

export const SCALE_NOTES_C_MAJOR: SyntheticNote[] = Array.from(
  { length: 8 },
  (_, i) => ({
    pitch: 60 + i,
    time: i * 0.5,
    duration: 0.4,
    velocity: 80,
  })
);

export const SCALE_NOTES_D_MAJOR: SyntheticNote[] = [
  62, 64, 66, 67, 69, 71, 73, 74,
].map((p, i) => ({ pitch: p, time: i * 0.5, duration: 0.4, velocity: 80 }));
