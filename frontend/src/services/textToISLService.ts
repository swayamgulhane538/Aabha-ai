/**
 * SignBridge – Indian Sign Language (ISL) Translation Engine
 * 
 * Converts natural language sentences into structured ISL Gloss sequences
 * based on Indian Sign Language grammar rules (Topic-Comment / Subject-Object-Verb).
 * 
 * Example:
 * Doctor: "Where are you feeling pain?"
 * -> ISL Gloss: ["WHERE", "PAIN"]
 * 
 * Doctor: "Can you show me where it hurts?"
 * -> ISL Gloss: ["SHOW", "WHERE", "PAIN"]
 * 
 * Doctor: "Take this medicine after food"
 * -> ISL Gloss: ["FOOD", "AFTER", "MEDICINE", "TAKE"]
 */

import { languageProcessingService, NormalizedIntent } from './languageProcessingService';

export interface ISLGlossToken {
  gloss: string;
  hindiGloss: string;
  icon: string;
  handPose: 'POINT_FORWARD' | 'CIRCULAR_HEAD' | 'CROSS_CHEST' | 'HOLD_PALM' | 'UP_DOWN_NOD' | 'SWIRL_HEAD' | 'PILL_MOUTH' | 'TOUCH_WRIST';
  motionTrajectory: 'STATIC' | 'SWEEP_DOWN' | 'CIRCULAR' | 'OUTWARD' | 'INWARD';
  durationMs: number;
  description: string;
  visualCue: string;
}

export interface ISLTranslationResult {
  originalText: string;
  detectedLanguage: string;
  islGlossArray: string[];
  tokens: ISLGlossToken[];
  totalDurationMs: number;
  isEmergency: boolean;
  intentCategory: string;
}

