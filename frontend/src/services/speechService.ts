class SpeechService {
  private synthesis: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private recognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];

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
    return !!this.synthesis;
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
      en: 'en-IN'
    };

    return MAP[raw] || (lang.includes('-') ? lang : 'en-IN');
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

  speak(text: string, language = 'hi-IN', onEnd?: () => void) {
    if (!this.synthesis || typeof window === 'undefined') return;

    try {
      this.synthesis.cancel(); // Stop any pending speech

      const targetLang = this.normalizeLanguageCode(language, text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      // Find the best voice matching targetLang or its language prefix
      const prefix = targetLang.split('-')[0];
      const matchVoice =
        this.voices.find(v => v.lang === targetLang) ||
        this.voices.find(v => v.lang.startsWith(prefix)) ||
        this.voices.find(v => v.lang.toLowerCase().includes(prefix)) ||
        this.voices.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('hindi')) ||
        null;

      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService Speak Error]', err);
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
