// Virtual Music Keyboard - Audio Engine with Loop Sequencer and Chords

class VirtualKeyboard {
    constructor() {
        this.audioContext = null;
        this.currentOctave = 4;
        this.activeOscillators = new Map();

        // Note frequencies for octave 4 (base octave)
        // Extended to support 3+ octaves on the visual keyboard
        this.baseFrequencies = {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88,
            // Octave 2 (one octave up from base)
            'C2': 523.25,
            'C#2': 554.37,
            'D2': 587.33,
            'D#2': 622.25,
            'E2': 659.25,
            'F2': 698.46,
            'F#2': 739.99,
            'G2': 783.99,
            'G#2': 830.61,
            'A2': 880.00,
            'A#2': 932.33,
            'B2': 987.77,
            // Octave 3 (two octaves up from base)
            'C3': 1046.50,
            'C#3': 1108.73,
            'D3': 1174.66,
            'D#3': 1244.51,
            'E3': 1318.51,
            'F3': 1396.91,
            'F#3': 1479.98,
            'G3': 1567.98,
            'G#3': 1661.22,
            'A3': 1760.00,
            'A#3': 1864.66,
            'B3': 1975.53,
            // Octave 4 (three octaves up - final C)
            'C4': 2093.00
        };

        // Keyboard mapping - extended for 3 octaves
        // Octave 1: A-L row (white) and Q-P row (black)
        // Octave 2: continues on same rows + number row for black keys
        // Octave 3: number row for white keys, shift+numbers would be ideal but we use available keys
        this.keyMap = {
            // Octave 1 - White keys
            'a': 'C',
            's': 'D',
            'd': 'E',
            'f': 'F',
            'g': 'G',
            'h': 'A',
            'j': 'B',
            // Octave 1 - Black keys
            'w': 'C#',
            'e': 'D#',
            't': 'F#',
            'y': 'G#',
            'u': 'A#',
            // Octave 2 - White keys
            'k': 'C2',
            'l': 'D2',
            ';': 'E2',
            "'": 'F2',
            '\\': 'G2',
            // Octave 2 - Black keys
            'o': 'C#2',
            'p': 'D#2',
            '[': 'F#2',
            ']': 'G#2',
            // Octave 2 continued + Octave 3 - Using number row
            '1': 'A2',
            '2': 'A#2',
            '3': 'B2',
            '4': 'C3',
            '5': 'C#3',
            '6': 'D3',
            '7': 'D#3',
            '8': 'E3',
            '9': 'F3',
            '0': 'F#3',
            '-': 'G3',
            '=': 'G#3',
            'q': 'A3',
            'r': 'A#3',
            'n': 'B3',
            'm': 'C4'
        };

        // Chord definitions (notes relative to root in current octave)
        this.chordDefinitions = {
            'C': ['C', 'E', 'G'],
            'Dm': ['D', 'F', 'A'],
            'Em': ['E', 'G', 'B'],
            'F': ['F', 'A', 'C2'],
            'G': ['G', 'B', 'D2'],
            'Am': ['A', 'C2', 'E2'],
            'Bdim': ['B', 'D2', 'F']
        };

        // Sequencer state
        this.isRecording = false;
        this.isPlaying = false;
        this.sequence = [];
        this.recordStartTime = null;
        this.playbackTimeouts = [];
        this.loopTimeout = null;
        this.tempo = 120;

        // Master volume (0-1 range)
        this.masterVolume = 0.75;
        this.masterGainNode = null;

        // Sustain pedal state
        this.sustainActive = false;
        this.sustainedNotes = new Set(); // Notes being held by sustain pedal

        // Pitch bend state
        this.pitchBendValue = 0; // -100 to +100
        this.pitchBendRange = 2; // Semitones (default ±2)

        // Arpeggiator state
        this.arpEnabled = false;
        this.arpMode = 'up'; // up, down, updown, random, asplayed
        this.arpRate = 8; // note division (4=quarter, 8=eighth, 16=sixteenth, 32=thirty-second)
        this.arpGate = 75; // percentage of note duration (25, 50, 75, 100)
        this.arpOctaves = 1; // 1-4 octaves range
        this.arpHold = false;
        this.arpHeldNotes = []; // notes held by arpeggiator
        this.arpPlayingNotes = []; // notes currently in arpeggio pattern
        this.arpCurrentIndex = 0;
        this.arpDirection = 1; // 1 for up, -1 for down (used for updown mode)
        this.arpInterval = null;
        this.arpCurrentNote = null; // Currently playing arpeggio note

        // AI Improvisation state
        this.improvStyle = 'pop';
        this.improvComplexity = 5;
        this.improvDensity = 5;
        this.improvIsPlaying = false;
        this.improvSequence = [];
        this.improvTimeouts = [];
        this.improvLoopTimeout = null;
        this.detectedKey = null;
        this.detectedScale = null;

        // Manual key/scale selection for instant improvisation
        this.manualKey = 'C';
        this.manualScale = 'major';

        // Music theory definitions
        this.scaleDefinitions = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            pentatonicMajor: [0, 2, 4, 7, 9],
            pentatonicMinor: [0, 3, 5, 7, 10],
            blues: [0, 3, 5, 6, 7, 10],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };

