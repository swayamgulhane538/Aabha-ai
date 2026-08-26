class SpeechService {
  private synthesis: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private recognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }

      if (this.synthesis) {
        this.loadVoices();
        if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices() || [];
  }

  public isSupported(): boolean {
    return true;
  }

  public normalizeLanguageCode(lang: string, text?: string): string {
    const raw = (lang || 'en').toLowerCase().split('-')[0];

    // If text contains native script, infer language if raw is generic
    if (text) {
      if (/[\u0900-\u097F]/.test(text)) {
        if (raw === 'mr') return 'mr-IN';
        return 'hi-IN';
      }
      if (/[\u0980-\u09FF]/.test(text)) return raw === 'as' ? 'as-IN' : 'bn-IN';
      if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
      if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
      if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
      if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
      if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
      if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
    }

    const MAP: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      as: 'as-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      pa: 'pa-IN',
      ml: 'ml-IN',
      en: 'en-IN'
    };

    return MAP[raw] || (lang.includes('-') ? lang : 'en-IN');
  }

  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[*#_`~>]/g, '') // Strip markdown formatting
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
      .replace(/\s+/g, ' ')
      .trim();
  }

  startListening(onResult: (text: string) => void, onError: (err: any) => void, language = 'hi-IN') {
    if (typeof window === 'undefined') return onError('SSR');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return onError('Speech Recognition not supported in this browser');

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch {}
      }
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.normalizeLanguageCode(language);

      this.recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
      };

      this.recognition.onerror = (err: any) => {
        if (err.error === 'no-speech') {
          onError('no-speech');
        } else {
          onError(err);
        }
      };

      this.recognition.start();
    } catch (e) {
      onError(e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  speak(text: string, language = 'hi', onEnd?: () => void) {
    if (typeof window === 'undefined' || !text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const targetLang = this.normalizeLanguageCode(language, cleanText);
    const langPrefix = targetLang.split('-')[0];

    // Priority 1: Try Neural Audio Stream Proxy
    const truncated = cleanText.slice(0, 350);
    const audioUrl = `/api/ai/tts?text=${encodeURIComponent(truncated)}&lang=${encodeURIComponent(langPrefix)}`;
    const audio = new Audio();
    audio.src = audioUrl;
    audio.volume = 1.0;
    this.currentAudio = audio;

    let hasEnded = false;
    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        this.currentAudio = null;
        if (onEnd) onEnd();
      }
    };

    audio.onended = safeEnd;

    audio.onerror = () => {
      // Fallback to Web Speech Synthesis if audio fails
      this.fallbackBrowserSpeech(cleanText, targetLang, langPrefix, safeEnd);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Speech Synthesis if play was rejected
        this.fallbackBrowserSpeech(cleanText, targetLang, langPrefix, safeEnd);
      });
    }
  }

  private fallbackBrowserSpeech(cleanText: string, targetLang: string, langPrefix: string, onEnd: () => void) {
    if (!this.synthesis) {
      onEnd();
      return;
    }

    try {
      this.synthesis.cancel();
      this.synthesis.resume();

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const matchVoice = this.voices.find(
        v => v.lang.toLowerCase() === targetLang.toLowerCase() ||
             v.lang.toLowerCase().startsWith(langPrefix)
      );

      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onend = onEnd;
      utterance.onerror = onEnd;

      this.synthesis.speak(utterance);
    } catch {
      onEnd();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      try { this.synthesis.cancel(); } catch {}
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
  }
}

export const speechService = new SpeechService();
