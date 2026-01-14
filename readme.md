# 🎹 Virtual Music Keyboard

A professional-grade virtual synthesizer running entirely in your browser. No plugins, no installs — just open and play.

![Virtual Music Keyboard](keyboard.png)

## ✨ Features

### 🎵 Instrument
- **37 keys** spanning 3+ octaves with realistic 3D piano visuals
- **Full keyboard mapping** — every key playable via computer keyboard
- **Web Audio API** synthesis with triangle waveform and ADSR envelope
- **Octave control** (Z/X keys) — range from octave 1 to 7

### 🎛️ Controls
- **Pitch Bend Wheel** — ±2 semitones with spring-loaded auto-return
- **Sustain Pedal** — Space key or on-screen button
- **Master Volume** — real-time gain control
- **One-click Chords** — C, Dm, Em, F, G, Am, Bdim

### 🔄 Arpeggiator
- **5 Modes**: Up, Down, Up/Down, Random, As Played
- **Rate sync** with BPM: 1/4, 1/8, 1/16, 1/32 divisions
- **Gate control**: 25%, 50%, 75%, 100%
- **Octave range**: 1-4 octaves
- **Hold function** to keep patterns playing

### 🔴 Loop Sequencer
- Record, Play, Stop, Clear controls
- BPM control (40-240)
- Automatic looping with precise timing
- Records both notes and chords

## 🎮 Quick Start

1. Open `index.html` in any modern browser
2. Click anywhere to enable audio
3. Play using your keyboard or mouse

### ⌨️ Keyboard Layout

| Octave | White Keys | Black Keys |
|--------|------------|------------|
| 1 | A S D F G H J | W E T Y U |
| 2 | K L ; ' \ 1 3 | O P [ ] 2 |
| 3 | 4 6 8 9 - Q N | 5 7 0 = R |
| 4 | M (final C) | — |

**Controls**: Z/X (octave down/up) • Space (sustain)

## 🛠️ Tech Stack

- **HTML5** + **CSS3** + **Vanilla JavaScript**
- **Web Audio API** for low-latency synthesis
- **Zero dependencies** — works offline

## 📁 Project Structure

```
├── index.html      # Main application
├── styles.css      # DAW-style dark theme
├── script.js       # Audio engine & controls
└── PRD.md          # Product requirements
```

## 🌐 Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Recommended |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |

---

## 🤖 Built with Ralph

This project was built using the **Ralph Loop** — an autonomous AI development workflow where Claude (AI) iterates through a PRD (Product Requirements Document):

```
Read PRD → Implement → Commit → Update Progress → Repeat
```

The included scripts demonstrate this approach:
- `gen-prd.sh` — Generate initial PRD
- `ralph-once.sh` — Execute one task
- `ralph-afk.sh N` — Run N iterations autonomously

![Ralph Wiggum, Senior Software Engineer](ralph.png)

---

## 📄 License

MIT License © 2026
