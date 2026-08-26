// Ambient background wellness music generator using Web Audio API
// Generates a soft, soothing ambient chord progression (Cmaj7 - Am7 - Fmaj7 - G)
// at low volume (~8%) to play peacefully behind voice narration.

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timerId: any = null;

  public start(volume: number = 0.07) {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      this.isPlaying = true;
      this.playChordProgression();
    } catch (e) {
      console.warn('Ambient music failed to initialize', e);
    }
  }

  private playChordProgression() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;

    // Peaceful chords in Hz
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.0, 261.63, 329.63, 392.0],  // Am7 (A3, C4, E4, G4)
      [174.61, 220.0, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [196.0, 246.94, 293.66, 392.0]   // G7 (G3, B3, D4, G4)
    ];

    let chordIndex = 0;

    const playNext = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;

      const chord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const duration = 4.5; // seconds per chord

      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Warm low-pass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650 + idx * 50, now);

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack & release envelope
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + duration + 0.2);
      });

      this.timerId = setTimeout(playNext, (duration - 0.4) * 1000);
    };

    playNext();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }
}

export const ambientMusic = new AmbientMusicEngine();
