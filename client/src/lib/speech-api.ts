// Declare speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  isAvailable(): boolean {
    return this.isSupported && this.recognition !== null;
  }

  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const result = event.results[0];
        if (result.isFinal) {
          resolve(result[0].transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis.getVoices();
      };
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; voice?: string } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;

      // Find the best voice
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        const preferredVoice = this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stop() {
    this.synthesis.cancel();
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}
