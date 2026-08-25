class SpeechService {
  private synthesis = window.speechSynthesis;
  private recognition: any = null;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  isSupported() {
    return !!this.recognition && !!this.synthesis;
  }

  startListening(onResult: (text: string) => void, onError: (err: any) => void, language = 'en-US') {
    if (!this.recognition) return onError('Not supported');
    this.recognition.lang = language;
    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    this.recognition.onerror = onError;
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) this.recognition.stop();
  }

  speak(text: string, language = 'en-US', onEnd?: () => void) {
    if (!this.synthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    if (onEnd) utterance.onend = onEnd;
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) this.synthesis.cancel();
  }
}

export const speechService = new SpeechService();
