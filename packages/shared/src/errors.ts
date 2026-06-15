export class MidiParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "MidiParseError";
  }
}

export class HashError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "HashError";
  }
}

export class PoimError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PoimError";
  }
}
