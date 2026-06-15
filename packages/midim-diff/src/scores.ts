import type { MidiNote, MidiTrack, ParsedMidi } from "@midim/shared";

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function lcs(a: number[], b: number[]): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return 0;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]! + 1
        : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}

export function scoreNoteSequence(
  srcNotes: MidiNote[],
  candNotes: MidiNote[],
  allowTransposition: boolean
): number {
  if (srcNotes.length === 0 && candNotes.length === 0) return 100;
  if (srcNotes.length === 0 || candNotes.length === 0) return 0;

  const srcPitches = srcNotes.map((n) => n.pitch);
  let candPitches = candNotes.map((n) => n.pitch);

  if (allowTransposition) {
    const srcMin = Math.min(...srcPitches);
    const candMin = Math.min(...candPitches);
    const offset = candMin - srcMin;
    candPitches = candPitches.map((p) => p - offset);
  }

  const lcsLen = lcs(srcPitches, candPitches);
  const maxLen = Math.max(srcPitches.length, candPitches.length);
  return clamp((lcsLen / maxLen) * 100);
}

export function scoreRhythm(srcNotes: MidiNote[], candNotes: MidiNote[]): number {
  if (srcNotes.length === 0 && candNotes.length === 0) return 100;
  if (srcNotes.length === 0 || candNotes.length === 0) return 0;

  const srcSorted = [...srcNotes].sort((a, b) => a.startTick - b.startTick);
  const candSorted = [...candNotes].sort((a, b) => a.startTick - b.startTick);

  const srcDurations = srcSorted.map((n) => n.durationTicks);
  const candDurations = candSorted.map((n) => n.durationTicks);

  if (srcDurations.length === 0 || candDurations.length === 0) return 0;

  const srcMax = Math.max(...srcDurations);
  const candMax = Math.max(...candDurations);
  const normSrc = srcDurations.map((d) => (srcMax > 0 ? d / srcMax : 0));
  const normCand = candDurations.map((d) => (candMax > 0 ? d / candMax : 0));

  const minLen = Math.min(normSrc.length, normCand.length);
  const maxLen = Math.max(normSrc.length, normCand.length);

  let sumDiff = 0;
  for (let i = 0; i < minLen; i++) {
    sumDiff += Math.abs(normSrc[i]! - normCand[i]!);
  }
  sumDiff += maxLen - minLen;

  const similarity = Math.max(0, 1 - sumDiff / maxLen);
  return clamp(similarity * 100);
}

export function scorePitchClass(srcNotes: MidiNote[], candNotes: MidiNote[]): number {
  const srcCounts = new Array<number>(12).fill(0);
  const candCounts = new Array<number>(12).fill(0);

  for (const n of srcNotes) srcCounts[n.pitch % 12]!++;
  for (const n of candNotes) candCounts[n.pitch % 12]!++;

  const srcTotal = srcNotes.length || 1;
  const candTotal = candNotes.length || 1;

  const srcFreq = srcCounts.map((c) => c / srcTotal);
  const candFreq = candCounts.map((c) => c / candTotal);

  let dotProduct = 0;
  let srcMag = 0;
  let candMag = 0;

  for (let i = 0; i < 12; i++) {
    dotProduct += srcFreq[i]! * candFreq[i]!;
    srcMag += srcFreq[i]! * srcFreq[i]!;
    candMag += candFreq[i]! * candFreq[i]!;
  }

  const denom = Math.sqrt(srcMag) * Math.sqrt(candMag);
  if (denom === 0) return srcNotes.length === 0 && candNotes.length === 0 ? 100 : 0;

  return clamp((dotProduct / denom) * 100);
}

export function scoreTempo(
  srcTempos: number[],
  candTempos: number[],
  allowScaling: boolean
): number {
  if (srcTempos.length === 0 || candTempos.length === 0) return 50;

  const srcAvg = srcTempos.reduce((a, b) => a + b, 0) / srcTempos.length;
  const candAvg = candTempos.reduce((a, b) => a + b, 0) / candTempos.length;

  if (allowScaling) return 100;

  const ratio = Math.min(srcAvg, candAvg) / Math.max(srcAvg, candAvg);
  return clamp(ratio * 100);
}

export function scoreStructure(
  srcParsed: ParsedMidi,
  candParsed: ParsedMidi,
  ignoreMetadata = false
): number {
  const srcNoteCount = srcParsed.allNotes.length;
  const candNoteCount = candParsed.allNotes.length;

  if (srcNoteCount === 0 && candNoteCount === 0) return 100;
  if (srcNoteCount === 0 || candNoteCount === 0) return 0;

  const noteCountRatio =
    Math.min(srcNoteCount, candNoteCount) / Math.max(srcNoteCount, candNoteCount);

  const srcDur = srcParsed.durationSeconds;
  const candDur = candParsed.durationSeconds;
  const durRatio =
    srcDur > 0 && candDur > 0
      ? Math.min(srcDur, candDur) / Math.max(srcDur, candDur)
      : 0.5;

  if (ignoreMetadata) {
    return clamp(((noteCountRatio + durRatio) / 2) * 100);
  }

  const trackRatio =
    Math.min(srcParsed.tracks.length, candParsed.tracks.length) /
    Math.max(srcParsed.tracks.length, candParsed.tracks.length);

  return clamp(((noteCountRatio + durRatio + trackRatio) / 3) * 100);
}

