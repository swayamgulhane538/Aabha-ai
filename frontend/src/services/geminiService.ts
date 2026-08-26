import { GoogleGenerativeAI } from '@google/generative-ai';

const LOCAL_STORAGE_KEY = 'aabha_gemini_api_key';

export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string = '';
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      if (stored) {
        this.setApiKey(stored);
      }
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (typeof window !== 'undefined') {
      if (this.apiKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, this.apiKey);
        this.genAI = new GoogleGenerativeAI(this.apiKey);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        this.genAI = null;
      }
    }
  }

  public async testConnection(key?: string): Promise<{ success: boolean; message: string }> {
    const testKey = key || this.apiKey;
    if (!testKey || testKey.trim().length < 5) {
      return { success: false, message: 'Please enter a valid Google Gemini API Key' };
    }

    try {
      const client = new GoogleGenerativeAI(testKey.trim());
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Say: AABHA AI Connected to Gemini successfully.');
      const responseText = result.response.text();
      return {
        success: true,
        message: responseText.trim() || 'Gemini Connected successfully!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to connect to Google Gemini API. Please check your API key.'
      };
    }
  }

  public async generateChatResponse(
    message: string,
    contextInfo: string = '',
    language: string = 'en'
  ): Promise<string | null> {
    if (!this.genAI) return null;

    try {
      const systemInstruction = `You are AABHA AI, a calm, caring, and empathetic cognitive health companion designed for Indian families, patients, seniors, and caregivers. Speak simply and clearly in short sentences. Understand Hindi, Marathi, Bengali, Assamese, and English naturally. Never diagnose medical conditions. If emergency, urge contacting healthcare/SOS. Provide structured, encouraging, and zero-hallucination responses.\nContext: ${contextInfo}\nLanguage: ${language}`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });

      const result = await model.generateContent(message);
      return result.response.text().trim();
    } catch (e) {
      console.warn('Client-side Gemini call failed, falling back to backend/rule engine:', e);
      return null;
    }
  }
}

export const geminiService = GeminiService.getInstance();
export default geminiService;
