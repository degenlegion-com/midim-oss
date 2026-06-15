export type HashAlgorithm = "BLAKE3" | "SHA-256";

export interface MidiNote {
  pitch: number;
  startTick: number;
  durationTicks: number;
  velocity: number;
  channel: number;
  trackIndex: number;
}

export interface MidiTrack {
  name: string;
  instrument: number;
  channel: number;
  notes: MidiNote[];
}

export interface ParsedMidi {
  tracks: MidiTrack[];
  allNotes: MidiNote[];
  tempos: number[];
  durationSeconds: number;
  ticksPerBeat: number;
  timeSignatures: Array<{ numerator: number; denominator: number; ticks: number }>;
}

export interface FingerprintHashes {
  raw_file_hash_blake3: string;
  raw_file_hash_sha256: string;
  normalized_midi_hash: string;
  note_sequence_hash: string;
  rhythm_hash: string;
  pitch_class_hash: string;
  basic_chord_hash: string;
  basic_repeated_phrase_hash: string;
}

export interface FingerprintMetadata {
  tracks: number;
  notes: number;
  duration_seconds: number;
  instruments: number[];
  tempo_range: { min_bpm: number; max_bpm: number };
}

export interface FingerprintResult {
  hashes: FingerprintHashes;
  metadata: FingerprintMetadata;
  fingerprint_version: string;
}

export interface SimilarityScores {
  note_sequence_similarity: number;
  rhythm_similarity: number;
  pitch_class_similarity: number;
  tempo_similarity: number;
  structure_similarity: number;
  melodic_contour_similarity: number;
  harmonic_similarity: number;
  dynamic_similarity: number;
  instrumentation_similarity: number;
}

export type VariabilityLevel =
  | "V0"
  | "V1"
  | "V2"
  | "V3"
  | "V4"
  | "V5"
  | "V6"
  | "V7"
  | "V8"
  | "V9";

export type SimilarityLabel =
  | "IDENTICAL"
  | "NEAR_IDENTICAL"
  | "HIGHLY_SIMILAR"
  | "SIMILAR"
  | "MODERATELY_SIMILAR"
  | "LOW_SIMILARITY"
  | "DIFFERENT";

export type SimilarityRisk = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export interface DiffOptions {
  ignore_metadata?: boolean;
  ignore_velocity?: boolean;
  ignore_instrumentation?: boolean;
  allow_transposition?: boolean;
  allow_tempo_scaling?: boolean;
}

export interface DiffResult {
  scores: SimilarityScores;
  overall_similarity: number;
  variability_level: VariabilityLevel;
  similarity_label: SimilarityLabel;
  human_review_recommended: boolean;
  basic_similarity_risk: SimilarityRisk;
  options_applied: DiffOptions;
  disclaimer: string;
}

export interface PoimKeyPair {
  pubkey_hex: string;
  privkey_hex: string;
}

export interface PoimSourceWork {
  title?: string | null;
  composer?: string | null;
  source_url?: string | null;
}

export interface PoimRightsStatement {
  statement: string;
  license?: string | null;
}

export interface PoimCertificateMetadata {
  filename?: string;
  source_work?: PoimSourceWork;
  rights_statement?: PoimRightsStatement;
  creator_pubkey_ed25519?: string;
}

export interface PoimCertificate {
  poim_version: string;
  certificate_type: "local_self_signed";
  cert_id: string;
  asset_type: string;
  asset_hash_alg: "BLAKE3";
  asset_hash: string;
  asset_filename: string | null;
  creator_pubkey_ed25519: string | null;
  issuer_pubkey_ed25519: string;
  source_work: PoimSourceWork | null;
  rights_statement: PoimRightsStatement;
  issued_at: string;
  signature_alg: "Ed25519";
  signature: string;
  disclaimer: string;
}

export interface PoimVerifyResult {
  valid: boolean;
  error?: string;
  asset_hash_verified?: boolean;
  signature_verified?: boolean;
}
