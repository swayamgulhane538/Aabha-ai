// Audio Synthesizer for Customizable Alarm Ringtones using Web Audio API
// Works 100% offline, on mobile and desktop browsers with zero external file dependencies.

export type RingtoneId = 'temple_bell' | 'gentle_flute' | 'nature_birds' | 'zen_chime' | 'classic_alarm';

export interface RingtoneOption {
  id: RingtoneId;
  name: string;
  nameHi: string;
  emoji: string;
  description: string;
}

export const RINGTONE_OPTIONS: RingtoneOption[] = [
  {
    id: 'temple_bell',
    name: 'Temple Bell',
    nameHi: 'मंदिर की घंटी (Temple Bell)',
    emoji: '🔔',
    description: 'Deep, peaceful resonant chime'
  },
  {
    id: 'gentle_flute',
    name: 'Morning Flute',
    nameHi: 'मधुर बांसुरी (Morning Flute)',
    emoji: '🎶',
    description: 'Calm melodic flute notes'
  },
  {
    id: 'nature_birds',
    name: 'Nature Birds',
    nameHi: 'चिड़ियों की चहचहाहट (Nature Birds)',
    emoji: '🐦',
    description: 'Refreshing morning nature harmony'
  },
  {
    id: 'zen_chime',
    name: 'Peaceful Zen',
    nameHi: 'शांत धुन (Peaceful Zen)',
    emoji: '🌸',
    description: 'Soft harmonic soothing tones'
  },
  {
    id: 'classic_alarm',
    name: 'Clear Beep Alarm',
    nameHi: 'क्लासिक अलार्म (Clear Beep)',
    emoji: '⏰',
    description: 'Rhythmic clear acoustic alert'
  }
];

class AlarmAudioService {
  private ctx: AudioContext | null = null;
  private isLooping = false;
  private loopTimeout: any = null;
  private currentRingtone: RingtoneId = 'temple_bell';

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single iteration of a ringtone melody
  playMelody(ringtone: RingtoneId = 'temple_bell', volume = 0.8): number {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (ringtone) {
        case 'temple_bell': {
          // Deep resonant bell with harmonics (528 Hz Love/Healing Solfeggio freq)
          const freqs = [528, 1056, 1584];
          freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime((volume / (i + 1)) * 0.7, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 3.0);
          });
          return 3200; // Duration in ms
        }

        case 'gentle_flute': {
          // Indian classical Raag melodic sequence (Sa - Re - Ga - Pa - Dha)
          const notes = [
            { freq: 440.0, time: 0, dur: 0.4 },     // A4
            { freq: 493.88, time: 0.35, dur: 0.4 },  // B4
            { freq: 554.37, time: 0.7, dur: 0.5 },   // C#5
            { freq: 659.25, time: 1.15, dur: 0.6 },  // E5
            { freq: 554.37, time: 1.7, dur: 0.9 },   // C#5
          ];

          notes.forEach(({ freq, time, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + time);

            gain.gain.setValueAtTime(0, now + time);
            gain.gain.linearRampToValueAtTime(volume * 0.6, now + time + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + dur + 0.1);
          });
          return 2800;
        }

        case 'nature_birds': {
          // High pitch chirps + gentle background chord
          for (let i = 0; i < 4; i++) {
            const chirpTime = now + i * 0.45;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';

            osc.frequency.setValueAtTime(1800 + i * 200, chirpTime);
            osc.frequency.exponentialRampToValueAtTime(2600 + i * 150, chirpTime + 0.12);
            osc.frequency.exponentialRampToValueAtTime(1400, chirpTime + 0.25);

            gain.gain.setValueAtTime(0, chirpTime);
            gain.gain.linearRampToValueAtTime(volume * 0.5, chirpTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(chirpTime);
            osc.stop(chirpTime + 0.3);
          }
          return 2200;
        }

        case 'zen_chime': {
          // Pentatonic warm chime chord
          const freqs = [392.0, 440.0, 523.25, 659.25]; // G4, A4, C5, E5
          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const offset = idx * 0.2;
            osc.frequency.setValueAtTime(f, now + offset);

            gain.gain.setValueAtTime(0, now + offset);
            gain.gain.linearRampToValueAtTime(volume * 0.5, now + offset + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 2.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 2.3);
          });
          return 3000;
        }

        case 'classic_alarm':
        default: {
          // Double beep rhythmic alarm
          const beeps = [0, 0.25, 0.6, 0.85];
          beeps.forEach(t => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now + t); // A5

            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(volume * 0.4, now + t + 0.02);
            gain.gain.setValueAtTime(volume * 0.4, now + t + 0.12);
            gain.gain.linearRampToValueAtTime(0, now + t + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + t);
            osc.stop(now + t + 0.18);
          });
          return 1600;
        }
      }
    } catch (e) {
      console.warn('Audio synthesis error:', e);
      return 2000;
    }
  }

  // Preview sound once
  preview(ringtone: RingtoneId) {
    this.stop();
    this.playMelody(ringtone, 0.8);
  }

  // Start continuous alarm ringing (with mobile vibration)
  startAlarm(ringtone: RingtoneId = 'temple_bell') {
    this.stop();
    this.isLooping = true;
    this.currentRingtone = ringtone;

    // Mobile vibration pattern (500ms vibrate, 300ms pause)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([600, 300, 600, 300, 1000]);
      } catch {}
    }

    const runLoop = () => {
      if (!this.isLooping) return;
      const duration = this.playMelody(this.currentRingtone, 0.9);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([500, 250, 500]);
        } catch {}
      }

      this.loopTimeout = setTimeout(() => {
        if (this.isLooping) runLoop();
      }, duration + 300);
    };

    runLoop();
  }

  // Stop the alarm sound and vibration
  stop() {
    this.isLooping = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }
}

export const alarmAudioService = new AlarmAudioService();