export function scoreMelodicContour(
  srcNotes: MidiNote[],
  candNotes: MidiNote[]
): number {
  if (srcNotes.length < 2 && candNotes.length < 2) return 100;
  if (srcNotes.length < 2 || candNotes.length < 2) return 0;

  const toContour = (notes: MidiNote[]): number[] => {
    const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i]!.pitch - sorted[i - 1]!.pitch;
      intervals.push(diff > 0 ? 1 : diff < 0 ? -1 : 0);
    }
    return intervals;
  };

  const srcContour = toContour(srcNotes);
  const candContour = toContour(candNotes);

  const lcsLen = lcs(
    srcContour.map((v) => v + 1),
    candContour.map((v) => v + 1)
  );
  const maxLen = Math.max(srcContour.length, candContour.length);
  if (maxLen === 0) return 100;
  return clamp((lcsLen / maxLen) * 100);
}

export function scoreHarmonic(srcNotes: MidiNote[], candNotes: MidiNote[]): number {
  const chordWindowTicks = 20;
  const toChordSets = (notes: MidiNote[]): Set<number>[] => {
    if (notes.length === 0) return [];
    const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
    const chords: Set<number>[] = [];
    let windowStart = sorted[0]!.startTick;
    let current = new Set<number>();

    for (const note of sorted) {
      if (note.startTick - windowStart <= chordWindowTicks) {
        current.add(note.pitch % 12);
      } else {
        if (current.size > 0) chords.push(current);
        windowStart = note.startTick;
        current = new Set<number>([note.pitch % 12]);
      }
    }
    if (current.size > 0) chords.push(current);
    return chords;
  };

  const srcChords = toChordSets(srcNotes);
  const candChords = toChordSets(candNotes);

  if (srcChords.length === 0 && candChords.length === 0) return 100;
  if (srcChords.length === 0 || candChords.length === 0) return 0;

  const minLen = Math.min(srcChords.length, candChords.length);
  let matchCount = 0;

  for (let i = 0; i < minLen; i++) {
    const src = srcChords[i]!;
    const cand = candChords[i]!;
    const intersection = new Set([...src].filter((x) => cand.has(x)));
    const union = new Set([...src, ...cand]);
    if (union.size > 0) matchCount += intersection.size / union.size;
  }

  const maxLen = Math.max(srcChords.length, candChords.length);
  return clamp((matchCount / maxLen) * 100);
}

export function scoreDynamic(srcNotes: MidiNote[], candNotes: MidiNote[]): number {
  if (srcNotes.length === 0 && candNotes.length === 0) return 100;
  if (srcNotes.length === 0 || candNotes.length === 0) return 0;

  const toBuckets = (notes: MidiNote[]): number[] => {
    const buckets = [0, 0, 0, 0];
    for (const n of notes) {
      const idx = Math.min(3, Math.floor((n.velocity / 128) * 4));
      buckets[idx]!++;
    }
    const total = notes.length;
    return buckets.map((b) => b / total);
  };

  const srcBuckets = toBuckets(srcNotes);
  const candBuckets = toBuckets(candNotes);

  let dotProduct = 0;
  let srcMag = 0;
  let candMag = 0;
  for (let i = 0; i < 4; i++) {
    dotProduct += srcBuckets[i]! * candBuckets[i]!;
    srcMag += srcBuckets[i]! * srcBuckets[i]!;
    candMag += candBuckets[i]! * candBuckets[i]!;
  }
  const denom = Math.sqrt(srcMag) * Math.sqrt(candMag);
  if (denom === 0) return 100;
  return clamp((dotProduct / denom) * 100);
}

export function scoreInstrumentation(
  srcTracks: MidiTrack[],
  candTracks: MidiTrack[],
  ignoreInstrumentation: boolean
): number {
  if (ignoreInstrumentation) return 100;

  const srcInstruments = new Set(srcTracks.map((t) => t.instrument));
  const candInstruments = new Set(candTracks.map((t) => t.instrument));

  if (srcInstruments.size === 0 && candInstruments.size === 0) return 100;

  const intersection = new Set([...srcInstruments].filter((x) => candInstruments.has(x)));
  const union = new Set([...srcInstruments, ...candInstruments]);

  return clamp((intersection.size / union.size) * 100);
}
