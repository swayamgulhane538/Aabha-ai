/**
 * SignBridge – Doctor Speech-to-Text (STT) Service
 * 
 * Captures natural speech from the doctor in English, Hindi, or Hinglish,
 * emitting interim and final text for language processing and ISL translation.
 */

export interface SpeechRecognitionCallbacks {
  onInterimText?: (text: string) => void;
  onFinalText?: (text: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

class SpeechToTextService {
  private recognition: any = null;
  private isListening: boolean = false;
  private callbacks: SpeechRecognitionCallbacks = {};
  private currentLanguage: string = 'en-IN';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript.trim() && this.callbacks.onInterimText) {
          this.callbacks.onInterimText(interimTranscript.trim());
        }

        if (finalTranscript.trim() && this.callbacks.onFinalText) {
          this.callbacks.onFinalText(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[STT] Speech recognition notice:', event.error);
        if (this.callbacks.onError) {
          this.callbacks.onError(event.error || 'Speech recognition encountered an issue.');
        }
        this.isListening = false;
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange(false);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange(false);
        }
      };
    }
  }

  public setCallbacks(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  public setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) return false;

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(true);
      }
      return true;
    } catch (err) {
      console.warn('[STT] Could not start speech recognition:', err);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(false);
      }
    }
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechToTextService = new SpeechToTextService();
