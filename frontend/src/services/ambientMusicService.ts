// Ambient Background Music Engine using the requested YouTube Royalty-Free Music Track
// Video Source: https://youtu.be/IibDkSDNL3Y ("ROYALTY FREE Business Background Music | Corporate Promo Music")
// Uses HTML5 Audio with multiple format sources (/audio/youtube_bgm.webm & /audio/youtube_bgm.m4a) + procedural fallback.

export interface MusicTrackInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export const MUSIC_TRACKS: MusicTrackInfo[] = [
  {
    id: 'youtube_bgm',
    name: 'Royalty Free Corporate Promo Music',
    shortName: '🎵 Corporate Promo (YouTube)',
    description: 'Upbeat, professional corporate promo background music (YouTube: IibDkSDNL3Y)',
    icon: '🎵'
  }
];

class AmbientMusicEngine {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 0.28; // Balanced background music level (28%)

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    try {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.currentVolume;
      this.audioElement.preload = 'auto';

      // Prefer webm / opus, fallback to m4a
      if (this.audioElement.canPlayType('audio/webm; codecs="opus"')) {
        this.audioElement.src = '/audio/youtube_bgm.webm';
      } else {
        this.audioElement.src = '/audio/youtube_bgm.m4a';
      }

      // Add fallback error handler
      this.audioElement.onerror = () => {
        if (this.audioElement && this.audioElement.src.endsWith('.webm')) {
          this.audioElement.src = '/audio/youtube_bgm.m4a';
          if (this.isPlaying) {
            this.audioElement.play().catch(() => {});
          }
        }
      };
    } catch (e) {
      console.warn('Audio element init error', e);
    }
  }

  // Ensure Audio plays on any user touch/click (browser autoplay unlock)
  public ensureAudioContext() {
    if (this.isPlaying && this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(() => {});
    }
  }

  public getActiveTrack(): MusicTrackInfo {
    return MUSIC_TRACKS[0];
  }

  public cycleNextTrack(): MusicTrackInfo {
    return MUSIC_TRACKS[0];
  }

  // Start background music
  public start(volume: number = 0.28) {
    this.currentVolume = volume;
    this.isPlaying = true;

    try {
      this.initAudioElement();

      if (this.audioElement) {
        this.audioElement.volume = Math.min(1.0, Math.max(0.05, this.currentVolume));
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay delayed until user touch/click
            const unlockHandler = () => {
              if (this.isPlaying && this.audioElement) {
                this.audioElement.play().catch(() => {});
              }
              window.removeEventListener('click', unlockHandler);
              window.removeEventListener('touchstart', unlockHandler);
            };
            window.addEventListener('click', unlockHandler, { once: true });
            window.addEventListener('touchstart', unlockHandler, { once: true });
          });
        }
      }
    } catch (e) {
      console.warn('Audio start error', e);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.audioElement) {
      this.audioElement.volume = Math.min(1.0, Math.max(0.05, volume));
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientMusic = new AmbientMusicEngine();
export default ambientMusic;
