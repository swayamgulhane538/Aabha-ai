// Cinematic Multi-Track Ambient Wellness Music Engine using Web Audio API
// Supports 3 Distinct High-Quality Music Soundtracks:
// - Track 1: Gentle Piano & Bell Chimes (Emotional Piano)
// - Track 2: Acoustic Morning Strings & Indian Bansuri Flute (Calm Sunrise Raag - RECOMMENDED)
// - Track 3: Deep Zen Mindfulness Meditation (Soothing Alpha Waves)

export type MusicTrackId = 'track1' | 'track2' | 'track3';

export interface MusicTrackInfo {
  id: MusicTrackId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export const MUSIC_TRACKS: MusicTrackInfo[] = [
  {
    id: 'track2',
    name: 'Acoustic Flute & Morning Strings',
    shortName: '🎵 2. Flute & Strings',
    description: 'Calm morning acoustic guitar arpeggios with soothing bansuri flute phrases',
    icon: '🪈'
  },
  {
    id: 'track1',
    name: 'Cinematic Piano & Bell Chimes',
    shortName: '🎵 1. Piano Chimes',
    description: 'Soft emotional piano with gentle bell sparkle harmonies',
    icon: '🎹'
  },
  {
    id: 'track3',
    name: 'Deep Zen Wellness Pad',
    shortName: '🎵 3. Zen Meditation',
    description: 'Warm ocean pad chords for deep calmness and focus',
    icon: '🧘'
  }
];

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private mainTimer: any = null;
  private melodyTimer: any = null;
  private currentVolume: number = 0.08;
  private activeTrackId: MusicTrackId = 'track2'; // Default to 2nd track!

  public start(volume: number = 0.08, trackId: MusicTrackId = 'track2') {
    if (this.isPlaying) {
      if (this.activeTrackId !== trackId) {
        this.switchTrack(trackId);
      }
      return;
    }

    this.currentVolume = volume;
    this.activeTrackId = trackId;

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
      this.masterGain.gain.exponentialRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 2.0);
      this.masterGain.connect(this.ctx.destination);

