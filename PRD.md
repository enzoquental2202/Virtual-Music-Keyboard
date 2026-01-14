# Virtual Music Keyboard - Product Requirements Document

## Overview

A web-based virtual music keyboard that allows users to play musical notes using their computer keyboard or mouse clicks.

## Features

### Core Features

1. **Piano Keyboard Display**
   - Visual representation of piano keys (white and black keys)
   - 3+ octaves (37 keys total: C to C spanning 3 full octaves plus final C)
   - Keyboard fills the entire container width
   - Visual feedback when keys are pressed (highlight/animation)

2. **Sound Playback**
   - Play synthesizer sounds when keys are activated
   - Web Audio API for low-latency sound generation
   - Support for sustained notes while key is held
   - Envelope shaping (attack, decay, sustain, release) for natural sound

3. **Input Methods**
   - **Mouse/Touch**: Click or tap on virtual keys
   - **Keyboard**: Computer keyboard mapped to all 37 piano keys (3+ octaves)
     - **Octave 1 (white)**: A, S, D, F, G, H, J
     - **Octave 1 (black)**: W, E, T, Y, U
     - **Octave 2 (white)**: K, L, ;, ', \, 1, 3
     - **Octave 2 (black)**: O, P, [, ], 2
     - **Octave 3 (white)**: 4, 6, 8, 9, -, Q, N
     - **Octave 3 (black)**: 5, 7, 0, =, R
     - **Final C (octave 4)**: M
   - All 37 keys playable via keyboard shortcuts (displayed on each key)

4. **Octave Control**
   - Z key: Shift octave down
   - X key: Shift octave up
   - Range: Octave 1 to 7
   - Display current octave indicator

5. **Loop Sequencer**
   - Record button to capture note sequences with timing
   - Play button to loop playback recorded sequences
   - Stop button to halt playback
   - Clear button to reset the sequence
   - BPM control (40-240 range)
   - Status indicator showing recording/playback state
   - Automatic looping of recorded patterns

6. **Chord Playback**
   - One-click chord buttons for common chords in C major scale
   - Available chords: C, Dm, Em, F, G, Am, Bdim
   - Mouse/touch support for chord buttons
   - Chords can be recorded into the sequencer
   - Visual feedback on chord button press

7. **Professional DAW-Style Visual Design**
   - Sleek dark theme with neon accent lighting (cyan/magenta/orange)
   - 3D realistic piano keys with shadows, bevels, and reflections
   - Glassmorphism panels with backdrop blur and glow effects
   - Orbitron display font for high-end studio aesthetic
   - LED-style indicators with color-coded glow effects
   - Hardware-style transport buttons with depth and shadows
   - Animated background with subtle grid pattern
   - Neon color scheme: cyan (primary), magenta (chords), orange (tempo), red (record), green (play)
   - Mobile-responsive design with preserved visual quality

8. **Master Volume Control**
   - Slider control for master output volume (0-100%)
   - Real-time gain adjustment via Web Audio API master gain node
   - Visual feedback with neon green accent styling
   - Dynamic slider track fill indicating current level
   - Percentage display showing exact volume level
   - DAW-style glassmorphism container design

9. **Sustain Pedal**
   - Space key activates sustain (hold notes even after key release)
   - Releasing Space releases all sustained notes
   - Visual sustain button with mouse/touch support
   - LED-style ON/OFF indicator with yellow neon glow
   - Notes held by sustain continue sounding until pedal is released
   - Works with both keyboard and mouse/click input

10. **Pitch Bend Wheel**
    - Vertical wheel control for real-time pitch bending
    - Range: ±2 semitones (adjustable)
    - Real-time frequency modulation of all active notes
    - Auto-return to center when released (spring-loaded behavior)
    - Smooth animated return with visual feedback
    - Value display showing current bend amount (-100 to +100)
    - Color-coded display (green for positive, red for negative, cyan for center)
    - DAW-style glassmorphism container design
    - Responsive design: vertical on desktop, horizontal on mobile

11. **Arpeggiator**
    - ON/OFF toggle button with visual LED indicator
    - Modes: Up, Down, Up/Down, Random, As Played
    - Rate synced with BPM: 1/4, 1/8, 1/16, 1/32 note divisions
    - Gate control: 25%, 50%, 75%, 100% note duration
    - Octave range: 1-4 octaves for pattern extension
    - HOLD function to keep pattern playing after key release
    - Automatic pattern building from held notes sorted by pitch
    - Real-time parameter changes without stopping playback
    - Integration with sequencer recording
    - DAW-style glassmorphism panel design
    - Mobile-responsive controls

