import { parseMidi, normalizeNotes, type DiffResult, type DiffOptions } from "@midim/shared";
import {
  scoreNoteSequence,
  scoreRhythm,
  scorePitchClass,
  scoreTempo,
  scoreStructure,
  scoreMelodicContour,
  scoreHarmonic,
  scoreDynamic,
  scoreInstrumentation,
} from "./scores.js";
import type {
  VariabilityLevel,
  SimilarityLabel,
  SimilarityRisk,
} from "@midim/shared";

export const DIFF_DISCLAIMER =
  "DISCLAIMER: This tool provides local mathematical similarity scores only. " +
  "It does not determine copyright ownership, infringement, or marketplace eligibility. " +
  "Similarity scores are not legal opinions. Consult a qualified attorney for rights questions. " +
  "For registry-backed POIM, corpus similarity search, and rights registry lookup, visit MIDIM.net.";

function deriveVariabilityLevel(overall: number): VariabilityLevel {
  if (overall >= 98) return "V0";
  if (overall >= 90) return "V1";
  if (overall >= 80) return "V2";
  if (overall >= 70) return "V3";
  if (overall >= 60) return "V4";
  if (overall >= 50) return "V5";
  if (overall >= 40) return "V6";
  if (overall >= 30) return "V7";
  if (overall >= 20) return "V8";
  return "V9";
}

function deriveSimilarityLabel(overall: number): SimilarityLabel {
  if (overall >= 98) return "IDENTICAL";
  if (overall >= 90) return "NEAR_IDENTICAL";
  if (overall >= 75) return "HIGHLY_SIMILAR";
  if (overall >= 60) return "SIMILAR";
  if (overall >= 40) return "MODERATELY_SIMILAR";
  if (overall >= 20) return "LOW_SIMILARITY";
  return "DIFFERENT";
}

function deriveSimilarityRisk(
  overall: number,
  label: SimilarityLabel
): SimilarityRisk {
  if (label === "IDENTICAL" || label === "NEAR_IDENTICAL") return "HIGH";
  if (label === "HIGHLY_SIMILAR") return "MEDIUM";
  if (label === "SIMILAR" && overall >= 65) return "LOW";
  if (label === "SIMILAR") return "LOW";
  return "NONE";
}

export function compareMidiFiles(
  sourceBuffer: Uint8Array | Buffer,
  candidateBuffer: Uint8Array | Buffer,
  options: DiffOptions = {}
): DiffResult {
  const srcBytes =
    sourceBuffer instanceof Uint8Array
      ? sourceBuffer
      : new Uint8Array(sourceBuffer as Buffer);
  const candBytes =
    candidateBuffer instanceof Uint8Array
      ? candidateBuffer
      : new Uint8Array(candidateBuffer as Buffer);

  const srcParsed = parseMidi(srcBytes);
  const candParsed = parseMidi(candBytes);

  const ignoreVelocity = options.ignore_velocity ?? false;
  const ignoreInstrumentation = options.ignore_instrumentation ?? false;
  const ignoreMetadata = options.ignore_metadata ?? false;
  const allowTransposition = options.allow_transposition ?? false;
  const allowTempoScaling = options.allow_tempo_scaling ?? false;

  const srcNotes = normalizeNotes(srcParsed.allNotes, {
    ignoreVelocity,
    ignoreInstrumentation,
    allowTransposition,
  });
  const candNotes = normalizeNotes(candParsed.allNotes, {
    ignoreVelocity,
    ignoreInstrumentation,
    allowTransposition,
  });

  const noteSeqScore = scoreNoteSequence(srcNotes, candNotes, allowTransposition);
  const rhythmScore = scoreRhythm(srcNotes, candNotes);
  const pitchClassScore = scorePitchClass(srcNotes, candNotes);
  const tempoScore = ignoreMetadata
    ? 100
    : scoreTempo(srcParsed.tempos, candParsed.tempos, allowTempoScaling);
  const structureScore = scoreStructure(srcParsed, candParsed, ignoreMetadata);
  const melodicContourScore = scoreMelodicContour(srcNotes, candNotes);
  const harmonicScore = scoreHarmonic(srcNotes, candNotes);
  const dynamicScore = scoreDynamic(
    ignoreVelocity ? [] : srcParsed.allNotes,
    ignoreVelocity ? [] : candParsed.allNotes
  );
  const instrumentationScore = scoreInstrumentation(
    srcParsed.tracks,
    candParsed.tracks,
    ignoreInstrumentation
  );

  const scores = {
    note_sequence_similarity: noteSeqScore,
    rhythm_similarity: rhythmScore,
    pitch_class_similarity: pitchClassScore,
    tempo_similarity: tempoScore,
    structure_similarity: structureScore,
    melodic_contour_similarity: melodicContourScore,
    harmonic_similarity: harmonicScore,
    dynamic_similarity: ignoreVelocity ? 100 : dynamicScore,
    instrumentation_similarity: instrumentationScore,
  };

  const weights = {
    note_sequence_similarity: 0.25,
    rhythm_similarity: 0.15,
    pitch_class_similarity: 0.1,
    tempo_similarity: 0.05,
    structure_similarity: 0.1,
    melodic_contour_similarity: 0.15,
    harmonic_similarity: 0.1,
    dynamic_similarity: 0.05,
    instrumentation_similarity: 0.05,
  };

  let overallSim = 0;
  for (const [key, weight] of Object.entries(weights)) {
    overallSim += (scores[key as keyof typeof scores] ?? 0) * weight;
  }
  const overall = Math.round(overallSim);

  const variabilityLevel = deriveVariabilityLevel(overall);
  const similarityLabel = deriveSimilarityLabel(overall);
  const basicSimilarityRisk = deriveSimilarityRisk(overall, similarityLabel);
  const humanReviewRecommended = overall >= 60;

  return {
    scores,
    overall_similarity: overall,
    variability_level: variabilityLevel,
    similarity_label: similarityLabel,
    human_review_recommended: humanReviewRecommended,
    basic_similarity_risk: basicSimilarityRisk,
    options_applied: options,
    disclaimer: DIFF_DISCLAIMER,
  };
}
