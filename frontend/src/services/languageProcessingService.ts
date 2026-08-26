/**
 * SignBridge – Language Processing & Normalization Service
 * 
 * Takes spoken/typed natural language sentences in English, Hindi, or Hinglish,
 * normalizes semantic meaning, strips conversational fillers, and extracts
 * structured clinical intent tokens for Indian Sign Language translation.
 */

export interface NormalizedIntent {
  rawText: string;
  detectedLanguage: 'en' | 'hi' | 'hinglish';
  normalizedQuery: string;
  clinicalTokens: string[];
  isQuestion: boolean;
  isEmergency: boolean;
  intentCategory: 'SYMPTOM_CHECK' | 'PAIN_LOCATION' | 'DURATION' | 'MEDICATION' | 'INSTRUCTION' | 'TRIAGE' | 'GENERAL';
}

// Hindi & Hinglish word dictionary mappings
const HINDI_HINGLISH_MAP: Record<string, string> = {
  // Questions
  'kahan': 'where',
  'kaha': 'where',
  'kidhar': 'where',
  'kaha pe': 'where',
  'kaisa': 'how',
  'kaise': 'how',
  'kitne': 'how long',
  'kabse': 'how long',
  'kab se': 'how long',
  'kya': 'what',
  'kyun': 'why',
  'dikhaye': 'show',
  'dikhao': 'show',
  'batao': 'tell',
  'bataye': 'tell',

  // Symptoms & Body parts
  'dard': 'pain',
  'dukh': 'pain',
  'taklif': 'pain',
  'peeda': 'pain',
  'sir': 'head',
  'sar': 'head',
  'chhati': 'chest',
  'seena': 'chest',
  'pet': 'stomach',
  'pait': 'stomach',
  'peeth': 'back',
  'bukhar': 'fever',
  'taap': 'fever',
  'chakkar': 'dizzy',
  'saans': 'breath',
  'sans': 'breath',

  // Actions & Needs
  'dawa': 'medicine',
  'dawai': 'medicine',
  'goli': 'medicine',
  'pani': 'water',
  'paani': 'water',
  'aaram': 'rest',
  'aram': 'rest',
  'hospital': 'hospital',
  'aspatal': 'hospital',
  'khana': 'food',
  'khana khane ke baad': 'after food',
  'baad': 'after',
  'rukna': 'wait',
  'ruko': 'wait',
  'theek': 'better',
  'kharab': 'worse',
  'madad': 'help',
  'emergency': 'emergency'
};

class LanguageProcessingService {
  /**
   * Normalize input sentence into standard clinical concepts
   */
  public processSentence(text: string): NormalizedIntent {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Detect language
    const isHindiScript = /[\u0900-\u097F]/.test(raw);
    let lang: 'en' | 'hi' | 'hinglish' = isHindiScript ? 'hi' : 'en';

    // Check Hinglish patterns
    if (!isHindiScript && Object.keys(HINDI_HINGLISH_MAP).some(k => lower.includes(k))) {
      lang = 'hinglish';
    }

    // 2. Question & Emergency checks
    const isQuestion = raw.endsWith('?') || 
      lower.includes('where') || lower.includes('how') || lower.includes('what') || lower.includes('kahan') || lower.includes('kab') || lower.includes('kaisa') || lower.includes('are you') || lower.includes('do you');

    const isEmergency = lower.includes('emergency') || lower.includes('chest pain') || lower.includes('severe') || lower.includes('cannot breathe') || lower.includes('saans') || lower.includes('chhati me dard');

    // 3. Extract core clinical tokens
    const tokens: string[] = [];

    // Check location
    if (lower.includes('where') || lower.includes('kahan') || lower.includes('kidhar')) tokens.push('WHERE');
    if (lower.includes('show') || lower.includes('dikhao') || lower.includes('dikhaye')) tokens.push('SHOW');
    if (lower.includes('how long') || lower.includes('kabse') || lower.includes('kitne din')) tokens.push('HOW_LONG');

    // Check symptoms
    if (lower.includes('chest') || lower.includes('chhati') || lower.includes('seena')) tokens.push('CHEST');
    if (lower.includes('head') || lower.includes('sir') || lower.includes('sar')) tokens.push('HEAD');
    if (lower.includes('stomach') || lower.includes('pet') || lower.includes('pait')) tokens.push('STOMACH');
    if (lower.includes('back') || lower.includes('peeth')) tokens.push('BACK');
    if (lower.includes('fever') || lower.includes('bukhar') || lower.includes('taap')) tokens.push('FEVER');
    if (lower.includes('dizzy') || lower.includes('chakkar')) tokens.push('DIZZY');
    if (lower.includes('breath') || lower.includes('saans') || lower.includes('sans')) tokens.push('BREATHE');
    if (lower.includes('pain') || lower.includes('dard') || lower.includes('hurt') || lower.includes('hurts')) tokens.push('PAIN');

    // Check actions / care
    if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('dawai') || lower.includes('pill')) tokens.push('MEDICINE');
    if (lower.includes('water') || lower.includes('pani') || lower.includes('paani')) tokens.push('WATER');
    if (lower.includes('food') || lower.includes('khana')) tokens.push('FOOD');
    if (lower.includes('after') || lower.includes('baad')) tokens.push('AFTER');
    if (lower.includes('take') || lower.includes('khao') || lower.includes('len')) tokens.push('TAKE');
    if (lower.includes('rest') || lower.includes('aaram') || lower.includes('aram')) tokens.push('REST');
    if (lower.includes('wait') || lower.includes('ruko') || lower.includes('wait')) tokens.push('WAIT');
    if (lower.includes('hospital') || lower.includes('aspatal')) tokens.push('HOSPITAL');
    if (lower.includes('better') || lower.includes('theek') || lower.includes('sudhar')) tokens.push('BETTER');
    if (lower.includes('worse') || lower.includes('kharab') || lower.includes('bura')) tokens.push('WORSE');
    if (lower.includes('emergency') || lower.includes('aapat')) tokens.push('EMERGENCY');
    if (lower.includes('caregiver') || lower.includes('nurse')) tokens.push('CAREGIVER');

    // 4. Intent categorization
    let category: NormalizedIntent['intentCategory'] = 'GENERAL';
    if (tokens.includes('WHERE') || (tokens.includes('SHOW') && tokens.includes('PAIN'))) category = 'PAIN_LOCATION';
    else if (tokens.includes('HOW_LONG')) category = 'DURATION';
    else if (tokens.includes('MEDICINE') || tokens.includes('WATER') || tokens.includes('REST')) category = 'MEDICATION';
    else if (tokens.includes('EMERGENCY') || (tokens.includes('CHEST') && tokens.includes('PAIN'))) category = 'TRIAGE';
    else if (tokens.includes('FEVER') || tokens.includes('HEAD') || tokens.includes('STOMACH') || tokens.includes('PAIN')) category = 'SYMPTOM_CHECK';

    return {
      rawText: raw,
      detectedLanguage: lang,
      normalizedQuery: tokens.join(' '),
      clinicalTokens: tokens,
      isQuestion,
      isEmergency,
      intentCategory: category
    };
  }
}

export const languageProcessingService = new LanguageProcessingService();