12. **AI Improvisation Engine**
    - Analyzes recorded sequences to detect musical key and scale
    - Detects chord progressions from simultaneous note clusters
    - Generates melodic improvisations over recorded loops
    - **Instant Improvisation (no recording required):**
      - Works immediately without needing to record a sequence first
      - Manual Key selector (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
      - Manual Scale selector (Major, Minor, Dorian, Mixolydian, Pentatonic Major/Minor, Blues)
      - Default chord progression: I-V-vi-IV for major scales, i-VII-VI-VII for minor scales
      - Duration: 4 bars at current BPM tempo setting
      - Manual selections override auto-detection when no recording exists
    - **Improvisation Styles:**
      - Jazz: Dorian mode, chromatic approaches, blue notes
      - Classical: Diatonic scales, arpeggios, ornamental patterns
      - Blues: Blues scale emphasis, bent note feel
      - Pop/Rock: Pentatonic melodies, simple catchy phrases
      - Ambient: Long sustained notes, consonant intervals
      - Random: Full chromatic exploration
    - **Controls:**
      - Key selector dropdown for choosing improvisation key
      - Scale selector dropdown for choosing scale type
      - Style selector dropdown for different musical genres
      - Complexity slider (1-10): Controls chromatic/diatonic balance
      - Density slider (1-10): Controls notes per second
      - IMPROVISE button: Starts AI-generated melody playback (always enabled)
      - Regenerate button: Creates new variation
      - Stop button: Halts improvisation playback
    - **Music Theory Engine:**
      - Scale detection: Major, Minor, Pentatonic, Blues
      - Chord identification: Major, Minor, Dim, Aug, 7th chords
      - Weighted note selection based on chord tones
      - Stepwise motion preference for melodic coherence
      - Style-specific note weighting algorithms
    - **Behavior Modes:**
      - No recording + no manual selection = C Major with I-V-vi-IV progression
      - No recording + manual key/scale = improvise freely in selected key/scale
      - Recording exists = analyze and improvise based on recording
    - Real-time harmonic analysis display showing detected key/chords
    - Looped playback synced with original recording duration (or 4 bars when no recording)
    - Visual keyboard highlighting during improvisation
    - DAW-style glassmorphism panel with gradient accent

## Technical Implementation

### Technology Stack

- **HTML5**: Structure and layout
- **CSS3**: Styling, animations, key visuals, glassmorphism, CSS variables
- **JavaScript**: Event handling, Web Audio API integration
- **Google Fonts**: Orbitron (display), Inter (UI text)

### File Structure

```
/
├── index.html      # Main HTML structure
├── styles.css      # Keyboard styling
├── script.js       # Audio logic and event handlers
└── PRD.md          # This document
```

### Audio Generation

- Oscillator-based synthesis using triangle waveform
- ADSR envelope for realistic sound:
  - Attack: 10ms
  - Decay: 90ms
  - Sustain: 0.3 gain
  - Release: 300ms

### Note Frequency Reference (Octave 4)

| Note | Frequency (Hz) |
|------|----------------|
| C4   | 261.63         |
| C#4  | 277.18         |
| D4   | 293.66         |
| D#4  | 311.13         |
| E4   | 329.63         |
| F4   | 349.23         |
| F#4  | 369.99         |
| G4   | 392.00         |
| G#4  | 415.30         |
| A4   | 440.00         |
| A#4  | 466.16         |
| B4   | 493.88         |
| C5   | 523.25         |

## Usage

1. Open `index.html` in a modern web browser
2. Click on keys or use keyboard to play notes
3. Use Z/X to change octaves
4. Click chord buttons to play full chords instantly
5. Use the sequencer:
   - Click "Record" to start recording
   - Play notes/chords (they will be recorded with timing)
   - Click "Stop Rec" to finish recording
   - Click "Play" to loop the recorded sequence
   - Click "Stop" to stop playback
   - Click "Clear" to reset and record a new sequence
6. Use AI Improvisation:
   - Record a chord progression or melody first
   - Select an improvisation style (Jazz, Blues, Pop, etc.)
   - Adjust Complexity and Density sliders to taste
   - Click "IMPROVISE" to generate and play AI melody
   - Click "Regenerate" for a new variation
   - Click "Stop" to halt improvisation

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Success Criteria

- Keys produce sound immediately on press (< 50ms latency)
- Visual feedback is synchronized with audio
- Keyboard mapping is intuitive
- No audio glitches or overlapping issues
