import { geminiService } from './geminiService';
import { api } from './api';

export interface CalorieItem {
  id: string;
  name: string;
  nameHindi: string;
  portion: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG?: number;
  brainRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'AVOID';
  source: 'PRESCRIBED' | 'AI_GOOGLE' | 'MANUAL';
  timestamp: string;
}

export interface DailyCalorieSummary {
  date: string;
  targetKcal: number;
  consumedKcal: number;
  burnedKcal: number;
  remainingKcal: number;
  proteinTotalG: number;
  carbsTotalG: number;
  fatsTotalG: number;
  items: CalorieItem[];
}

const STORAGE_KEY = 'aabha_calorie_tracker_v2';
const DEFAULT_TARGET_KCAL = 1750;

// Comprehensive Nutrition Database (Calibrated for Senior & Indian Diets)
const NUTRITION_DATABASE: Record<string, { kcal: number; protein: number; carbs: number; fats: number; fiber: number; rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'AVOID'; hindi: string }> = {
  // Breads & Grains
  'roti': { kcal: 104, protein: 3.1, carbs: 18.5, fats: 1.2, fiber: 2.8, rating: 'GOOD', hindi: 'गेहूं की रोटी' },
  'chapati': { kcal: 104, protein: 3.1, carbs: 18.5, fats: 1.2, fiber: 2.8, rating: 'GOOD', hindi: 'चपाती' },
  'jowar roti': { kcal: 120, protein: 3.8, carbs: 22.0, fats: 1.5, fiber: 3.5, rating: 'EXCELLENT', hindi: 'ज्वार की रोटी' },
  'bajra roti': { kcal: 135, protein: 4.2, carbs: 24.0, fats: 2.0, fiber: 4.0, rating: 'EXCELLENT', hindi: 'बाजरे की रोटी' },
  'paratha': { kcal: 220, protein: 4.5, carbs: 28.0, fats: 10.0, fiber: 2.5, rating: 'MODERATE', hindi: 'पराठा' },
  'plain rice': { kcal: 130, protein: 2.7, carbs: 28.2, fats: 0.3, fiber: 0.4, rating: 'MODERATE', hindi: 'सादे चावल (1 कटोरी)' },
  'brown rice': { kcal: 111, protein: 2.6, carbs: 23.0, fats: 0.9, fiber: 1.8, rating: 'EXCELLENT', hindi: 'ब्राउन राइस (1 कटोरी)' },
  'khichdi': { kcal: 215, protein: 7.2, carbs: 36.0, fats: 4.5, fiber: 3.8, rating: 'EXCELLENT', hindi: 'मूंग दाल खिचड़ी (1 कटोरी)' },
  'oats': { kcal: 150, protein: 5.5, carbs: 27.0, fats: 2.5, fiber: 4.0, rating: 'EXCELLENT', hindi: 'दलिया / ओट्स (1 कटोरी)' },
  'oatmeal': { kcal: 150, protein: 5.5, carbs: 27.0, fats: 2.5, fiber: 4.0, rating: 'EXCELLENT', hindi: 'ओट्स' },
  'poha': { kcal: 250, protein: 4.8, carbs: 42.0, fats: 6.5, fiber: 2.5, rating: 'GOOD', hindi: 'पोहा (1 प्लेट)' },
  'upma': { kcal: 210, protein: 5.0, carbs: 34.0, fats: 6.0, fiber: 2.2, rating: 'GOOD', hindi: 'उपमा (1 प्लेट)' },
  'idli': { kcal: 65, protein: 2.0, carbs: 13.5, fats: 0.2, fiber: 0.8, rating: 'EXCELLENT', hindi: 'इडली (1 नग)' },
  'dosa': { kcal: 168, protein: 3.9, carbs: 29.0, fats: 3.7, fiber: 1.2, rating: 'GOOD', hindi: 'प्लेन डोसा (1 नग)' },

  // Dals & Curries
  'dal': { kcal: 145, protein: 8.5, carbs: 20.0, fats: 3.2, fiber: 4.5, rating: 'EXCELLENT', hindi: 'दाल (1 कटोरी)' },
  'palak dal': { kcal: 155, protein: 9.0, carbs: 19.0, fats: 3.5, fiber: 5.2, rating: 'EXCELLENT', hindi: 'पालक दाल (1 कटोरी)' },
  'moong dal': { kcal: 140, protein: 9.2, carbs: 19.5, fats: 2.8, fiber: 4.8, rating: 'EXCELLENT', hindi: 'मूंग दाल (1 कटोरी)' },
  'sambar': { kcal: 130, protein: 4.5, carbs: 18.0, fats: 4.0, fiber: 3.5, rating: 'EXCELLENT', hindi: 'सांभर (1 कटोरी)' },
  'paneer': { kcal: 265, protein: 18.3, carbs: 3.2, fats: 20.8, fiber: 0.0, rating: 'GOOD', hindi: 'पनीर (100 ग्राम)' },
  'paneer bhurji': { kcal: 210, protein: 14.0, carbs: 6.0, fats: 14.5, fiber: 1.5, rating: 'GOOD', hindi: 'पनीर भुर्जी (1 कटोरी)' },
  'curd': { kcal: 98, protein: 3.5, carbs: 4.7, fats: 4.3, fiber: 0.0, rating: 'EXCELLENT', hindi: 'दही (1 कटोरी)' },
  'dahi': { kcal: 98, protein: 3.5, carbs: 4.7, fats: 4.3, fiber: 0.0, rating: 'EXCELLENT', hindi: 'दही' },
  'buttermilk': { kcal: 45, protein: 2.2, carbs: 3.5, fats: 1.2, fiber: 0.0, rating: 'EXCELLENT', hindi: 'छाछ / ताक (1 गिलास)' },
  'chaas': { kcal: 45, protein: 2.2, carbs: 3.5, fats: 1.2, fiber: 0.0, rating: 'EXCELLENT', hindi: 'छाछ' },

  // Vegetables
  'lauki': { kcal: 65, protein: 1.2, carbs: 11.0, fats: 1.8, fiber: 2.5, rating: 'EXCELLENT', hindi: 'लौकी की सब्जी (1 कटोरी)' },
  'spinach': { kcal: 45, protein: 3.0, carbs: 4.0, fats: 1.5, fiber: 3.0, rating: 'EXCELLENT', hindi: 'पालक की सब्जी (1 कटोरी)' },
  'bhindi': { kcal: 90, protein: 2.5, carbs: 12.0, fats: 3.8, fiber: 3.5, rating: 'GOOD', hindi: 'भिंडी की सब्जी (1 कटोरी)' },
  'mix veg': { kcal: 110, protein: 3.2, carbs: 14.0, fats: 4.5, fiber: 3.8, rating: 'EXCELLENT', hindi: 'मिक्स वेज सब्जी' },
  'salad': { kcal: 40, protein: 1.5, carbs: 7.0, fats: 0.5, fiber: 2.5, rating: 'EXCELLENT', hindi: 'हरा सलाद (खीरा, टमाटर, गाजर)' },

  // Fruits
  'apple': { kcal: 95, protein: 0.5, carbs: 25.0, fats: 0.3, fiber: 4.4, rating: 'EXCELLENT', hindi: 'सेब (1 मध्यम)' },
  'seb': { kcal: 95, protein: 0.5, carbs: 25.0, fats: 0.3, fiber: 4.4, rating: 'EXCELLENT', hindi: 'सेब' },
  'banana': { kcal: 105, protein: 1.3, carbs: 27.0, fats: 0.4, fiber: 3.1, rating: 'GOOD', hindi: 'केला (1 मध्यम)' },
  'kela': { kcal: 105, protein: 1.3, carbs: 27.0, fats: 0.4, fiber: 3.1, rating: 'GOOD', hindi: 'केला' },
  'papaya': { kcal: 60, protein: 0.9, carbs: 15.0, fats: 0.4, fiber: 2.5, rating: 'EXCELLENT', hindi: 'पपीता (1 कटोरी)' },
  'berries': { kcal: 70, protein: 1.0, carbs: 14.0, fats: 0.5, fiber: 3.5, rating: 'EXCELLENT', hindi: 'जामुन / ब्लूबेरी (1 कटोरी)' },
  'orange': { kcal: 62, protein: 1.2, carbs: 15.4, fats: 0.2, fiber: 3.1, rating: 'EXCELLENT', hindi: 'संतरा (1 मध्यम)' },
  'pomegranate': { kcal: 130, protein: 2.2, carbs: 29.0, fats: 1.6, fiber: 5.5, rating: 'EXCELLENT', hindi: 'अनार (1 कटोरी)' },

  // Nuts & Superfoods
  'walnuts': { kcal: 185, protein: 4.3, carbs: 3.9, fats: 18.5, fiber: 1.9, rating: 'EXCELLENT', hindi: 'अखरोट (4 नग)' },
  'akhrot': { kcal: 185, protein: 4.3, carbs: 3.9, fats: 18.5, fiber: 1.9, rating: 'EXCELLENT', hindi: 'अखरोट' },
  'almonds': { kcal: 160, protein: 6.0, carbs: 6.0, fats: 14.0, fiber: 3.5, rating: 'EXCELLENT', hindi: 'बादाम (7-8 नग)' },
  'badam': { kcal: 160, protein: 6.0, carbs: 6.0, fats: 14.0, fiber: 3.5, rating: 'EXCELLENT', hindi: 'बादाम' },
  'makhana': { kcal: 110, protein: 3.0, carbs: 22.0, fats: 0.5, fiber: 2.0, rating: 'EXCELLENT', hindi: 'भुने मखाने (1 कटोरी)' },
  'ghee': { kcal: 112, protein: 0.0, carbs: 0.0, fats: 12.5, fiber: 0.0, rating: 'GOOD', hindi: 'देसी गाय का घी (1 चम्मच)' },

  // Beverages
  'milk': { kcal: 120, protein: 6.0, carbs: 9.0, fats: 6.5, fiber: 0.0, rating: 'GOOD', hindi: 'दूध (1 गिलास)' },
  'haldi milk': { kcal: 135, protein: 6.2, carbs: 10.5, fats: 6.8, fiber: 0.5, rating: 'EXCELLENT', hindi: 'हल्दी दूध (1 कप)' },
  'tea': { kcal: 65, protein: 1.5, carbs: 9.0, fats: 2.0, fiber: 0.0, rating: 'MODERATE', hindi: 'चाय (हल्की चीनी)' },
  'coffee': { kcal: 70, protein: 1.8, carbs: 9.5, fats: 2.2, fiber: 0.0, rating: 'MODERATE', hindi: 'कॉफ़ी (1 कप)' },
  'coconut water': { kcal: 45, protein: 1.7, carbs: 8.9, fats: 0.5, fiber: 2.6, rating: 'EXCELLENT', hindi: 'नारियल पानी (1 गिलास)' },
  'nariyal pani': { kcal: 45, protein: 1.7, carbs: 8.9, fats: 0.5, fiber: 2.6, rating: 'EXCELLENT', hindi: 'ताजा नारियल पानी' }
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class CalorieCalculatorService {
  private summary: DailyCalorieSummary;

  constructor() {
    this.summary = this.loadSummary();
  }

  private loadSummary(): DailyCalorieSummary {
    const todayStr = getTodayString();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === todayStr) return parsed;
      }
    } catch {}

    // Initial baseline with prescribed doctor breakfast & morning tonic
    const initialItems: CalorieItem[] = [
      {
        id: 'cal-1',
        name: 'Brain Fuel Oatmeal with Walnuts & Berries',
        nameHindi: 'अखरोट व जामुन ओट्स',
        portion: '1.5 bowls',
        caloriesKcal: 380,
        proteinG: 12.5,
        carbsG: 52.0,
        fatsG: 14.0,
        fiberG: 7.5,
        brainRating: 'EXCELLENT',
        source: 'PRESCRIBED',
        timestamp: '08:30 AM'
      },
      {
        id: 'cal-2',
        name: 'Fresh Coconut Water & 4 Soaked Almonds',
        nameHindi: 'नारियल पानी एवं भीगे बादाम',
        portion: '1 glass + 4 nuts',
        caloriesKcal: 120,
        proteinG: 3.5,
        carbsG: 11.0,
        fatsG: 6.8,
        fiberG: 2.8,
        brainRating: 'EXCELLENT',
        source: 'PRESCRIBED',
        timestamp: '11:00 AM'
      }
    ];

    const consumed = initialItems.reduce((sum, item) => sum + item.caloriesKcal, 0);

    return {
      date: todayStr,
      targetKcal: DEFAULT_TARGET_KCAL,
      consumedKcal: consumed,
      burnedKcal: 160,
      remainingKcal: DEFAULT_TARGET_KCAL - consumed,
      proteinTotalG: 16.0,
      carbsTotalG: 63.0,
      fatsTotalG: 20.8,
      items: initialItems
    };
  }

  private saveSummary(summary: DailyCalorieSummary) {
    try {
      this.summary = summary;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-calories-updated', { detail: summary }));
      }
    } catch {}
  }

  public getDailySummary(): DailyCalorieSummary {
    const todayStr = getTodayString();
    if (this.summary.date !== todayStr) {
      this.summary = this.loadSummary();
    }
    return this.summary;
  }

  public addCalorieItem(item: Omit<CalorieItem, 'id' | 'timestamp'>): DailyCalorieSummary {
    const todaySummary = this.getDailySummary();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newItem: CalorieItem = {
      ...item,
      id: 'cal-' + Date.now(),
      timestamp: timeStr
    };

    const newItems = [newItem, ...todaySummary.items];
    const totalConsumed = newItems.reduce((sum, i) => sum + i.caloriesKcal, 0);
    const totalProtein = parseFloat(newItems.reduce((sum, i) => sum + (i.proteinG || 0), 0).toFixed(1));
    const totalCarbs = parseFloat(newItems.reduce((sum, i) => sum + (i.carbsG || 0), 0).toFixed(1));
    const totalFats = parseFloat(newItems.reduce((sum, i) => sum + (i.fatsG || 0), 0).toFixed(1));

    const updated: DailyCalorieSummary = {
      ...todaySummary,
      consumedKcal: totalConsumed,
      remainingKcal: Math.max(0, todaySummary.targetKcal - totalConsumed),
      proteinTotalG: totalProtein,
      carbsTotalG: totalCarbs,
      fatsTotalG: totalFats,
      items: newItems
    };

    this.saveSummary(updated);
    this.syncCaloriesWithBackend(updated);
    return updated;
  }

  public removeCalorieItem(id: string): DailyCalorieSummary {
    const todaySummary = this.getDailySummary();
    const newItems = todaySummary.items.filter(i => i.id !== id);
    const totalConsumed = newItems.reduce((sum, i) => sum + i.caloriesKcal, 0);

    const updated: DailyCalorieSummary = {
      ...todaySummary,
      consumedKcal: totalConsumed,
      remainingKcal: Math.max(0, todaySummary.targetKcal - totalConsumed),
      items: newItems
    };

    this.saveSummary(updated);
    this.syncCaloriesWithBackend(updated);
    return updated;
  }

  // ─── INTELLIGENT GOOGLE / GEMINI AI & LOCAL HYBRID CALORIE ENGINE ─────────

  public async estimateFoodNutrition(query: string): Promise<{
    name: string;
    nameHindi: string;
    portion: string;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
    fiberG: number;
    brainRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'AVOID';
    explanation: string;
  }> {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Fast match in local database (Instant response)
    const match = this.matchLocalDatabase(cleanQuery);
    if (match) {
      return match;
    }

    // 2. Try Google Gemini AI calculation
    try {
      const prompt = `You are a clinical neuro-nutritionist and metabolic calorie calculator for elderly cognitive patients.
Calculate the exact nutritional values for this food query: "${query}".
Return ONLY a valid raw JSON object (no markdown, no backticks, no code blocks):
{
  "name": "Proper food title in English",
  "nameHindi": "Food title in Hindi script",
  "portion": "Estimated portion size, e.g. 2 pieces / 1 bowl",
  "caloriesKcal": 250,
  "proteinG": 8.5,
  "carbsG": 34.0,
  "fatsG": 6.2,
  "fiberG": 4.0,
  "brainRating": "EXCELLENT" | "GOOD" | "MODERATE" | "AVOID",
  "explanation": "Short 1-sentence explanation of cognitive health effect"
}`;

      const aiResponse = await geminiService.generateRawPrompt(prompt);
      if (aiResponse) {
        const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.caloriesKcal && !isNaN(parsed.caloriesKcal)) {
          return {
            name: parsed.name || query,
            nameHindi: parsed.nameHindi || query,
            portion: parsed.portion || '1 serving',
            caloriesKcal: Math.round(parsed.caloriesKcal),
            proteinG: parseFloat((parsed.proteinG || 4).toFixed(1)),
            carbsG: parseFloat((parsed.carbsG || 25).toFixed(1)),
            fatsG: parseFloat((parsed.fatsG || 5).toFixed(1)),
            fiberG: parseFloat((parsed.fiberG || 3).toFixed(1)),
            brainRating: parsed.brainRating || 'GOOD',
            explanation: parsed.explanation || 'Calculated via Google Gemini Food AI.'
          };
        }
      }
    } catch {}

    // 3. Fallback heuristic calculation if offline
    return this.fallbackHeuristic(query);
  }

  private matchLocalDatabase(cleanQuery: string) {
    let multiplier = 1;
    if (cleanQuery.includes('2 ') || cleanQuery.includes('दो ')) multiplier = 2;
    else if (cleanQuery.includes('3 ') || cleanQuery.includes('तीन ')) multiplier = 3;
    else if (cleanQuery.includes('4 ') || cleanQuery.includes('चार ')) multiplier = 4;
    else if (cleanQuery.includes('half') || cleanQuery.includes('आधा')) multiplier = 0.5;

    for (const [key, val] of Object.entries(NUTRITION_DATABASE)) {
      if (cleanQuery.includes(key)) {
        const cal = Math.round(val.kcal * multiplier);
        return {
          name: `${multiplier > 1 ? multiplier + 'x ' : ''}${key.toUpperCase()}`,
          nameHindi: `${multiplier > 1 ? multiplier + ' ' : ''}${val.hindi}`,
          portion: `${multiplier} portion(s)`,
          caloriesKcal: cal,
          proteinG: parseFloat((val.protein * multiplier).toFixed(1)),
          carbsG: parseFloat((val.carbs * multiplier).toFixed(1)),
          fatsG: parseFloat((val.fats * multiplier).toFixed(1)),
          fiberG: parseFloat((val.fiber * multiplier).toFixed(1)),
          brainRating: val.rating,
          explanation: `Accurate nutrition estimate for ${multiplier} portion(s) of ${key}.`
        };
      }
    }
    return null;
  }

  private fallbackHeuristic(query: string) {
    return {
      name: query,
      nameHindi: query,
      portion: '1 serving',
      caloriesKcal: 180,
      proteinG: 5.0,
      carbsG: 28.0,
      fatsG: 4.5,
      fiberG: 2.5,
      brainRating: 'GOOD' as const,
      explanation: 'General nutritional estimate based on average dietary composition.'
    };
  }

  private async syncCaloriesWithBackend(summary: DailyCalorieSummary) {
    try {
      await api.post('/patient/calories', {
        summary,
        timestamp: new Date().toISOString()
      });
    } catch {}
  }
}

export const calorieCalculatorService = new CalorieCalculatorService();