// Validated ISL Gloss Dictionary
export const ISL_GLOSS_CATALOG: Record<string, ISLGlossToken> = {
  WHERE: {
    gloss: 'WHERE',
    hindiGloss: 'कहाँ',
    icon: '📍',
    handPose: 'POINT_FORWARD',
    motionTrajectory: 'CIRCULAR',
    durationMs: 1400,
    description: 'Index finger pointing forward with inquisitive circular sway',
    visualCue: 'Pointing & Questioning'
  },
  SHOW: {
    gloss: 'SHOW',
    hindiGloss: 'दिखाएं',
    icon: '👉',
    handPose: 'POINT_FORWARD',
    motionTrajectory: 'OUTWARD',
    durationMs: 1300,
    description: 'Both index fingers pointing towards camera then towards chest',
    visualCue: 'Pointing to Location'
  },
  PAIN: {
    gloss: 'PAIN',
    hindiGloss: 'दर्द',
    icon: '😣',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'STATIC',
    durationMs: 1600,
    description: 'Clenched trembling fist with grimaced facial expression',
    visualCue: 'Clenched Fist (Trembling)'
  },
  HEAD: {
    gloss: 'HEADACHE',
    hindiGloss: 'सिरदर्द',
    icon: '🤕',
    handPose: 'CIRCULAR_HEAD',
    motionTrajectory: 'INWARD',
    durationMs: 1500,
    description: 'Index fingers tapping both temples with tight brow',
    visualCue: 'Tapping Temples'
  },
  CHEST: {
    gloss: 'CHEST',
    hindiGloss: 'छाती',
    icon: '🫀',
    handPose: 'CROSS_CHEST',
    motionTrajectory: 'INWARD',
    durationMs: 1600,
    description: 'Firm palm pressing center chest with deep breath',
    visualCue: 'Palm on Center Chest'
  },
  STOMACH: {
    gloss: 'STOMACH',
    hindiGloss: 'पेट',
    icon: '🤢',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'CIRCULAR',
    durationMs: 1500,
    description: 'Both hands holding abdomen with inward circular motion',
    visualCue: 'Hands on Lower Abdomen'
  },
  BACK: {
    gloss: 'BACK_PAIN',
    hindiGloss: 'पीठ दर्द',
    icon: '🧍',
    handPose: 'CROSS_CHEST',
    motionTrajectory: 'SWEEP_DOWN',
    durationMs: 1400,
    description: 'Thumb pointing towards lower spine region',
    visualCue: 'Pointing to Spine'
  },
  FEVER: {
    gloss: 'FEVER',
    hindiGloss: 'बुखार',
    icon: '🌡️',
    handPose: 'CIRCULAR_HEAD',
    motionTrajectory: 'OUTWARD',
    durationMs: 1500,
    description: 'Back of palm touching forehead then shaking outward',
    visualCue: 'Back of Palm on Forehead'
  },
  DIZZY: {
    gloss: 'DIZZY',
    hindiGloss: 'चक्कर',
    icon: '💫',
    handPose: 'SWIRL_HEAD',
    motionTrajectory: 'CIRCULAR',
    durationMs: 1400,
    description: 'Index finger moving in circular orbit above head',
    visualCue: 'Circular Orbit Above Head'
  },
  BREATHE: {
    gloss: 'BREATHING_PROBLEM',
    hindiGloss: 'सांस की तकलीफ',
    icon: '🫁',
    handPose: 'CROSS_CHEST',
    motionTrajectory: 'SWEEP_DOWN',
    durationMs: 1600,
    description: 'Hand grasping upper throat/chest with gasping expression',
    visualCue: 'Hand at Upper Throat'
  },
  HOW_LONG: {
    gloss: 'HOW_LONG',
    hindiGloss: 'कब से',
    icon: '⏱️',
    handPose: 'TOUCH_WRIST',
    motionTrajectory: 'OUTWARD',
    durationMs: 1400,
    description: 'Tapping wrist watch twice followed by open question palm',
    visualCue: 'Tapping Wrist (Time)'
  },
  MEDICINE: {
    gloss: 'MEDICINE',
    hindiGloss: 'दवाई',
    icon: '💊',
    handPose: 'PILL_MOUTH',
    motionTrajectory: 'INWARD',
    durationMs: 1400,
    description: 'Placing imaginary tablet on tongue with thumb and index',
    visualCue: 'Tablet to Mouth'
  },
  WATER: {
    gloss: 'WATER',
    hindiGloss: 'पानी',
    icon: '💧',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'INWARD',
    durationMs: 1300,
    description: 'Three fingers (W sign) touching lower lip twice',
    visualCue: 'Three Fingers at Lips'
  },
  FOOD: {
    gloss: 'FOOD',
    hindiGloss: 'खाना',
    icon: '🍲',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'INWARD',
    durationMs: 1300,
    description: 'Cupped fingertips moving towards mouth twice',
    visualCue: 'Fingertips to Mouth'
  },
  AFTER: {
    gloss: 'AFTER',
    hindiGloss: 'के बाद',
    icon: '➡️',
    handPose: 'POINT_FORWARD',
    motionTrajectory: 'SWEEP_DOWN',
    durationMs: 1100,
    description: 'Dominant palm sweeping forward past non-dominant palm',
    visualCue: 'Palm Sweeping Forward'
  },
  TAKE: {
    gloss: 'TAKE',
    hindiGloss: 'लें / खाएं',
    icon: '🤲',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'INWARD',
    durationMs: 1200,
    description: 'Open palms grasping inward towards body',
    visualCue: 'Grasping Inward'
  },
  REST: {
    gloss: 'REST',
    hindiGloss: 'आराम',
    icon: '🛌',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'STATIC',
    durationMs: 1400,
    description: 'Folded palms resting against tilted cheek with closed eyes',
    visualCue: 'Palms Against Cheek'
  },
  WAIT: {
    gloss: 'WAIT',
    hindiGloss: 'प्रतीक्षा करें',
    icon: '⏳',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'STATIC',
    durationMs: 1300,
    description: 'Open vertical palm facing camera with steady hold',
    visualCue: 'Open Steady Palm'
  },
  HOSPITAL: {
    gloss: 'HOSPITAL',
    hindiGloss: 'अस्पताल',
    icon: '🏥',
    handPose: 'CROSS_CHEST',
    motionTrajectory: 'STATIC',
    durationMs: 1500,
    description: 'Drawing cross symbol on upper arm with index finger',
    visualCue: 'Cross on Upper Arm'
  },
  BETTER: {
    gloss: 'BETTER',
    hindiGloss: 'बेहतर',
    icon: '👍',
    handPose: 'UP_DOWN_NOD',
    motionTrajectory: 'OUTWARD',
    durationMs: 1200,
    description: 'Firm thumb up nod with reassuring smile',
    visualCue: 'Thumb Up Reassuring'
  },
  WORSE: {
    gloss: 'WORSE',
    hindiGloss: 'खराब',
    icon: '👎',
    handPose: 'POINT_FORWARD',
    motionTrajectory: 'SWEEP_DOWN',
    durationMs: 1300,
    description: 'Thumb down movement with concerned expression',
    visualCue: 'Thumb Down (Concerned)'
  },
  EMERGENCY: {
    gloss: 'EMERGENCY',
    hindiGloss: 'आपातकाल',
    icon: '🚨',
    handPose: 'CROSS_CHEST',
    motionTrajectory: 'CIRCULAR',
    durationMs: 1800,
    description: 'Both hands waving urgently across upper chest and head',
    visualCue: 'Urgent Flashing Wave'
  },
  CAREGIVER: {
    gloss: 'CAREGIVER',
    hindiGloss: 'केयरगिवर / नर्स',
    icon: '👩‍⚕️',
    handPose: 'HOLD_PALM',
    motionTrajectory: 'OUTWARD',
    durationMs: 1400,
    description: 'Phone shape near ear while pointing towards side',
    visualCue: 'Phone Shape at Ear'
  }
};

