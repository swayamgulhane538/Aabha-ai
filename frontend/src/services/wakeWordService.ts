export class WakeWordService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  startWakeWordDetection(onWakeWord: () => void) {
    if (!this.recognition) return;
    this.isListening = true;
    
    this.recognition.onresult = (event: any) => {
      const latestResult = event.results[event.results.length - 1];
      const transcript = latestResult[0].transcript.toLowerCase();
      if (transcript.includes('aabha') || transcript.includes('aba') || transcript.includes('abha')) {
        onWakeWord();
      }
    };
    
    this.recognition.onend = () => {
        if(this.isListening) this.recognition.start();
    };

    this.recognition.start();
  }

  stopWakeWordDetection() {
    this.isListening = false;
    if (this.recognition) this.recognition.stop();
  }
}

export const wakeWordService = new WakeWordService();
