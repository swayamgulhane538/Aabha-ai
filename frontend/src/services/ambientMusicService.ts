// Cinematic Ambient Background Music Engine using Web Audio API
// Generates a lush, soothing, acoustic-electronic cinematic soundscape:
// - Warm ambient pad strings (7th and 9th chords: Dmaj9 -> Bm9 -> Gmaj9 -> Aadd9)
// - Gentle acoustic piano / bell arpeggio sparkles
// - Stereo spatial depth with feedback delay & warm analog low-pass filtering
// - Perfect low volume mix (~7-9%) so voiceover speech remains 100% crisp and clear.

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private chordTimer: any = null;
  private arpeggioTimer: any = null;
  private currentVolume: number = 0.08;

  public start(volume: number = 0.08) {
    if (this.isPlaying) return;
    this.currentVolume = volume;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      // Smooth fade-in over 2.5s
      this.masterGain.gain.exponentialRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      // Stereo Space Delay / Reverb simulation
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.38, this.ctx.currentTime); // 380ms echo

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.28, this.ctx.currentTime); // 28% decay feedback

      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.delayNode.connect(delayFilter);
      delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.masterGain);

      this.isPlaying = true;

      // Start chord pads and sparkle piano arpeggios
      this.scheduleLushChords();
      this.scheduleSparkleMelody();
    } catch (e) {
      console.warn('Ambient music failed to initialize', e);
    }
  }

  // Lush Cinematic Chords (Dmaj9 -> Bm9 -> Gmaj9 -> Aadd9)
  private scheduleLushChords() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    // Frequencies (Hz) for calming warm chords
    const chordProgressions = [
      // Dmaj9 (D3, A3, C#4, E4, F#4)
      [146.83, 220.00, 277.18, 329.63, 369.99],
      // Bm9 (B2, F#3, A3, C#4, D4)
      [123.47, 185.00, 220.00, 277.18, 293.66],
      // Gmaj9 (G2, D3, F#3, B3, D4)
      [98.00, 146.83, 185.00, 246.94, 293.66],
      // Aadd9 (A2, E3, G#3, B3, E4)
      [110.00, 164.81, 207.65, 246.94, 329.63]
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chord = chordProgressions[chordIdx % chordProgressions.length];
      chordIdx++;

      const now = this.ctx.currentTime;
      const duration = 5.8; // Duration per chord cycle

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;

        // Dual oscillator for rich warmth (Sine + Soft Triangle)
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const warmFilter = this.ctx.createBiquadFilter();

        warmFilter.type = 'lowpass';
        // Sub-bass warm cutoff
        warmFilter.frequency.setValueAtTime(450 + i * 80, now);
        warmFilter.Q.setValueAtTime(1.2, now);

        osc.type = i === 0 ? 'sine' : (i % 2 === 0 ? 'sine' : 'triangle');
        osc.frequency.setValueAtTime(freq, now);

        // Gentle envelope: Slow fade-in and smooth release
        const peakGain = (0.045 / (i + 1));
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(peakGain, now + 1.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.5);

        osc.connect(warmFilter);
        warmFilter.connect(noteGain);
        noteGain.connect(this.masterGain);

        // Connect high notes to stereo delay
        if (i >= 2 && this.delayNode) {
          noteGain.connect(this.delayNode);
        }

        osc.start(now);
        osc.stop(now + duration + 0.8);
      });

      this.chordTimer = setTimeout(playChord, (duration - 0.6) * 1000);
    };

    playChord();
  }

  // Soft Piano Bell Chimes / Gentle Sparkles (Cinematic Pentatonic)
  private scheduleSparkleMelody() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    // Peaceful pentatonic sparkle notes in D major
    const sparkleNotes = [
      440.00, // A4
      493.88, // B4
      554.37, // C#5
      587.33, // D5
      659.25, // E5
      739.99, // F#5
      880.00, // A5
      987.77  // B5
    ];

    const playSparkle = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const randomNote = sparkleNotes[Math.floor(Math.random() * sparkleNotes.length)];
      const now = this.ctx.currentTime;
      const duration = 2.2;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const bellFilter = this.ctx.createBiquadFilter();

      bellFilter.type = 'bandpass';
      bellFilter.frequency.setValueAtTime(randomNote, now);
      bellFilter.Q.setValueAtTime(3.0, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, now);

      // Bell chime pluck envelope (Fast attack, gentle exponential decay)
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.022, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(bellFilter);
      bellFilter.connect(noteGain);
      noteGain.connect(this.masterGain);

      if (this.delayNode) {
        noteGain.connect(this.delayNode);
      }

      osc.start(now);
      osc.stop(now + duration + 0.2);

      // Random gentle timing between 1.2s and 2.6s
      const nextDelay = 1200 + Math.random() * 1400;
      this.arpeggioTimer = setTimeout(playSparkle, nextDelay);
    };

    // First sparkle after 1s
    this.arpeggioTimer = setTimeout(playSparkle, 1000);
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.chordTimer) clearTimeout(this.chordTimer);
    if (this.arpeggioTimer) clearTimeout(this.arpeggioTimer);

    if (this.masterGain && this.ctx) {
      try {
        // Smooth 0.8s fade out
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
          }
        }, 900);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export const ambientMusic = new AmbientMusicEngine();
export default ambientMusic;