        // Note names for detection
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        this.init();
    }

    init() {
        // Initialize audio context on first user interaction
        document.addEventListener('click', () => this.initAudio(), { once: true });
        document.addEventListener('keydown', () => this.initAudio(), { once: true });

        this.setupEventListeners();
        this.setupSequencerControls();
        this.setupChordButtons();
        this.setupVolumeControl();
        this.setupSustainPedal();
        this.setupPitchBend();
        this.setupArpeggiator();
        this.setupImprovisation();
        this.updateOctaveDisplay();
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create master gain node for volume control
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);
        }
    }

    getFrequency(note, includePitchBend = true) {
        const baseFreq = this.baseFrequencies[note];
        if (!baseFreq) return null;

        // Adjust frequency based on octave (octave 4 is our reference)
        const octaveShift = this.currentOctave - 4;
        let frequency = baseFreq * Math.pow(2, octaveShift);

        // Apply pitch bend if enabled
        if (includePitchBend && this.pitchBendValue !== 0) {
            // Convert pitch bend to semitones, then to frequency multiplier
            const semitones = (this.pitchBendValue / 100) * this.pitchBendRange;
            frequency *= Math.pow(2, semitones / 12);
        }

        return frequency;
    }

    playNote(note, isPlayback = false) {
        if (!this.audioContext) {
            this.initAudio();
        }

        // If arpeggiator is enabled and this is not playback, add to arp instead
        if (this.arpEnabled && !isPlayback) {
            this.addNoteToArp(note);
            // Record the note if recording
            if (this.isRecording) {
                const timestamp = Date.now() - this.recordStartTime;
                this.sequence.push({
                    note,
                    time: timestamp,
                    type: 'noteOn',
                    octave: this.currentOctave
                });
            }
            return;
        }

        // Prevent playing the same note twice simultaneously
        if (this.activeOscillators.has(note)) return;

        const frequency = this.getFrequency(note);
        if (!frequency) return;

        // Record the note if recording (and not playback)
        if (this.isRecording && !isPlayback) {
            const timestamp = Date.now() - this.recordStartTime;
            this.sequence.push({
                note,
                time: timestamp,
                type: 'noteOn',
                octave: this.currentOctave
            });
        }

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Use a piano-like waveform (combination approach)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Create envelope for more natural sound
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.1); // Decay to sustain

        // Connect nodes through master gain
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);

        oscillator.start();

        // Store base frequency (without pitch bend) for real-time pitch bend updates
        const baseFrequency = this.getFrequency(note, false);

        // Store for later release and pitch bend updates
        this.activeOscillators.set(note, { oscillator, gainNode, baseFrequency });

        // Visual feedback
        this.setKeyActive(note, true);
    }

    stopNote(note, isPlayback = false, forceStop = false) {
        // If arpeggiator is enabled and this is not playback, remove from arp instead
        if (this.arpEnabled && !isPlayback && !forceStop) {
            this.removeNoteFromArp(note);
            // Record note off if recording
            if (this.isRecording) {
                const timestamp = Date.now() - this.recordStartTime;
                this.sequence.push({
                    note,
                    time: timestamp,
                    type: 'noteOff'
                });
            }
            return;
        }

        const nodes = this.activeOscillators.get(note);
        if (!nodes) return;

        // If sustain pedal is active and not forcing stop, hold the note
        if (this.sustainActive && !forceStop && !isPlayback) {
            this.sustainedNotes.add(note);
            return; // Don't stop the note yet
        }

        // Record note off if recording (and not playback)
        if (this.isRecording && !isPlayback) {
            const timestamp = Date.now() - this.recordStartTime;
            this.sequence.push({
                note,
                time: timestamp,
                type: 'noteOff'
            });
        }

        const { oscillator, gainNode } = nodes;
        const now = this.audioContext.currentTime;

        // Release envelope
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        // Stop oscillator after release
        oscillator.stop(now + 0.3);

        this.activeOscillators.delete(note);
        this.sustainedNotes.delete(note);

        // Visual feedback
        this.setKeyActive(note, false);
    }

    setKeyActive(note, active) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.toggle('active', active);
        }
    }

    changeOctave(delta) {
        const newOctave = this.currentOctave + delta;
        if (newOctave >= 1 && newOctave <= 7) {
            this.currentOctave = newOctave;
            this.updateOctaveDisplay();
        }
    }

    updateOctaveDisplay() {
        const display = document.getElementById('octave-value');
        if (display) {
            display.textContent = this.currentOctave;
        }
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;

            const key = e.key.toLowerCase();

            // Octave control
            if (key === 'z') {
                this.changeOctave(-1);
                return;
            }
            if (key === 'x') {
                this.changeOctave(1);
                return;
            }

            // Note playing
            const note = this.keyMap[key];
            if (note) {
                e.preventDefault();
                this.playNote(note);
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const note = this.keyMap[key];
            if (note) {
                this.stopNote(note);
            }
        });

        // Mouse/touch events on keys
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const note = key.dataset.note;

            // Mouse events
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playNote(note);
            });

            key.addEventListener('mouseup', () => {
                this.stopNote(note);
            });

            key.addEventListener('mouseleave', () => {
                this.stopNote(note);
            });

            // Touch events
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(note);
            });

            key.addEventListener('touchend', () => {
                this.stopNote(note);
            });
        });

        // Stop all notes if window loses focus
        window.addEventListener('blur', () => {
            this.activeOscillators.forEach((_, note) => {
                this.stopNote(note);
            });
        });
    }

    // Sequencer Controls Setup
    setupSequencerControls() {
        const recordBtn = document.getElementById('record-btn');
        const playBtn = document.getElementById('play-btn');
        const stopBtn = document.getElementById('stop-btn');
        const clearBtn = document.getElementById('clear-btn');
        const tempoInput = document.getElementById('tempo');

        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playSequence());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopSequence());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSequence());
        }
        if (tempoInput) {
            tempoInput.addEventListener('change', (e) => {
                this.tempo = parseInt(e.target.value) || 120;
            });
        }
    }

    toggleRecording() {
        const recordBtn = document.getElementById('record-btn');
        const statusEl = document.getElementById('seq-status');

        if (this.isRecording) {
            // Stop recording
            this.isRecording = false;
            recordBtn.classList.remove('recording');
            recordBtn.textContent = 'Record';
            statusEl.textContent = `Recorded ${this.sequence.length} events`;
            this.updateSequencerButtons();
            this.updateImprovButtons();
        } else {
            // Start recording
            this.stopSequence(); // Stop any playback
            this.sequence = []; // Clear previous recording
            this.recordStartTime = Date.now();
            this.isRecording = true;
            recordBtn.classList.add('recording');
            recordBtn.textContent = 'Stop Rec';
            statusEl.textContent = 'Recording...';
            this.updateSequencerButtons();
        }
    }

    playSequence() {
        if (this.sequence.length === 0 || this.isPlaying) return;

        this.initAudio();
        this.isPlaying = true;
        this.updateSequencerButtons();

        const playBtn = document.getElementById('play-btn');
        const statusEl = document.getElementById('seq-status');
        playBtn.classList.add('playing');
        statusEl.textContent = 'Playing...';

        this.playSequenceLoop();
    }

    playSequenceLoop() {
        if (!this.isPlaying) return;

        const startTime = Date.now();

        // Schedule all events
        this.sequence.forEach(event => {
            const timeout = setTimeout(() => {
                if (!this.isPlaying) return;

                // Save and set octave for this note
                const savedOctave = this.currentOctave;
                if (event.octave) {
                    this.currentOctave = event.octave;
                }

                if (event.type === 'noteOn') {
                    this.playNote(event.note, true);
                } else if (event.type === 'noteOff') {
                    this.stopNote(event.note, true);
                }

                // Restore octave
                this.currentOctave = savedOctave;
            }, event.time);

            this.playbackTimeouts.push(timeout);
        });

        // Calculate loop duration and schedule next loop
        const loopDuration = this.sequence.length > 0
            ? Math.max(...this.sequence.map(e => e.time)) + 500
            : 1000;

        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.playSequenceLoop();
            }
        }, loopDuration);
    }

    stopSequence() {
        this.isPlaying = false;

        // Clear all scheduled timeouts
        this.playbackTimeouts.forEach(timeout => clearTimeout(timeout));
        this.playbackTimeouts = [];

        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }

        // Stop all active notes
        this.activeOscillators.forEach((_, note) => {
            this.stopNote(note, true);
        });

        const playBtn = document.getElementById('play-btn');
        const statusEl = document.getElementById('seq-status');
        if (playBtn) playBtn.classList.remove('playing');
        if (statusEl) statusEl.textContent = 'Stopped';

        this.updateSequencerButtons();
    }

    clearSequence() {
        this.stopSequence();
        this.stopImprovisation();
        this.sequence = [];
        this.improvSequence = [];
        const statusEl = document.getElementById('seq-status');
        if (statusEl) statusEl.textContent = 'Ready';
        // Reset analysis display to show manual selection defaults
        this.updateAnalysisDisplayFromManual();
        this.updateSequencerButtons();
        this.updateImprovButtons();
    }

    updateSequencerButtons() {
        const playBtn = document.getElementById('play-btn');
        const stopBtn = document.getElementById('stop-btn');
        const clearBtn = document.getElementById('clear-btn');

        const hasSequence = this.sequence.length > 0;

        if (playBtn) playBtn.disabled = !hasSequence || this.isPlaying || this.isRecording;
        if (stopBtn) stopBtn.disabled = !this.isPlaying;
        if (clearBtn) clearBtn.disabled = !hasSequence || this.isRecording;
    }

    // Chord Button Setup
    setupChordButtons() {
        const chordButtons = document.querySelectorAll('.chord-btn');

        chordButtons.forEach(btn => {
            const chordName = btn.dataset.chord;

            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playChord(chordName);
                btn.classList.add('active');
            });

            btn.addEventListener('mouseup', () => {
                this.stopChord(chordName);
                btn.classList.remove('active');
            });

            btn.addEventListener('mouseleave', () => {
                this.stopChord(chordName);
                btn.classList.remove('active');
            });

            // Touch support
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playChord(chordName);
                btn.classList.add('active');
            });

            btn.addEventListener('touchend', () => {
                this.stopChord(chordName);
                btn.classList.remove('active');
            });
        });
    }

    playChord(chordName) {
        const notes = this.chordDefinitions[chordName];
        if (!notes) return;

        notes.forEach(note => this.playNote(note));
    }

    stopChord(chordName) {
        const notes = this.chordDefinitions[chordName];
        if (!notes) return;

        notes.forEach(note => this.stopNote(note));
    }

    // Sustain Pedal Setup
    setupSustainPedal() {
        const sustainBtn = document.getElementById('sustain-btn');
        const sustainIndicator = document.getElementById('sustain-indicator');

        // Keyboard Space key for sustain
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.activateSustain();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.releaseSustain();
            }
        });

        // Mouse/touch support for sustain button
        if (sustainBtn) {
            sustainBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.activateSustain();
            });

            sustainBtn.addEventListener('mouseup', () => {
                this.releaseSustain();
            });

            sustainBtn.addEventListener('mouseleave', () => {
                if (this.sustainActive) {
                    this.releaseSustain();
                }
            });

            sustainBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.activateSustain();
            });

            sustainBtn.addEventListener('touchend', () => {
                this.releaseSustain();
            });
        }
    }

    activateSustain() {
        if (this.sustainActive) return;
        this.sustainActive = true;

        const sustainBtn = document.getElementById('sustain-btn');
        const sustainIndicator = document.getElementById('sustain-indicator');

        if (sustainBtn) sustainBtn.classList.add('active');
        if (sustainIndicator) {
            sustainIndicator.classList.add('active');
            sustainIndicator.textContent = 'ON';
        }
    }

    releaseSustain() {
        if (!this.sustainActive) return;
        this.sustainActive = false;

        const sustainBtn = document.getElementById('sustain-btn');
        const sustainIndicator = document.getElementById('sustain-indicator');

        if (sustainBtn) sustainBtn.classList.remove('active');
        if (sustainIndicator) {
            sustainIndicator.classList.remove('active');
            sustainIndicator.textContent = 'OFF';
        }

        // Release all sustained notes
        const notesToRelease = [...this.sustainedNotes];
        notesToRelease.forEach(note => {
            this.stopNote(note, false, true); // Force stop
        });
    }

    // Pitch Bend Setup
    setupPitchBend() {
        const pitchBendSlider = document.getElementById('pitch-bend');
        const pitchBendDisplay = document.getElementById('pitch-bend-value');

        if (pitchBendSlider) {
            // Handle input (while dragging)
            pitchBendSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.setPitchBend(value);
                this.updatePitchBendDisplay(value, pitchBendDisplay);
            });

            // Handle release - auto-return to center
            pitchBendSlider.addEventListener('mouseup', () => {
                this.returnPitchBendToCenter(pitchBendSlider, pitchBendDisplay);
            });

            pitchBendSlider.addEventListener('touchend', () => {
                this.returnPitchBendToCenter(pitchBendSlider, pitchBendDisplay);
            });

            // Also handle if mouse leaves while dragging
            pitchBendSlider.addEventListener('mouseleave', (e) => {
                if (e.buttons === 1) { // Left mouse button was pressed
                    this.returnPitchBendToCenter(pitchBendSlider, pitchBendDisplay);
                }
            });
        }
    }

    returnPitchBendToCenter(slider, display) {
        // Animate back to center
        const currentValue = parseInt(slider.value);
        const step = currentValue > 0 ? -5 : 5;
        const animate = () => {
            const newValue = parseInt(slider.value) + step;
            if ((step > 0 && newValue >= 0) || (step < 0 && newValue <= 0)) {
                slider.value = 0;
                this.setPitchBend(0);
                this.updatePitchBendDisplay(0, display);
            } else {
                slider.value = newValue;
                this.setPitchBend(newValue);
                this.updatePitchBendDisplay(newValue, display);
                requestAnimationFrame(animate);
            }
        };
        if (currentValue !== 0) {
            animate();
        }
    }

    updatePitchBendDisplay(value, display) {
        if (display) {
            display.textContent = value > 0 ? `+${value}` : value;
            display.classList.remove('positive', 'negative');
            if (value > 0) {
                display.classList.add('positive');
            } else if (value < 0) {
                display.classList.add('negative');
            }
        }
    }

    setPitchBend(value) {
        this.pitchBendValue = value;

        // Apply pitch bend to all currently playing notes in real-time
        if (this.audioContext) {
            const now = this.audioContext.currentTime;
            this.activeOscillators.forEach(({ oscillator, baseFrequency }) => {
                if (baseFrequency) {
                    // Calculate bent frequency
                    const semitones = (value / 100) * this.pitchBendRange;
                    const bentFrequency = baseFrequency * Math.pow(2, semitones / 12);
                    // Smooth frequency transition for natural sound
                    oscillator.frequency.setTargetAtTime(bentFrequency, now, 0.01);
                }
            });
        }
    }

    // Volume Control Setup
    setupVolumeControl() {
        const volumeSlider = document.getElementById('master-volume');
        const volumeDisplay = document.getElementById('volume-display');

        if (volumeSlider) {
            // Set initial CSS custom property for track fill
            volumeSlider.style.setProperty('--volume-percent', '75%');

            volumeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.masterVolume = value / 100;

                // Update display
                if (volumeDisplay) {
                    volumeDisplay.textContent = `${value}%`;
                }

                // Update slider track fill via CSS custom property
                volumeSlider.style.setProperty('--volume-percent', `${value}%`);

                // Update actual audio gain if audio context exists
                if (this.masterGainNode && this.audioContext) {
                    this.masterGainNode.gain.setValueAtTime(
                        this.masterVolume,
                        this.audioContext.currentTime
                    );
                }
            });
        }
    }

    // Arpeggiator Setup
    setupArpeggiator() {
        const toggleBtn = document.getElementById('arp-toggle');
        const modeSelect = document.getElementById('arp-mode');
        const rateSelect = document.getElementById('arp-rate');
        const gateSelect = document.getElementById('arp-gate');
        const octavesSelect = document.getElementById('arp-octaves');
        const holdBtn = document.getElementById('arp-hold');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleArpeggiator());
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.arpMode = e.target.value;
                this.arpCurrentIndex = 0;
                this.arpDirection = 1;
            });
        }

        if (rateSelect) {
            rateSelect.addEventListener('change', (e) => {
                this.arpRate = parseInt(e.target.value);
                // Restart interval with new rate if arpeggiator is running
                if (this.arpEnabled && this.arpInterval) {
                    this.restartArpInterval();
                }
            });
        }

        if (gateSelect) {
            gateSelect.addEventListener('change', (e) => {
                this.arpGate = parseInt(e.target.value);
            });
        }

        if (octavesSelect) {
            octavesSelect.addEventListener('change', (e) => {
                this.arpOctaves = parseInt(e.target.value);
                // Rebuild pattern with new octave range
                if (this.arpEnabled) {
                    this.buildArpPattern();
                }
            });
        }

        if (holdBtn) {
            holdBtn.addEventListener('click', () => this.toggleArpHold());
        }
    }

    toggleArpeggiator() {
        this.arpEnabled = !this.arpEnabled;
        const toggleBtn = document.getElementById('arp-toggle');

        if (this.arpEnabled) {
            toggleBtn.classList.add('active');
            toggleBtn.textContent = 'ON';
            // Start arpeggiator if there are held notes
            if (this.arpHeldNotes.length > 0) {
                this.startArpeggiator();
            }
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.textContent = 'OFF';
            this.stopArpeggiator();
        }
    }

    toggleArpHold() {
        this.arpHold = !this.arpHold;
        const holdBtn = document.getElementById('arp-hold');

        if (this.arpHold) {
            holdBtn.classList.add('active');
        } else {
            holdBtn.classList.remove('active');
            // When hold is released, clear held notes if no keys are physically pressed
            // This will stop the arpeggiator
            if (this.arpEnabled) {
                this.arpHeldNotes = [];
                this.stopArpeggiator();
            }
        }
    }

    // Add note to arpeggiator
    addNoteToArp(note) {
        if (!this.arpEnabled) return;

        // Add note if not already in the list
        if (!this.arpHeldNotes.includes(note)) {
            this.arpHeldNotes.push(note);
            this.buildArpPattern();

            // Start arpeggiator if not already running
            if (!this.arpInterval) {
                this.startArpeggiator();
            }
        }
    }

    // Remove note from arpeggiator
    removeNoteFromArp(note) {
        if (!this.arpEnabled || this.arpHold) return;

        const index = this.arpHeldNotes.indexOf(note);
        if (index > -1) {
            this.arpHeldNotes.splice(index, 1);
            this.buildArpPattern();

            // Stop arpeggiator if no more notes
            if (this.arpHeldNotes.length === 0) {
                this.stopArpeggiator();
            }
        }
    }

    // Build the arpeggio pattern based on held notes and settings
    buildArpPattern() {
        if (this.arpHeldNotes.length === 0) {
            this.arpPlayingNotes = [];
            return;
        }

        // Get MIDI-like note numbers for sorting
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
                          'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
                          'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
                          'C4'];

        // Sort notes by pitch
        const sortedNotes = [...this.arpHeldNotes].sort((a, b) => {
            return noteOrder.indexOf(a) - noteOrder.indexOf(b);
        });

        // Build pattern with octave range
        this.arpPlayingNotes = [];

        for (let oct = 0; oct < this.arpOctaves; oct++) {
            sortedNotes.forEach(note => {
                this.arpPlayingNotes.push({
                    note: note,
                    octaveOffset: oct
                });
            });
        }

        // Reset index and direction
        this.arpCurrentIndex = 0;
        this.arpDirection = 1;
    }

    // Calculate interval time based on BPM and rate
    getArpIntervalMs() {
        // Quarter note = 60000 / BPM
        const quarterNoteMs = 60000 / this.tempo;
        // Divide by rate (4 = quarter, 8 = eighth, etc.)
        return quarterNoteMs * (4 / this.arpRate);
    }

    startArpeggiator() {
        if (this.arpPlayingNotes.length === 0) return;

        this.initAudio();

        const intervalMs = this.getArpIntervalMs();

        // Play first note immediately
        this.playArpNote();

        // Start interval for subsequent notes
        this.arpInterval = setInterval(() => {
            this.advanceArpIndex();
            this.playArpNote();
        }, intervalMs);
    }

    stopArpeggiator() {
        if (this.arpInterval) {
            clearInterval(this.arpInterval);
            this.arpInterval = null;
        }

        // Stop current playing note
        if (this.arpCurrentNote) {
            this.stopArpPlayingNote();
        }

        this.arpCurrentIndex = 0;
        this.arpDirection = 1;
    }

    restartArpInterval() {
        if (this.arpInterval) {
            clearInterval(this.arpInterval);
        }

        const intervalMs = this.getArpIntervalMs();
        this.arpInterval = setInterval(() => {
            this.advanceArpIndex();
            this.playArpNote();
        }, intervalMs);
    }

    advanceArpIndex() {
        if (this.arpPlayingNotes.length === 0) return;

        switch (this.arpMode) {
            case 'up':
                this.arpCurrentIndex = (this.arpCurrentIndex + 1) % this.arpPlayingNotes.length;
                break;

            case 'down':
                this.arpCurrentIndex = this.arpCurrentIndex - 1;
                if (this.arpCurrentIndex < 0) {
                    this.arpCurrentIndex = this.arpPlayingNotes.length - 1;
                }
                break;

            case 'updown':
                this.arpCurrentIndex += this.arpDirection;
                if (this.arpCurrentIndex >= this.arpPlayingNotes.length - 1) {
                    this.arpCurrentIndex = this.arpPlayingNotes.length - 1;
                    this.arpDirection = -1;
                } else if (this.arpCurrentIndex <= 0) {
                    this.arpCurrentIndex = 0;
                    this.arpDirection = 1;
                }
                break;

            case 'random':
                this.arpCurrentIndex = Math.floor(Math.random() * this.arpPlayingNotes.length);
                break;

            case 'asplayed':
                this.arpCurrentIndex = (this.arpCurrentIndex + 1) % this.arpPlayingNotes.length;
                break;
        }
    }

    playArpNote() {
        if (this.arpPlayingNotes.length === 0) return;

        // Stop previous note
        if (this.arpCurrentNote) {
            this.stopArpPlayingNote();
        }

        const noteData = this.arpPlayingNotes[this.arpCurrentIndex];
        if (!noteData) return;

        // Calculate octave-shifted frequency
        const baseFreq = this.baseFrequencies[noteData.note];
        if (!baseFreq) return;

        // Save current octave and apply offset
        const savedOctave = this.currentOctave;
        const effectiveOctave = Math.min(7, this.currentOctave + noteData.octaveOffset);

        // Calculate frequency with octave offset
        const octaveShift = effectiveOctave - 4;
        let frequency = baseFreq * Math.pow(2, octaveShift);

        // Apply pitch bend
        if (this.pitchBendValue !== 0) {
            const semitones = (this.pitchBendValue / 100) * this.pitchBendRange;
            frequency *= Math.pow(2, semitones / 12);
        }

        // Create oscillator for arp note
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        oscillator.start();

        // Store for later stop
        this.arpCurrentNote = {
            oscillator,
            gainNode,
            note: noteData.note,
            baseFrequency: baseFreq * Math.pow(2, octaveShift)
        };

        // Visual feedback
        this.setKeyActive(noteData.note, true);

        // Schedule note off based on gate
        const intervalMs = this.getArpIntervalMs();
        const gateMs = intervalMs * (this.arpGate / 100);

        setTimeout(() => {
            this.stopArpPlayingNote();
        }, gateMs - 10); // Slightly before next note to prevent overlap
    }

    stopArpPlayingNote() {
        if (!this.arpCurrentNote) return;

        const { oscillator, gainNode, note } = this.arpCurrentNote;
        const now = this.audioContext.currentTime;

        // Quick release
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        oscillator.stop(now + 0.05);

        // Visual feedback off
        this.setKeyActive(note, false);

        this.arpCurrentNote = null;
    }

    // =====================================================
    // AI IMPROVISATION ENGINE
    // =====================================================

    setupImprovisation() {
        const keySelect = document.getElementById('improv-key');
        const scaleSelect = document.getElementById('improv-scale');
        const styleSelect = document.getElementById('improv-style');
        const complexitySlider = document.getElementById('improv-complexity');
        const densitySlider = document.getElementById('improv-density');
        const complexityDisplay = document.getElementById('complexity-display');
        const densityDisplay = document.getElementById('density-display');
        const improvBtn = document.getElementById('improv-btn');
        const regenBtn = document.getElementById('improv-regen-btn');
        const stopBtn = document.getElementById('improv-stop-btn');

        if (keySelect) {
            keySelect.addEventListener('change', (e) => {
                this.manualKey = e.target.value;
                this.updateAnalysisDisplayFromManual();
            });
        }

        if (scaleSelect) {
            scaleSelect.addEventListener('change', (e) => {
                this.manualScale = e.target.value;
                this.updateAnalysisDisplayFromManual();
            });
        }

        if (styleSelect) {
            styleSelect.addEventListener('change', (e) => {
                this.improvStyle = e.target.value;
            });
        }

        if (complexitySlider) {
            complexitySlider.addEventListener('input', (e) => {
                this.improvComplexity = parseInt(e.target.value);
                if (complexityDisplay) complexityDisplay.textContent = this.improvComplexity;
            });
        }

        if (densitySlider) {
            densitySlider.addEventListener('input', (e) => {
                this.improvDensity = parseInt(e.target.value);
                if (densityDisplay) densityDisplay.textContent = this.improvDensity;
            });
        }

        if (improvBtn) {
            improvBtn.addEventListener('click', () => this.startImprovisation());
        }

        if (regenBtn) {
            regenBtn.addEventListener('click', () => this.regenerateImprovisation());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopImprovisation());
        }
    }

    // Analyze the recorded sequence to detect key and harmonic content
    analyzeSequence() {
        if (this.sequence.length === 0) return null;

        // Count note occurrences
        const noteCounts = {};
        this.noteNames.forEach(n => noteCounts[n] = 0);

        // Extract note names from sequence
        const noteOnEvents = this.sequence.filter(e => e.type === 'noteOn');

        noteOnEvents.forEach(event => {
            // Extract base note name (without octave suffix like C2, C3)
            let noteName = event.note.replace(/[0-9]/g, '');
            if (noteCounts.hasOwnProperty(noteName)) {
                noteCounts[noteName]++;
            }
        });

        // Find the most likely key by matching against scales
        let bestKey = 'C';
        let bestScale = 'major';
        let bestScore = -1;

        this.noteNames.forEach((rootNote, rootIndex) => {
            ['major', 'minor', 'pentatonicMajor', 'pentatonicMinor'].forEach(scaleName => {
                const scalePattern = this.scaleDefinitions[scaleName];
                let score = 0;

                scalePattern.forEach(interval => {
                    const noteIndex = (rootIndex + interval) % 12;
                    const noteName = this.noteNames[noteIndex];
                    score += noteCounts[noteName] * 2; // Weight scale notes
                });

                // Penalize notes not in scale
                this.noteNames.forEach((noteName, idx) => {
                    const relativeIndex = (idx - rootIndex + 12) % 12;
                    if (!scalePattern.includes(relativeIndex)) {
                        score -= noteCounts[noteName];
                    }
                });

                if (score > bestScore) {
                    bestScore = score;
                    bestKey = rootNote;
                    bestScale = scaleName;
                }
            });
        });

        this.detectedKey = bestKey;
        this.detectedScale = bestScale;

        // Detect chord progression by analyzing simultaneous notes
        const chords = this.detectChords(noteOnEvents);

        return {
            key: bestKey,
            scale: bestScale,
            chords: chords,
            noteCount: noteOnEvents.length,
            duration: this.sequence.length > 0 ?
                Math.max(...this.sequence.map(e => e.time)) : 0
        };
    }

    // Detect chords from note clusters
    detectChords(noteOnEvents) {
        const chords = [];
        const timeWindow = 50; // ms - notes within this window are considered a chord

        let i = 0;
        while (i < noteOnEvents.length) {
            const cluster = [noteOnEvents[i]];
            let j = i + 1;

            while (j < noteOnEvents.length &&
                   noteOnEvents[j].time - noteOnEvents[i].time < timeWindow) {
                cluster.push(noteOnEvents[j]);
                j++;
            }

            if (cluster.length >= 3) {
                // Identify chord type
                const noteIndices = cluster.map(e => {
                    const noteName = e.note.replace(/[0-9]/g, '');
                    return this.noteNames.indexOf(noteName);
                }).filter(idx => idx >= 0);

                if (noteIndices.length >= 3) {
                    const chord = this.identifyChord(noteIndices);
                    if (chord) {
                        chords.push({
                            chord: chord,
                            time: noteOnEvents[i].time
                        });
                    }
                }
            }

            i = j > i ? j : i + 1;
        }

        return chords;
    }

    // Identify chord type from note indices
    identifyChord(indices) {
        // Sort and normalize to root
        indices = [...new Set(indices)].sort((a, b) => a - b);
        const root = indices[0];
        const intervals = indices.map(i => (i - root + 12) % 12).sort((a, b) => a - b);

        // Common chord patterns
        const chordPatterns = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],
            'sus4': [0, 5, 7],
            'sus2': [0, 2, 7],
            '7': [0, 4, 7, 10],
            'maj7': [0, 4, 7, 11],
            'min7': [0, 3, 7, 10]
        };

        for (const [type, pattern] of Object.entries(chordPatterns)) {
            if (pattern.every(p => intervals.includes(p))) {
                return this.noteNames[root] + (type === 'major' ? '' : type);
            }
        }

        return this.noteNames[root] + '?';
    }

    // Generate improvisation based on analysis and style
    generateImprovisation(analysis) {
        if (!analysis) return [];

        const improv = [];
        const duration = Math.max(analysis.duration, 2000); // At least 2 seconds
        const keyIndex = this.noteNames.indexOf(analysis.key);

        // Get appropriate scale based on style
        let scale = this.getScaleForStyle(analysis.scale);

        // Calculate note density based on setting
        const notesPerSecond = 0.5 + (this.improvDensity / 10) * 4; // 0.5 to 4.5 notes/sec
        const totalNotes = Math.floor((duration / 1000) * notesPerSecond);

        // Generate notes
        let prevNoteIndex = null;
        let currentTime = 100; // Start slightly after beginning

        for (let i = 0; i < totalNotes; i++) {
            const noteData = this.generateNote(
                keyIndex,
                scale,
                prevNoteIndex,
                analysis.chords,
                currentTime,
                duration
            );

            if (noteData) {
                improv.push({
                    note: noteData.note,
                    time: currentTime,
                    duration: noteData.duration,
                    type: 'improvNote'
                });

                prevNoteIndex = noteData.index;

                // Calculate next note time with some variation
                const baseInterval = duration / totalNotes;
                const variation = (Math.random() - 0.5) * baseInterval * 0.5;
                currentTime += baseInterval + variation;
            } else {
                currentTime += duration / totalNotes;
            }
        }

        return improv;
    }

    // Get scale pattern based on style
    getScaleForStyle(detectedScale) {
        switch (this.improvStyle) {
            case 'jazz':
                return this.scaleDefinitions.dorian;
            case 'blues':
                return this.scaleDefinitions.blues;
            case 'classical':
                return detectedScale.includes('minor') ?
                    this.scaleDefinitions.minor : this.scaleDefinitions.major;
            case 'pop':
                return detectedScale.includes('minor') ?
                    this.scaleDefinitions.pentatonicMinor : this.scaleDefinitions.pentatonicMajor;
            case 'ambient':
                return this.scaleDefinitions.pentatonicMajor;
            case 'random':
                return this.scaleDefinitions.chromatic;
            default:
                return this.scaleDefinitions.major;
        }
    }

    // Generate a single note based on context
    generateNote(keyIndex, scale, prevIndex, chords, time, totalDuration) {
        // Find relevant chord at this time
        const currentChord = this.findChordAtTime(chords, time);

        // Determine target notes based on style and complexity
        let targetNotes = [];
        let weights = [];

        // Add scale notes
        scale.forEach(interval => {
            const noteIndex = (keyIndex + interval) % 12;
            targetNotes.push(noteIndex);
            weights.push(1);
        });

        // Weight chord tones higher if we have a chord
        if (currentChord) {
            const chordRoot = this.noteNames.indexOf(currentChord.replace(/[^A-G#]/g, ''));
            if (chordRoot >= 0) {
                // Root, 3rd, 5th
                [0, 3, 4, 7].forEach(interval => {
                    const idx = targetNotes.indexOf((chordRoot + interval) % 12);
                    if (idx >= 0) weights[idx] *= 2;
                });
            }
        }

        // Apply style-specific modifications
        this.applyStyleWeights(targetNotes, weights, keyIndex, prevIndex);

        // Add complexity - more chromatic notes at higher complexity
        if (this.improvComplexity > 5) {
            const chromaticChance = (this.improvComplexity - 5) / 10;
            if (Math.random() < chromaticChance) {
                // Add passing tone
                if (prevIndex !== null) {
                    const passingTone = (prevIndex + (Math.random() > 0.5 ? 1 : -1) + 12) % 12;
                    targetNotes.push(passingTone);
                    weights.push(0.5);
                }
            }
        }

        // Favor stepwise motion
        if (prevIndex !== null) {
            targetNotes.forEach((note, i) => {
                const distance = Math.abs(note - prevIndex);
                const wrappedDistance = Math.min(distance, 12 - distance);
                if (wrappedDistance <= 2) {
                    weights[i] *= 1.5;
                } else if (wrappedDistance >= 5) {
                    weights[i] *= 0.5;
                }
            });
        }

        // Weighted random selection
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = targetNotes[0];

        for (let i = 0; i < targetNotes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedIndex = targetNotes[i];
                break;
            }
        }

        // Convert to note name with octave designation
        const noteName = this.noteNames[selectedIndex];
        const octaveSuffix = this.getOctaveSuffix(selectedIndex, prevIndex);

        // Calculate duration based on style and density
        const baseDuration = this.calculateNoteDuration(totalDuration, this.improvStyle);

        return {
            note: noteName + octaveSuffix,
            index: selectedIndex,
            duration: baseDuration
        };
    }

    // Find chord at given time
    findChordAtTime(chords, time) {
        if (!chords || chords.length === 0) return null;

        // Find the most recent chord before this time
        let currentChord = null;
        for (const c of chords) {
            if (c.time <= time) {
                currentChord = c.chord;
            } else {
                break;
            }
        }
        return currentChord;
    }

    // Apply style-specific note weights
    applyStyleWeights(targetNotes, weights, keyIndex, prevIndex) {
        switch (this.improvStyle) {
            case 'jazz':
                // Add blue notes, chromatic approaches
                const blueNotes = [3, 6, 10]; // Minor 3rd, tritone, minor 7th
                blueNotes.forEach(interval => {
                    const idx = targetNotes.indexOf((keyIndex + interval) % 12);
                    if (idx >= 0) weights[idx] *= 1.3;
                });
                break;

            case 'blues':
                // Emphasize blue notes heavily
                const bluesEmphasis = [3, 5, 6, 7, 10];
                bluesEmphasis.forEach(interval => {
                    const idx = targetNotes.indexOf((keyIndex + interval) % 12);
                    if (idx >= 0) weights[idx] *= 1.5;
                });
                break;

            case 'classical':
                // Favor diatonic, avoid chromaticism
                targetNotes.forEach((note, i) => {
                    const inScale = this.scaleDefinitions.major.includes((note - keyIndex + 12) % 12);
                    if (!inScale) weights[i] *= 0.3;
                });
                break;

            case 'ambient':
                // Long intervals, avoid semitones
                if (prevIndex !== null) {
                    targetNotes.forEach((note, i) => {
                        const interval = Math.abs(note - prevIndex);
                        if (interval === 1 || interval === 11) weights[i] *= 0.3;
                    });
                }
                break;

            case 'pop':
                // Simple, catchy patterns
                const popNotes = [0, 4, 7]; // Root, 3rd, 5th
                popNotes.forEach(interval => {
                    const idx = targetNotes.indexOf((keyIndex + interval) % 12);
                    if (idx >= 0) weights[idx] *= 1.8;
                });
                break;
        }
    }

    // Determine octave suffix for note
    getOctaveSuffix(noteIndex, prevIndex) {
        // Use visual keyboard note naming (C, C2, C3, C4)
        // Randomly choose register based on keyboard range
        const octaveOptions = ['', '2', '3'];

        if (prevIndex !== null) {
            // Try to stay in similar register
            const diff = noteIndex - prevIndex;
            if (diff > 6) {
                // Prefer lower octave
                return octaveOptions[0];
            } else if (diff < -6) {
                // Prefer higher octave
                return Math.random() > 0.5 ? '2' : '3';
            }
        }

        // Random octave with middle preference
        const rand = Math.random();
        if (rand < 0.4) return '';
        if (rand < 0.8) return '2';
        return '3';
    }

    // Calculate note duration based on style
    calculateNoteDuration(totalDuration, style) {
        const beatMs = 60000 / this.tempo;

        switch (style) {
            case 'ambient':
                // Long, sustained notes
                return beatMs * (1 + Math.random() * 2);
            case 'jazz':
                // Varied, syncopated
                return beatMs * (0.25 + Math.random() * 0.75);
            case 'blues':
                // Medium with swing feel
                return beatMs * (0.5 + Math.random() * 0.5);
            case 'classical':
                // Precise, varied
                const divisions = [0.25, 0.5, 0.5, 1];
                return beatMs * divisions[Math.floor(Math.random() * divisions.length)];
            case 'pop':
                // Regular, catchy
                return beatMs * 0.5;
            default:
                return beatMs * 0.5;
        }
    }

    // Start playing the improvisation
    startImprovisation() {
        // Stop any existing improvisation
        this.stopImprovisation();

        // Analyze the sequence or use default analysis
        this.updateImprovStatus('Analyzing...');
        const statusEl = document.getElementById('improv-status');
        if (statusEl) statusEl.classList.add('analyzing');

        setTimeout(() => {
            let analysis;
            if (this.sequence.length > 0) {
                // Analyze the recorded sequence
                analysis = this.analyzeSequence();
            } else {
                // Use default analysis with manual key/scale selection
                analysis = this.getDefaultAnalysis();
            }

            if (!analysis) {
                this.updateImprovStatus('Analysis failed');
                return;
            }

            // Update analysis display
            if (this.sequence.length > 0) {
                this.updateAnalysisDisplay(analysis);
            } else {
                this.updateAnalysisDisplayFromManual();
            }

            // Generate improvisation
            this.improvSequence = this.generateImprovisation(analysis);

            if (this.improvSequence.length === 0) {
                this.updateImprovStatus('Generation failed');
                return;
            }

            // Start playback
            this.improvIsPlaying = true;
            this.updateImprovStatus('Playing');
            if (statusEl) {
                statusEl.classList.remove('analyzing');
                statusEl.classList.add('playing');
            }

            this.updateImprovButtons();
            this.playImprovLoop();
        }, 300);
    }

    // Play improvisation loop
    playImprovLoop() {
        if (!this.improvIsPlaying) return;

        this.initAudio();

        // Schedule all improvisation notes
        this.improvSequence.forEach(event => {
            const timeout = setTimeout(() => {
                if (!this.improvIsPlaying) return;
                this.playImprovNote(event.note, event.duration);
            }, event.time);

            this.improvTimeouts.push(timeout);
        });

        // Calculate loop duration
        const loopDuration = this.improvSequence.length > 0 ?
            Math.max(...this.improvSequence.map(e => e.time + (e.duration || 500))) + 200 : 2000;

        // Schedule loop
        this.improvLoopTimeout = setTimeout(() => {
            if (this.improvIsPlaying) {
                this.playImprovLoop();
            }
        }, loopDuration);
    }

    // Play a single improvisation note
    playImprovNote(note, duration) {
        if (!this.audioContext) return;

        // Check if note exists in our frequency table
        const frequency = this.getFrequency(note);
        if (!frequency) return;

        // Create oscillator with slightly different timbre for improvisation
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Use sawtooth for improv to distinguish from main keyboard
        oscillator.type = this.improvStyle === 'ambient' ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        oscillator.start();

        // Visual feedback
        this.setKeyActive(note, true);

        // Schedule note off
        const releaseTime = duration / 1000;
        setTimeout(() => {
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            oscillator.stop(this.audioContext.currentTime + 0.2);
            this.setKeyActive(note, false);
        }, duration);
    }

    // Stop improvisation
    stopImprovisation() {
        this.improvIsPlaying = false;

        // Clear all timeouts
        this.improvTimeouts.forEach(t => clearTimeout(t));
        this.improvTimeouts = [];

        if (this.improvLoopTimeout) {
            clearTimeout(this.improvLoopTimeout);
            this.improvLoopTimeout = null;
        }

        const statusEl = document.getElementById('improv-status');
        if (statusEl) {
            statusEl.classList.remove('analyzing', 'playing');
        }

        this.updateImprovStatus('Stopped');
        this.updateImprovButtons();
    }

    // Regenerate with same analysis
    regenerateImprovisation() {
        const wasPlaying = this.improvIsPlaying;
        this.stopImprovisation();

        // Get analysis from sequence or use default
        let analysis;
        if (this.sequence.length > 0) {
            analysis = this.analyzeSequence();
        } else {
            analysis = this.getDefaultAnalysis();
        }

        if (analysis) {
            this.improvSequence = this.generateImprovisation(analysis);

            if (wasPlaying) {
                this.improvIsPlaying = true;
                this.updateImprovStatus('Playing');
                const statusEl = document.getElementById('improv-status');
                if (statusEl) statusEl.classList.add('playing');
                this.playImprovLoop();
            } else {
                this.updateImprovStatus('Regenerated');
            }
        }

        this.updateImprovButtons();
    }

    // Update improvisation status display
    updateImprovStatus(text) {
        const statusEl = document.getElementById('improv-status');
        if (statusEl) {
            statusEl.textContent = text;
        }
    }

    // Update analysis display
    updateAnalysisDisplay(analysis) {
        const analysisText = document.getElementById('analysis-text');
        if (analysisText && analysis) {
            const scaleName = analysis.scale.replace(/([A-Z])/g, ' $1').trim();
            const chordInfo = analysis.chords.length > 0 ?
                ` | Chords: ${analysis.chords.slice(0, 3).map(c => c.chord).join(', ')}` : '';
            analysisText.textContent = `Key: ${analysis.key} ${scaleName}${chordInfo}`;
        }
    }

    // Update analysis display from manual key/scale selection
    updateAnalysisDisplayFromManual() {
        const analysisText = document.getElementById('analysis-text');
        if (analysisText) {
            const scaleName = this.manualScale.replace(/([A-Z])/g, ' $1').trim();
            if (this.sequence.length === 0) {
                // Show the I-V-vi-IV progression in the selected key
                const chordProgression = this.getDefaultChordProgression();
                analysisText.textContent = `Using ${this.manualKey} ${scaleName} with ${chordProgression}`;
            } else {
                analysisText.textContent = `Using ${this.manualKey} ${scaleName} (manual selection)`;
            }
        }
    }

    // Get default chord progression name based on scale
    getDefaultChordProgression() {
        if (this.manualScale.includes('minor') || this.manualScale === 'dorian') {
            return 'i-VII-VI-VII progression';
        }
        return 'I-V-vi-IV progression';
    }

    // Generate a default analysis when no sequence is recorded
    getDefaultAnalysis() {
        const keyIndex = this.noteNames.indexOf(this.manualKey);
        const isMinor = this.manualScale.includes('minor') || this.manualScale === 'dorian';

        // Default chord progression: I-V-vi-IV for major, i-VII-VI-VII for minor
        let chords;
        if (isMinor) {
            // Minor progression: i - VII - VI - VII (Am - G - F - G in A minor)
            const chordRoots = [0, 10, 8, 10]; // Semitone intervals from root
            chords = chordRoots.map((interval, idx) => {
                const chordRootIndex = (keyIndex + interval) % 12;
                const chordRoot = this.noteNames[chordRootIndex];
                const chordType = idx === 0 ? 'minor' : '';
                return {
                    chord: chordRoot + (chordType ? 'm' : ''),
                    time: idx * 1000 // Each chord lasts ~1 second
                };
            });
        } else {
            // Major progression: I - V - vi - IV (C - G - Am - F in C major)
            const chordIntervals = [
                { interval: 0, type: '' },      // I (major)
                { interval: 7, type: '' },      // V (major)
                { interval: 9, type: 'm' },     // vi (minor)
                { interval: 5, type: '' }       // IV (major)
            ];
            chords = chordIntervals.map((chord, idx) => {
                const chordRootIndex = (keyIndex + chord.interval) % 12;
                const chordRoot = this.noteNames[chordRootIndex];
                return {
                    chord: chordRoot + chord.type,
                    time: idx * 1000
                };
            });
        }

        // Calculate duration: 4 bars at current tempo (4 beats per bar)
        const beatMs = 60000 / this.tempo;
        const duration = beatMs * 16; // 4 bars of 4 beats

        return {
            key: this.manualKey,
            scale: this.manualScale,
            chords: chords,
            noteCount: 0,
            duration: duration
        };
    }

    // Update improvisation button states
    updateImprovButtons() {
        const improvBtn = document.getElementById('improv-btn');
        const regenBtn = document.getElementById('improv-regen-btn');
        const stopBtn = document.getElementById('improv-stop-btn');

        const hasImprov = this.improvSequence.length > 0;

        if (improvBtn) {
            // IMPROVISE button is now always enabled (instant improvisation)
            improvBtn.disabled = this.improvIsPlaying;
            improvBtn.classList.toggle('active', this.improvIsPlaying);
        }
        if (regenBtn) {
            regenBtn.disabled = !hasImprov;
        }
        if (stopBtn) {
            stopBtn.disabled = !this.improvIsPlaying;
        }
    }
}

// Initialize keyboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VirtualKeyboard();
});
