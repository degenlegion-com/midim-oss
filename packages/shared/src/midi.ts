import { Midi } from "@tonejs/midi";
import type { ParsedMidi, MidiNote, MidiTrack } from "./types.js";
import { MidiParseError } from "./errors.js";

export function parseMidi(buffer: Uint8Array | Buffer): ParsedMidi {
  try {
    const midi = new Midi(buffer);

    const allNotes: MidiNote[] = [];
    const tracks: MidiTrack[] = [];

    midi.tracks.forEach((track, trackIndex) => {
      const midiNotes: MidiNote[] = track.notes.map((note) => ({
        pitch: note.midi,
        startTick: note.ticks,
        durationTicks: note.durationTicks,
        velocity: Math.round(note.velocity * 127),
        channel: track.channel ?? 0,
        trackIndex,
      }));

      allNotes.push(...midiNotes);

      const instrument = track.instrument?.number ?? 0;

      tracks.push({
        name: track.name ?? `Track ${trackIndex}`,
        instrument,
        channel: track.channel ?? 0,
        notes: midiNotes,
      });
    });

    allNotes.sort((a, b) => {
      if (a.startTick !== b.startTick) return a.startTick - b.startTick;
      return a.pitch - b.pitch;
    });

    const tempos = midi.header.tempos.map((t) =>
      Math.round(60_000_000 / t.bpm)
    );

    const timeSignatures = midi.header.timeSignatures.map((ts) => ({
      numerator: ts.timeSignature[0] ?? 4,
      denominator: ts.timeSignature[1] ?? 4,
      ticks: ts.ticks,
    }));

    const durationSeconds = midi.duration;

    return {
      tracks,
      allNotes,
      tempos: tempos.length > 0 ? tempos : [500_000],
      durationSeconds,
      ticksPerBeat: midi.header.ppq,
      timeSignatures,
    };
  } catch (err) {
    if (err instanceof MidiParseError) throw err;
    throw new MidiParseError(
      `Failed to parse MIDI buffer: ${err instanceof Error ? err.message : String(err)}`,
      err
    );
  }
}

export function normalizeNotes(
  notes: MidiNote[],
  options: {
    ignoreVelocity?: boolean;
    ignoreInstrumentation?: boolean;
    allowTransposition?: boolean;
  } = {}
): MidiNote[] {
  let normalized = [...notes].sort((a, b) => {
    if (a.startTick !== b.startTick) return a.startTick - b.startTick;
    return a.pitch - b.pitch;
  });

  if (options.allowTransposition && normalized.length > 0) {
    const minPitch = Math.min(...normalized.map((n) => n.pitch));
    const offset = minPitch % 12;
    normalized = normalized.map((n) => ({ ...n, pitch: n.pitch - offset }));
  }

  if (options.ignoreVelocity) {
    normalized = normalized.map((n) => ({ ...n, velocity: 64 }));
  }

  if (options.ignoreInstrumentation) {
    normalized = normalized.map((n) => ({ ...n, channel: 0, trackIndex: 0 }));
  }

  return normalized;
}

export function getMidiInstruments(tracks: MidiTrack[]): number[] {
  return [...new Set(tracks.map((t) => t.instrument))].sort((a, b) => a - b);
}
