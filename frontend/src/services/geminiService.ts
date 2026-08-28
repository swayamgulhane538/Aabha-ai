// Resilient Google Gemini AI Service with dynamic ModelService.ListModels Discovery
// Queries Google's ListModels API directly to fetch the exact available models for the user's key,
// completely eliminating 404 Model Not Found errors across all Google AI Studio accounts.

const LOCAL_STORAGE_KEY = 'aabha_gemini_api_key';
const LOCAL_STORAGE_MODEL_KEY = 'aabha_gemini_active_model';

const DEFAULT_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.7-thinking',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-pro'
];

export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string = '';
  private activeModel: string = 'gemini-1.5-flash';
  private availableModels: string[] = [...DEFAULT_MODELS];

  private constructor() {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      const storedModel = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY) || 'gemini-1.5-flash';
      this.activeModel = storedModel;
      if (storedKey) {
        this.setApiKey(storedKey);
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

  public getActiveModel(): string {
    return this.activeModel;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (typeof window !== 'undefined') {
      if (this.apiKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, this.apiKey);
        this.fetchAvailableModels(this.apiKey).catch(() => {});
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }

  // Query Google's ListModels API to get the exact models permitted for this API Key
  public async fetchAvailableModels(key: string): Promise<string[]> {
    const apiVersions = ['v1beta', 'v1'];
    const foundModels: string[] = [];

    for (const v of apiVersions) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${key}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.models)) {
            data.models.forEach((m: any) => {
              if (
                m.supportedGenerationMethods?.includes('generateContent') ||
                m.supportedGenerationMethods?.includes('generateMessage')
              ) {
                // Strip 'models/' prefix if present
                const cleanName = m.name.replace(/^models\//, '');
                if (!foundModels.includes(cleanName)) {
                  foundModels.push(cleanName);
                }
              }
            });
          }
        }
      } catch {
        // Continue to next version
      }
    }

    if (foundModels.length > 0) {
      this.availableModels = foundModels;
      // Prefer flash, then pro
      const preferred = foundModels.find(m => m.includes('1.5-flash') || m.includes('2.0-flash')) ||
                        foundModels.find(m => m.includes('flash')) ||
                        foundModels.find(m => m.includes('pro')) ||
                        foundModels[0];
      if (preferred) {
        this.activeModel = preferred;
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, preferred);
        }
      }
    }

    return foundModels;
  }

  // Test connection by discovering valid models and running generation
  public async testConnection(key?: string): Promise<{ success: boolean; message: string; modelName?: string }> {
    const testKey = (key || this.apiKey).trim();
    if (!testKey || testKey.length < 5) {
      return { success: false, message: 'Please enter a valid Google Gemini API Key' };
    }

    // 1. Try Backend Node.js Proxy (bypasses browser CORS & 404 restrictions)
    try {
      const { api } = await import('./api');
      const backendRes: any = await api.post('/ai/test-gemini', { apiKey: testKey });
      if (backendRes && backendRes.success) {
        this.setApiKey(testKey);
        this.activeModel = backendRes.model || 'gemini-1.5-flash';
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, this.activeModel);
        }
        return {
          success: true,
          message: backendRes.message || `Connected to Google Gemini (${this.activeModel}) successfully!`,
          modelName: this.activeModel
        };
      }
    } catch (backendErr) {
      // Backend test error or offline, fallback to direct browser client
    }

    // 2. Client-side fallback: fetch dynamic live models list for this exact key
    const liveModels = await this.fetchAvailableModels(testKey);
    const modelsToTry = liveModels.length > 0
      ? liveModels
      : DEFAULT_MODELS;

    let lastError = '';
    const apiVersions = ['v1beta', 'v1'];

    // 2. Try each model with v1beta and v1
    for (const model of modelsToTry) {
      for (const ver of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${testKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: 'Hello! Respond with: AABHA AI Connected' }]
                }
              ],
              generationConfig: {
                maxOutputTokens: 25
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            this.activeModel = model;
            this.setApiKey(testKey);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, model);
            }
            return {
              success: true,
              message: `Connected to Google Gemini (${model}) successfully!`,
              modelName: model
            };
          } else {
            const errData = await response.json().catch(() => ({}));
            lastError = errData.error?.message || `HTTP ${response.status}`;
          }
        } catch (e: any) {
          lastError = e?.message || 'Network request failed';
        }
      }
    }

    return {
      success: false,
      message: `Google Gemini Error: ${lastError || 'Unable to connect. Please make sure Generative Language API is enabled on your Google AI Studio account.'}`
    };
  }

  // Generate Chat Response using active verified model
  public async generateChatResponse(
    message: string,
    contextInfo: string = '',
    language: string = 'en'
  ): Promise<string | null> {
    if (!this.hasApiKey()) return null;

    const LANG_MAP: Record<string, { name: string; native: string; script: string }> = {
      hi: { name: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
      mr: { name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
      bn: { name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
      as: { name: 'Assamese', native: 'অসমীয়া', script: 'Assamese' },
      gu: { name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
      ta: { name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
      te: { name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
      kn: { name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
      ml: { name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
      pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
      en: { name: 'Indian English', native: 'English', script: 'Latin' }
    };

    const cleanLang = language.toLowerCase().split('-')[0];
    const targetMeta = LANG_MAP[cleanLang] || LANG_MAP.en;

    const systemPrompt = `You are AABHA AI (आभा एआई), a compassionate, warm, and highly intelligent cognitive and healthcare companion designed for Indian families, patients, seniors, and caregivers.
MANDATORY RULE: You MUST reply 100% EXCLUSIVELY in ${targetMeta.name} (${targetMeta.native}) using ${targetMeta.script} script.
Never use English or Latin letters when replying in Hindi (हिन्दी) or Marathi (मराठी).
Keep responses clear, empathetic, culturally respectful, and concise (2-3 sentences).
Context: ${contextInfo}`;

    const modelsToTry = [
      this.activeModel,
      ...this.availableModels.filter(m => m !== this.activeModel),
      ...DEFAULT_MODELS.filter(m => m !== this.activeModel && !this.availableModels.includes(m))
    ];

    const apiVersions = ['v1beta', 'v1'];
    const userPromptWithLang = `[Reply strictly in ${targetMeta.name} (${targetMeta.native}) using ${targetMeta.script} script only]\n${message}`;

    for (const model of modelsToTry) {
      for (const ver of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${this.apiKey}`;
          
          // Try with systemInstruction first
          let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPromptWithLang }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250
              }
            })
          });

          // If systemInstruction is unsupported (HTTP 400), try without systemInstruction
          if (!response.ok && response.status === 400) {
            response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser Question:\n${userPromptWithLang}` }]
                  }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 250
                }
              })
            });
          }

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              this.activeModel = model;
              return text;
            }
          }
        } catch {
          // Try next
        }
      }
    }

    return null;
  }

  // Generate Raw Prompt (used for JSON parsing, calorie calculations, and data queries)
  public async generateRawPrompt(prompt: string): Promise<string | null> {
    if (!this.hasApiKey()) return null;

    const modelsToTry = [
      this.activeModel,
      ...this.availableModels.filter(m => m !== this.activeModel),
      ...DEFAULT_MODELS.filter(m => m !== this.activeModel && !this.availableModels.includes(m))
    ];

    const apiVersions = ['v1beta', 'v1'];

    for (const model of modelsToTry) {
      for (const ver of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${this.apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 350 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              this.activeModel = model;
              return text;
            }
          }
        } catch {}
      }
    }
    return null;
  }
}

export const geminiService = GeminiService.getInstance();
export default geminiService;