      // Stereo Space Delay / Reverb simulation
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.32, this.ctx.currentTime);

      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      this.delayNode.connect(delayFilter);
      delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.masterGain);

      this.isPlaying = true;
      this.startTrackEngine();
    } catch (e) {
      console.warn('Ambient music failed to initialize', e);
    }
  }

  private clearAllTimers() {
    if (this.mainTimer) clearTimeout(this.mainTimer);
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
    this.mainTimer = null;
    this.melodyTimer = null;
  }

  public switchTrack(trackId: MusicTrackId) {
    this.activeTrackId = trackId;
    if (this.isPlaying) {
      this.clearAllTimers();
      this.startTrackEngine();
    }
  }

  public getActiveTrack(): MusicTrackInfo {
    return MUSIC_TRACKS.find(t => t.id === this.activeTrackId) || MUSIC_TRACKS[0];
  }

  public cycleNextTrack(): MusicTrackInfo {
    const currentIdx = MUSIC_TRACKS.findIndex(t => t.id === this.activeTrackId);
    const nextTrack = MUSIC_TRACKS[(currentIdx + 1) % MUSIC_TRACKS.length];
    this.switchTrack(nextTrack.id);
    return nextTrack;
  }

  private startTrackEngine() {
    if (this.activeTrackId === 'track2') {
      this.startTrack2AcousticFlute();
    } else if (this.activeTrackId === 'track1') {
      this.startTrack1PianoChimes();
    } else {
      this.startTrack3ZenMeditation();
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🪈 TRACK 2: ACOUSTIC MORNING STRINGS & INDIAN BANSURI FLUTE (RAAG YAMAN/BHUPALI)
  // ══════════════════════════════════════════════════════════════════════════
  private startTrack2AcousticFlute() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    // Peaceful Acoustic Drone (Tanpura/Strings harmony in D Major: D3, A3, D4, F#4)
    const acousticChords = [
      [146.83, 220.00, 293.66, 369.99], // D maj (D, A, D, F#)
      [164.81, 220.00, 293.66, 392.00], // G/D (E, A, D, G)
      [123.47, 185.00, 293.66, 369.99], // Bm (B, F#, D, F#)
      [110.00, 164.81, 220.00, 277.18]  // A maj (A, E, A, C#)
    ];

    let chordIdx = 0;

    const playAcousticChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.activeTrackId !== 'track2') return;

      const chord = acousticChords[chordIdx % acousticChords.length];
      chordIdx++;
      const now = this.ctx.currentTime;
      const duration = 6.0;

      // Warm acoustic string pad
      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + i * 90, now);

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const targetGain = 0.04 / (i + 1);
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(targetGain, now + 1.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.4);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        if (this.delayNode && i >= 2) noteGain.connect(this.delayNode);

        osc.start(now);
        osc.stop(now + duration + 0.6);
      });

      this.mainTimer = setTimeout(playAcousticChord, (duration - 0.8) * 1000);
    };

    playAcousticChord();

    // Bansuri Flute Melodic Phrases (Raag Bhupali Pentatonic: Sa, Re, Ga, Pa, Dha -> D, E, F#, A, B)
    const fluteNotes = [
      293.66, // Sa (D4)
      329.63, // Re (E4)
      369.99, // Ga (F#4)
      440.00, // Pa (A4)
      493.88, // Dha (B4)
      587.33, // Taar Sa (D5)
      659.25, // Taar Re (E5)
      739.99  // Taar Ga (F#5)
    ];

    const playFluteNote = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.activeTrackId !== 'track2') return;

      const randomFreq = fluteNotes[Math.floor(Math.random() * fluteNotes.length)];
      const now = this.ctx.currentTime;
      const noteDuration = 2.4;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const fluteFilter = this.ctx.createBiquadFilter();

      // Soft breathy flute filter with slight resonant warm peak
      fluteFilter.type = 'bandpass';
      fluteFilter.frequency.setValueAtTime(randomFreq * 1.5, now);
      fluteFilter.Q.setValueAtTime(1.8, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, now);

      // Subtle breath vibrato
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(5.2, now); // 5.2 Hz gentle vibrato
      vibratoGain.gain.setValueAtTime(2.5, now);
      vibrato.connect(osc.frequency);
      vibrato.start(now + 0.4);
      vibrato.stop(now + noteDuration);

      // Soft breathy flute envelope
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.024, now + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

      osc.connect(fluteFilter);
      fluteFilter.connect(noteGain);
      noteGain.connect(this.masterGain);

      if (this.delayNode) noteGain.connect(this.delayNode);

      osc.start(now);
      osc.stop(now + noteDuration + 0.2);

      const nextNoteTime = 1400 + Math.random() * 1600;
      this.melodyTimer = setTimeout(playFluteNote, nextNoteTime);
    };

    this.melodyTimer = setTimeout(playFluteNote, 800);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🎹 TRACK 1: GENTLE PIANO & BELL CHIMES
  // ══════════════════════════════════════════════════════════════════════════
  private startTrack1PianoChimes() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0]   // G7
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.activeTrackId !== 'track1') return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      const now = this.ctx.currentTime;
      const duration = 5.2;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500 + i * 80, now);

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        if (this.delayNode && i >= 2) noteGain.connect(this.delayNode);

        osc.start(now);
        osc.stop(now + duration + 0.3);
      });

      this.mainTimer = setTimeout(playChord, (duration - 0.5) * 1000);
    };

    playChord();

    // Bell chime plucks
    const bells = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const playBell = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.activeTrackId !== 'track1') return;

      const freq = bells[Math.floor(Math.random() * bells.length)];
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.02, now + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);
      if (this.delayNode) noteGain.connect(this.delayNode);

      osc.start(now);
      osc.stop(now + 2.1);

      this.melodyTimer = setTimeout(playBell, 1800 + Math.random() * 1800);
    };

    this.melodyTimer = setTimeout(playBell, 1000);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🧘 TRACK 3: DEEP ZEN WELLNESS PAD
  // ══════════════════════════════════════════════════════════════════════════
  private startTrack3ZenMeditation() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const zenChords = [
      [110.00, 164.81, 220.00, 329.63], // A minor add9
      [130.81, 196.00, 261.63, 392.00], // C major add9
      [146.83, 220.00, 293.66, 440.00]  // D sus2
    ];

    let chordIdx = 0;

    const playZen = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.activeTrackId !== 'track3') return;

      const chord = zenChords[chordIdx % zenChords.length];
      chordIdx++;
      const now = this.ctx.currentTime;
      const duration = 7.0;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + i * 60, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.045 / (i + 1), now + 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.5);
      });

      this.mainTimer = setTimeout(playZen, (duration - 1.0) * 1000);
    };

    playZen();
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.clearAllTimers();

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
          }
        }, 700);
      } catch {
        // Ignore
      }
    }
  }
}

export const ambientMusic = new AmbientMusicEngine();
export default ambientMusic;