class TextToISLService {
  /**
   * Main sentence-level translator from Natural Language to ISL Sign Sequence
   */
  public translateToISL(sentence: string): ISLTranslationResult {
    const intent: NormalizedIntent = languageProcessingService.processSentence(sentence);
    const tokens: ISLGlossToken[] = [];
    const glossArray: string[] = [];

    // ISL Grammar Reordering Rules (Subject-Object-Verb / Topic-Comment)
    const rawTokens = intent.clinicalTokens;

    // Rule 1: Pain location question: [SHOW] -> [WHERE] -> [PAIN]
    if (intent.intentCategory === 'PAIN_LOCATION') {
      if (rawTokens.includes('SHOW')) this.addGloss('SHOW', tokens, glossArray);
      this.addGloss('WHERE', tokens, glossArray);
      this.addGloss('PAIN', tokens, glossArray);
    }
    // Rule 2: Duration question: [PAIN] -> [HOW_LONG]
    else if (intent.intentCategory === 'DURATION') {
      if (rawTokens.includes('PAIN')) this.addGloss('PAIN', tokens, glossArray);
      this.addGloss('HOW_LONG', tokens, glossArray);
    }
    // Rule 3: Medicine timing: [FOOD] -> [AFTER] -> [MEDICINE] -> [TAKE]
    else if (intent.intentCategory === 'MEDICATION') {
      if (rawTokens.includes('FOOD')) this.addGloss('FOOD', tokens, glossArray);
      if (rawTokens.includes('AFTER')) this.addGloss('AFTER', tokens, glossArray);
      if (rawTokens.includes('MEDICINE')) this.addGloss('MEDICINE', tokens, glossArray);
      if (rawTokens.includes('WATER')) this.addGloss('WATER', tokens, glossArray);
      if (rawTokens.includes('TAKE')) this.addGloss('TAKE', tokens, glossArray);
      if (rawTokens.includes('REST')) this.addGloss('REST', tokens, glossArray);
    }
    // Rule 4: Critical triage: [EMERGENCY] -> [HOSPITAL] / [CHEST] -> [PAIN]
    else if (intent.intentCategory === 'TRIAGE') {
      this.addGloss('EMERGENCY', tokens, glossArray);
      if (rawTokens.includes('CHEST')) this.addGloss('CHEST', tokens, glossArray);
      if (rawTokens.includes('PAIN')) this.addGloss('PAIN', tokens, glossArray);
      if (rawTokens.includes('HOSPITAL')) this.addGloss('HOSPITAL', tokens, glossArray);
    }
    // Rule 5: Specific Symptom query: [HEAD / FEVER / CHEST] -> [PAIN] -> [BETTER / WORSE]
    else {
      rawTokens.forEach(t => {
        this.addGloss(t, tokens, glossArray);
      });
    }

    // Default fallback if no tokens matched
    if (tokens.length === 0) {
      this.addGloss('WHERE', tokens, glossArray);
      this.addGloss('PAIN', tokens, glossArray);
    }

    const totalDurationMs = tokens.reduce((acc, t) => acc + t.durationMs, 0);

    return {
      originalText: sentence,
      detectedLanguage: intent.detectedLanguage,
      islGlossArray: glossArray,
      tokens,
      totalDurationMs,
      isEmergency: intent.isEmergency,
      intentCategory: intent.intentCategory
    };
  }

  private addGloss(key: string, list: ISLGlossToken[], array: string[]) {
    const item = ISL_GLOSS_CATALOG[key];
    if (item && !array.includes(item.gloss)) {
      list.push(item);
      array.push(item.gloss);
    }
  }
}

export const textToISLService = new TextToISLService();
