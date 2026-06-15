# Awesome MIDI AI

A curated list of public-domain MIDI resources, symbolic music datasets, MIDI AI tooling, parsing libraries, DAW/plugin resources, music provenance tools, and research papers.

Maintained by the MIDIM OSS community. PRs welcome.

---

## Contents

- [MIDI Parsing Libraries](#midi-parsing-libraries)
- [Symbolic Music Datasets](#symbolic-music-datasets)
- [MIDI AI / Music Generation](#midi-ai--music-generation)
- [Music Theory & Analysis Tools](#music-theory--analysis-tools)
- [DAW & Plugin Resources](#daw--plugin-resources)
- [Music Provenance & Rights](#music-provenance--rights)
- [Academic Papers](#academic-papers)
- [POIM & MIDIM Explainer](#poim--midim-explainer)
- [Contributing](#contributing)

---

## MIDI Parsing Libraries

| Library | Language | Notes |
|---------|----------|-------|
| [@tonejs/midi](https://github.com/Tonejs/Midi) | TypeScript | Parse/write MIDI, used in MIDIM OSS |
| [mido](https://mido.readthedocs.io/) | Python | Industry-standard Python MIDI library |
| [music21](https://web.mit.edu/music21/) | Python | Symbolic music analysis toolkit from MIT |
| [pretty_midi](https://github.com/craffel/pretty-midi) | Python | High-level MIDI analysis from Colin Raffel |
| [JFugue](http://www.jfugue.org/) | Java | Music programming for Java and JVM |
| [rtmidi](https://github.com/thestk/rtmidi) | C++ | Real-time MIDI I/O |
| [miditoolkit](https://github.com/YatingMusic/miditoolkit) | Python | MIDI toolkit with piano-roll support |
| [symusic](https://github.com/Yikai-Liao/symusic) | Python/C++ | Fast symbolic music I/O (MIDI/MusicXML) |

---

## Symbolic Music Datasets

| Dataset | Size | License | Notes |
|---------|------|---------|-------|
| [Lakh MIDI Dataset](https://colinraffel.com/projects/lmd/) | 176K files | Research | Matched to audio, widely used |
| [MAESTRO Dataset](https://magenta.tensorflow.org/datasets/maestro) | 200h piano | CC BY-NC-SA 4.0 | Piano performance with metadata |
| [MIDI-WikifoniaR](https://openslr.org/13/) | ~3K | Public domain | Classical MIDI |
| [GiantMIDI-Piano](https://github.com/bytedance/GiantMIDI-Piano) | 10k files | Research | Piano transcriptions |
| [JSB Chorales](https://github.com/czhuang/JSB-Chorales-dataset) | 382 chorales | Public domain | Bach 4-part chorales |
| [Groove MIDI Dataset](https://magenta.tensorflow.org/datasets/groove) | 13.6h drums | CC BY 4.0 | Drum performance MIDI |
| [MetaMIDI Dataset](https://zenodo.org/record/5142664) | 436k files | CC BY 4.0 | Large-scale MIDI collection |
| [Nottingham Music Database](https://ifdo.ca/~seymour/nottingham/nottingham.html) | 1000+ | Public domain | Folk and traditional tunes |
| [MusicNet](https://zenodo.org/record/5120004) | 330 compositions | CC BY 4.0 | Classical with annotations |

---

## MIDI AI / Music Generation

| Project | Framework | Notes |
|---------|-----------|-------|
| [Magenta](https://magenta.tensorflow.org/) | TensorFlow | Google's AI music toolkit |
| [Music Transformer](https://magenta.tensorflow.org/music-transformer) | TensorFlow | Long-range music generation |
| [MuseNet](https://openai.com/research/musenet) | GPT-2 based | OpenAI multi-instrument generation |
| [MusicGen](https://github.com/facebookresearch/audiocraft) | PyTorch | Meta's music generation model |
| [MusicLM](https://google-research.github.io/seanet/musiclm/examples/) | Research | Google's text-to-music |
| [Pop Music Transformer](https://github.com/YatingMusic/remi) | PyTorch | REMI representation for music |
| [MidiNet](https://github.com/RichardYang40148/MidiNet) | TensorFlow | GAN-based MIDI generation |
| [MusPy](https://salu133445.github.io/muspy/) | Python | Symbolic music toolkit for deep learning |
| [Jukebox](https://openai.com/research/jukebox) | PyTorch | OpenAI's raw audio music model |
| [MIDI-BERT](https://github.com/wazenmai/MIDI-BERT) | PyTorch | BERT pre-training on MIDI |

---

## Music Theory & Analysis Tools

| Tool | Language | Notes |
|------|----------|-------|
| [music21](https://web.mit.edu/music21/) | Python | Comprehensive theory analysis from MIT |
| [Mingus](https://github.com/bspaans/python-mingus) | Python | Music theory + MIDI playback |
| [teoria.js](https://github.com/saebekassebil/teoria) | JavaScript | Functional music theory in JS |
| [Tonal.js](https://github.com/tonaljs/tonal) | TypeScript | Music theory library for JS/TS |
| [chord-magic](https://github.com/pegasuspad/chord-magic) | JavaScript | Chord detection and naming |
| [Librosa](https://librosa.org/) | Python | Audio/music analysis (includes MIDI conversion) |

---

## DAW & Plugin Resources

| Resource | Notes |
|----------|-------|
| [JUCE](https://juce.com/) | Cross-platform C++ framework for audio plugins and DAWs |
| [CLAP](https://cleveraudio.org/) | Open plugin standard by u-he and Bitwig |
| [VST SDK (Steinberg)](https://www.steinberg.net/developers/) | VST3 plugin development |
| [LV2](https://lv2plug.in/) | Open plugin standard for Linux |
| [Web MIDI API](https://www.w3.org/TR/webmidi/) | Browser MIDI I/O specification |
| [Tone.js](https://tonejs.github.io/) | Web audio framework built on Web Audio API |
| [WebAudioFont](https://surikov.github.io/webaudiofont/) | Sample-based MIDI playback in browsers |
| [Fluidsynth](https://www.fluidsynth.org/) | Open-source software synthesizer |

---

## Music Provenance & Rights

| Resource | Notes |
|----------|-------|
| [Creative Commons Licenses](https://creativecommons.org/licenses/) | Open licensing for creative works |
| [ISRC Standard](https://www.ifpi.org/our-work/isrc/) | International Standard Recording Code |
| [ISWC Standard](https://www.iswc.org/) | International Standard Musical Work Code |
| [Music Modernization Act (US)](https://www.congress.gov/bill/115th-congress/house-bill/4706) | 2018 US copyright reform for music |
| [Global Repertoire Database (GRD)](https://en.wikipedia.org/wiki/Global_Repertoire_Database) | Historical attempt at unified music rights DB |
| [Mediachain (archived)](https://github.com/mediachain/mediachain) | Early blockchain-based media provenance project |
| [Content Authenticity Initiative (C2PA)](https://c2pa.org/) | Coalition for content provenance (Adobe, Microsoft, etc.) |

---

## Academic Papers

| Paper | Year | Notes |
|-------|------|-------|
| [Automatic chord recognition from audio using an HMM with supervised training](https://music.eecs.qmul.ac.uk/~markp/2003/BelloParrott03-ismir.pdf) | 2003 | Foundational chord analysis |
| [Music Information Retrieval: Recent Developments and Applications](https://link.springer.com/article/10.1007/s10462-015-9429-0) | 2015 | MIR survey |
| [The Lakh MIDI Dataset: How far are we from solving music generation?](https://colinraffel.com/publications/ismir2016lakh.pdf) | 2016 | Colin Raffel's LMD paper |
| [Music Transformer: Generating Music with Long-Term Structure](https://arxiv.org/abs/1809.04281) | 2018 | Google Brain attention in music |
| [MuseNet: Generating Piano Rolls with Transformers](https://openai.com/blog/musenet) | 2019 | OpenAI multi-instrument |
| [REMI: Pop Music Transformer](https://arxiv.org/abs/2002.00212) | 2020 | Event-based MIDI representation |
| [Jukebox: A Generative Model for Music](https://arxiv.org/abs/2005.00341) | 2020 | OpenAI raw audio generation |
| [MusicBERT: Symbolic Music Understanding with Large-Scale Pre-Training](https://arxiv.org/abs/2106.05630) | 2021 | Large-scale MIDI pre-training |
| [MusicGen: Simple and Controllable Music Generation](https://arxiv.org/abs/2306.05284) | 2023 | Meta single-stage music generation |

---

## POIM & MIDIM Explainer

### What is POIM?

POIM (Proof of Intent and Mastery) is a certificate standard for MIDI and music assets. A POIM certificate:

1. **Hashes** the exact file bytes with BLAKE3 (or SHA-256)
2. **Signs** a canonical JSON payload with Ed25519
3. **Records** who made the assertion and when
4. Can optionally be **submitted to a registry** (MIDIM.net) for corpus-wide provenance

### OSS vs registry-backed POIM

| | Local self-signed (`@midim/poim`) | Registry-backed (MIDIM.net) |
|-|-----------------------------------|-----------------------------|
| Keypair generation | ✅ | ✅ |
| Ed25519 signature | ✅ | ✅ |
| Tamper-evident | ✅ | ✅ |
| Publicly verifiable | ✅ (share the cert) | ✅ (registry lookup) |
| Provenance graph | ❌ | ✅ |
| Corpus deduplication | ❌ | ✅ |
| Marketplace eligibility | ❌ | ✅ |
| Rights confidence | ❌ | ✅ |

### Getting started with MIDIM OSS

```bash
pnpm add -g @midim/cli
midim poim keygen mykey.json
midim poim sign mysong.mid --private-key mykey.json
midim poim verify mysong.mid mysong.mid.poim.json
```

For registry-backed POIM, provenance graph, and marketplace eligibility, visit [MIDIM.net](https://midim.net).

---

## Contributing

Contributions are welcome! To add a resource:

1. Fork this repo
2. Add your entry to the relevant section (alphabetical order)
3. Include: name, language/year, license (if dataset), and a brief description
4. Open a pull request

**Guidelines:**
- Only include actively-maintained or historically significant projects
- For datasets, always include the license
- For papers, link to arXiv or official DOI when possible
- No self-promotion without a genuine contribution to the community

---

*This list is maintained by the MIDIM OSS community. For POIM registry and marketplace tools, visit [MIDIM.net](https://midim.net).*
