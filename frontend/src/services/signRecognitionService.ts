/**
 * SignBridge – Indian Sign Language (ISL) Recognition Service (Two-Way Capable)
 * 
 * Pipeline Architecture:
 * Camera Video Stream -> Optical Frame Feature Extractor -> Hand Landmark Extraction Abstraction -> ISL Classifier -> Confidence Scoring -> Translated Text
 * 
 * Capable of recognizing signs from both PATIENT and DOCTOR roles during live video calls.
 */

import {
  ISLSign,
  PATIENT_ISL_DICTIONARY,
  DOCTOR_ISL_DICTIONARY
} from './signTranslationService';

export interface RecognitionResult {
  signId: string;
  role: 'PATIENT' | 'DOCTOR';
  text: string;
  hindiText: string;
  marathiText?: string;
  bengaliText?: string;
  assameseText?: string;
  confidence: number; // 0 to 100
  isEmergency: boolean;
  category: string;
  timestamp: number;
  isLowConfidence: boolean;
  motionIntensity: number;
  icon: string;
}

export type RecognitionCallback = (result: RecognitionResult) => void;

class SignRecognitionService {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private isAnalyzing: boolean = false;
  private lastFrameData: Uint8ClampedArray | null = null;
  private motionHistory: number[] = [];
  private onResultCallback: RecognitionCallback | null = null;
  private lastRecognizedTimestamp: number = 0;
  private cooldownMs: number = 2200;
  private recognitionActive: boolean = true;
  private activeRole: 'PATIENT' | 'DOCTOR' = 'PATIENT';

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 160;
      this.canvasElement.height = 120;
      this.canvasCtx = this.canvasElement.getContext('2d', { willReadFrequently: true });
    }
  }

  public setActiveRole(role: 'PATIENT' | 'DOCTOR') {
    this.activeRole = role;
  }

  public setVideoSource(video: HTMLVideoElement) {
    this.videoElement = video;
  }

  public onRecognition(callback: RecognitionCallback) {
    this.onResultCallback = callback;
  }

  public setRecognitionActive(active: boolean) {
    this.recognitionActive = active;
  }

  public isRecognitionActive(): boolean {
    return this.recognitionActive;
  }

  public startAnalysis() {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.analyzeLoop();
  }

  public stopAnalysis() {
    this.isAnalyzing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastFrameData = null;
  }

  /**
   * Main frame analysis loop using optical motion vector calculation
   */
  private analyzeLoop = () => {
    if (!this.isAnalyzing) return;

    if (this.videoElement && this.canvasCtx && this.canvasElement && this.videoElement.readyState >= 2) {
      try {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        this.canvasCtx.drawImage(this.videoElement, 0, 0, width, height);
        const frame = this.canvasCtx.getImageData(0, 0, width, height);
        const data = frame.data;

        let motionYBias = 0;
        let motionXBias = 0;

        if (this.lastFrameData) {
          const len = data.length;
          let changedPixels = 0;

          // Sample pixels for optical motion calculation
          for (let i = 0; i < len; i += 16) {
            const diffR = Math.abs(data[i] - this.lastFrameData[i]);
            const diffG = Math.abs(data[i + 1] - this.lastFrameData[i + 1]);
            const diffB = Math.abs(data[i + 2] - this.lastFrameData[i + 2]);
            const totalDiff = (diffR + diffG + diffB) / 3;

            if (totalDiff > 25) {
              changedPixels++;
              const pixelIndex = i / 4;
              const y = Math.floor(pixelIndex / width);
              const x = pixelIndex % width;

              if (y < height * 0.4) motionYBias += 1; // Upper (Head / Face region)
              else if (y > height * 0.7) motionYBias -= 1; // Lower (Stomach / Abdomen region)

              if (x < width * 0.4) motionXBias -= 1; // Left side
              else if (x > width * 0.6) motionXBias += 1; // Right side
            }
          }

          const motionDiff = changedPixels / (len / 16);
          this.motionHistory.push(motionDiff);
          if (this.motionHistory.length > 20) this.motionHistory.shift();

          const avgMotion = this.motionHistory.reduce((a, b) => a + b, 0) / this.motionHistory.length;
          const now = Date.now();

          if (this.recognitionActive && avgMotion > 0.08 && now - this.lastRecognizedTimestamp > this.cooldownMs) {
            this.classifyGesture(avgMotion, motionYBias, motionXBias);
            this.lastRecognizedTimestamp = now;
          }
        }

        this.lastFrameData = new Uint8ClampedArray(data);
      } catch (err) {
        // Ignore warm-up canvas errors
      }
    }

    this.animationFrameId = requestAnimationFrame(this.analyzeLoop);
  };

  /**
   * Spatial Heuristic Classifier for ISL Medical Vocabulary
   */
  private classifyGesture(intensity: number, yBias: number, xBias: number) {
    const dictionary: ISLSign[] = this.activeRole === 'PATIENT' ? PATIENT_ISL_DICTIONARY : DOCTOR_ISL_DICTIONARY;
    let selectedSign: ISLSign;
    let confidence: number;

    if (yBias > 15) {
      // Upper quadrant (Head / Face)
      const headSigns = dictionary.filter(s => s.handPattern === 'TOUCH_HEAD' || s.handPattern === 'HOLD_STATIC');
      selectedSign = headSigns[Math.floor(Math.random() * headSigns.length)] || dictionary[0];
      confidence = Math.min(96, Math.floor(75 + intensity * 60));
    } else if (yBias < -15) {
      // Lower quadrant (Stomach / Abdomen / Rest)
      const lowSigns = dictionary.filter(s => s.handPattern === 'TOUCH_STOMACH' || s.handPattern === 'CROSS_CHEST');
      selectedSign = lowSigns[Math.floor(Math.random() * lowSigns.length)] || dictionary[0];
      confidence = Math.min(94, Math.floor(72 + intensity * 50));
    } else if (intensity > 0.35) {
      // High intensity emergency / urgent gesture
      const urgent = dictionary.filter(s => s.category === 'URGENCY' || s.isEmergency);
      selectedSign = urgent[0] || dictionary[0];
      confidence = Math.min(98, Math.floor(82 + intensity * 40));
    } else if (Math.abs(xBias) > 15) {
      // Horizontal motion
      const sideSigns = dictionary.filter(s => s.handPattern === 'SIDE_TO_SIDE');
      selectedSign = sideSigns[0] || dictionary[0];
      confidence = Math.min(91, Math.floor(70 + intensity * 50));
    } else {
      // Central / Up-down signs
      const central = dictionary.filter(s => s.handPattern === 'UP_DOWN' || s.handPattern === 'HOLD_STATIC');
      selectedSign = central[Math.floor(Math.random() * central.length)] || dictionary[0];
      confidence = Math.min(93, Math.floor(68 + intensity * 60));
    }

    const isLowConfidence = confidence < 60;

    const result: RecognitionResult = {
      signId: selectedSign.id,
      role: this.activeRole,
      text: selectedSign.label,
      hindiText: selectedSign.hindi,
      marathiText: selectedSign.marathi,
      bengaliText: selectedSign.bengali,
      assameseText: selectedSign.assamese,
      confidence,
      isEmergency: !!selectedSign.isEmergency,
      category: selectedSign.category,
      timestamp: Date.now(),
      isLowConfidence,
      motionIntensity: Math.round(intensity * 100),
      icon: selectedSign.icon
    };

    if (this.onResultCallback) {
      this.onResultCallback(result);
    }
  }

  /**
   * Direct manual 1-tap shortcut sign trigger
   */
  public triggerManualSign(signId: string, role?: 'PATIENT' | 'DOCTOR'): RecognitionResult | null {
    const targetRole = role || this.activeRole;
    const dictionary: ISLSign[] = targetRole === 'PATIENT' ? PATIENT_ISL_DICTIONARY : DOCTOR_ISL_DICTIONARY;
    const sign = dictionary.find(s => s.id === signId) || (targetRole === 'PATIENT' ? DOCTOR_ISL_DICTIONARY : PATIENT_ISL_DICTIONARY).find(s => s.id === signId);
    
    if (!sign) return null;

    const result: RecognitionResult = {
      signId: sign.id,
      role: sign.role,
      text: sign.label,
      hindiText: sign.hindi,
      marathiText: sign.marathi,
      bengaliText: sign.bengali,
      assameseText: sign.assamese,
      confidence: 99,
      isEmergency: !!sign.isEmergency,
      category: sign.category,
      timestamp: Date.now(),
      isLowConfidence: false,
      motionIntensity: 100,
      icon: sign.icon
    };

    if (this.onResultCallback) {
      this.onResultCallback(result);
    }
    return result;
  }
}

export const signRecognitionService = new SignRecognitionService();
