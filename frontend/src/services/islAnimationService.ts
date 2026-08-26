/**
 * SignBridge – ISL Visual Sign Animation Controller
 * 
 * Controls sequence timing, frame pacing, step indices, and looping
 * for rendering Indian Sign Language avatar animations on the patient's screen.
 */

import { ISLGlossToken } from './textToISLService';

export interface AnimationPlayerState {
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentGloss: ISLGlossToken | null;
  progressPercent: number;
  isCompleted: boolean;
}

export type PlayerStateCallback = (state: AnimationPlayerState) => void;

class ISLAnimationService {
  private currentSequence: ISLGlossToken[] = [];
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private progressIntervalId: any = null;
  private stepStartTime: number = 0;
  private onStateChangeCallback: PlayerStateCallback | null = null;
  private loop: boolean = true;

  public setSequence(tokens: ISLGlossToken[]) {
    this.stop();
    this.currentSequence = tokens;
    this.currentStep = 0;
    this.emitState();
  }

  public onStateChange(callback: PlayerStateCallback) {
    this.onStateChangeCallback = callback;
  }

  public play() {
    if (this.currentSequence.length === 0) return;
    this.isPlaying = true;
    this.playStep(this.currentStep);
  }

  public pause() {
    this.isPlaying = false;
    this.clearTimers();
    this.emitState();
  }

  public stop() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.clearTimers();
    this.emitState();
  }

  public replay() {
    this.stop();
    this.play();
  }

  public jumpToStep(index: number) {
    if (index >= 0 && index < this.currentSequence.length) {
      this.clearTimers();
      this.currentStep = index;
      if (this.isPlaying) {
        this.playStep(index);
      } else {
        this.emitState();
      }
    }
  }

  private playStep(index: number) {
    if (index >= this.currentSequence.length) {
      if (this.loop && this.currentSequence.length > 0) {
        this.currentStep = 0;
        this.playStep(0);
        return;
      } else {
        this.isPlaying = false;
        this.clearTimers();
        this.emitState(true);
        return;
      }
    }

    this.currentStep = index;
    const currentToken = this.currentSequence[index];
    this.stepStartTime = Date.now();
    const duration = currentToken ? currentToken.durationMs : 1500;

    this.clearTimers();
    this.emitState();

    // Progress tick
    this.progressIntervalId = setInterval(() => {
      this.emitState();
    }, 100);

    // Schedule next token transition
    this.timerId = setTimeout(() => {
      if (this.isPlaying) {
        this.playStep(index + 1);
      }
    }, duration);
  }

  private clearTimers() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }

  private emitState(isCompleted = false) {
    if (!this.onStateChangeCallback) return;

    const currentGloss = this.currentSequence[this.currentStep] || null;
    const totalSteps = this.currentSequence.length;
    let progress = 0;

    if (totalSteps > 0 && currentGloss && this.isPlaying) {
      const elapsed = Date.now() - this.stepStartTime;
      const stepProg = Math.min(1, elapsed / currentGloss.durationMs);
      progress = Math.round(((this.currentStep + stepProg) / totalSteps) * 100);
    } else if (isCompleted) {
      progress = 100;
    }

    this.onStateChangeCallback({
      isPlaying: this.isPlaying,
      currentStepIndex: this.currentStep,
      totalSteps,
      currentGloss,
      progressPercent: Math.min(100, progress),
      isCompleted
    });
  }
}

export const islAnimationService = new ISLAnimationService();
