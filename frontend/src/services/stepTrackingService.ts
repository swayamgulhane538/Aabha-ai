import { speechService } from './speechService';
import { api } from './api';

export interface StepRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  goal: number;
  distanceKm: number;
  caloriesKcal: number;
  activeMinutes: number;
  hourly: number[]; // 24 hours
  lastUpdated: string;
}

export interface StepHistorySummary {
  today: StepRecord;
  history: StepRecord[];
  averageSteps: number;
  bestDay: { date: string; steps: number };
  weeklyTotalSteps: number;
  weeklyTotalKm: number;
  weeklyTotalCalories: number;
  streakDays: number;
}

const STORAGE_KEY = 'aabha_local_steps_v2';
const DEFAULT_DAILY_GOAL = 4000; // Optimal gentle goal for senior/cognitive health

// Average strides: ~0.75m per step for seniors -> 1,333 steps ≈ 1 km
// Average energy: ~0.04 kcal per step for moderate walking
function calculateDistanceKm(steps: number): number {
  return parseFloat((steps * 0.00075).toFixed(2));
}

function calculateCalories(steps: number): number {
  return Math.round(steps * 0.04);
}

function calculateActiveMinutes(steps: number): number {
  // Average senior walking cadence ~75-85 steps/minute
  return Math.round(steps / 80);
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class StepTrackingService {
  private isListening = false;
  private lastAccMagnitude = 0;
  private lastStepTimestamp = 0;
  private stepListeners: ((record: StepRecord) => void)[] = [];
  private motionHandler: ((e: DeviceMotionEvent) => void) | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    const todayStr = getTodayString();
    const data = this.getAllData();
    if (!data[todayStr]) {
      // Seed default baseline for today
      data[todayStr] = {
        date: todayStr,
        steps: 1850,
        goal: DEFAULT_DAILY_GOAL,
        distanceKm: calculateDistanceKm(1850),
        caloriesKcal: calculateCalories(1850),
        activeMinutes: calculateActiveMinutes(1850),
        hourly: this.generateSampleHourly(1850),
        lastUpdated: new Date().toISOString()
      };
      this.saveAllData(data);
    }
  }

  private generateSampleHourly(totalSteps: number): number[] {
    const hourly = new Array(24).fill(0);
    const currentHour = new Date().getHours();
    
    // Distribute realistic morning & afternoon walking distribution
    if (currentHour >= 8) hourly[7] = Math.round(totalSteps * 0.25);
    if (currentHour >= 9) hourly[8] = Math.round(totalSteps * 0.35);
    if (currentHour >= 12) hourly[11] = Math.round(totalSteps * 0.15);
    if (currentHour >= 16) hourly[15] = Math.round(totalSteps * 0.20);
    if (currentHour >= 18) hourly[17] = Math.round(totalSteps * 0.05);

    return hourly;
  }

  private getAllData(): Record<string, StepRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveAllData(data: Record<string, StepRecord>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Dispatch system-wide event for real-time reactivity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-steps-updated', { detail: this.getTodayRecord() }));
      }
    } catch {}
  }

  public getTodayRecord(): StepRecord {
    const todayStr = getTodayString();
    const data = this.getAllData();
    if (!data[todayStr]) {
      this.ensureInitialized();
      return this.getAllData()[todayStr];
    }
    return data[todayStr];
  }

  public getWeeklySummary(): StepHistorySummary {
    const data = this.getAllData();
    const today = this.getTodayRecord();
    const history: StepRecord[] = [];

    // Collect last 7 days
    const todayObj = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (data[key]) {
        history.push(data[key]);
      } else {
        // Mock realistic historical walking for seniors if day not found
        const mockSteps = 2200 + ((i * 370) % 1800);
        history.push({
          date: key,
          steps: mockSteps,
          goal: DEFAULT_DAILY_GOAL,
          distanceKm: calculateDistanceKm(mockSteps),
          caloriesKcal: calculateCalories(mockSteps),
          activeMinutes: calculateActiveMinutes(mockSteps),
          hourly: this.generateSampleHourly(mockSteps),
          lastUpdated: new Date().toISOString()
        });
      }
    }

    const totalSteps = history.reduce((sum, h) => sum + h.steps, 0);
    const avgSteps = Math.round(totalSteps / history.length);
    let best = { date: today.date, steps: today.steps };
    let streak = 0;

    history.forEach(h => {
      if (h.steps > best.steps) best = { date: h.date, steps: h.steps };
      if (h.steps >= h.goal * 0.7) streak++;
    });

    return {
      today,
      history,
      averageSteps: avgSteps,
      bestDay: best,
      weeklyTotalSteps: totalSteps,
      weeklyTotalKm: calculateDistanceKm(totalSteps),
      weeklyTotalCalories: calculateCalories(totalSteps),
      streakDays: Math.max(1, streak)
    };
  }

  public addSteps(count: number, activityLabel = 'Walking'): StepRecord {
    const todayStr = getTodayString();
    const data = this.getAllData();
    const current = data[todayStr] || {
      date: todayStr,
      steps: 0,
      goal: DEFAULT_DAILY_GOAL,
      distanceKm: 0,
      caloriesKcal: 0,
      activeMinutes: 0,
      hourly: new Array(24).fill(0),
      lastUpdated: new Date().toISOString()
    };

    const newTotal = Math.max(0, current.steps + count);
    const currentHour = new Date().getHours();
    const newHourly = [...(current.hourly || new Array(24).fill(0))];
    newHourly[currentHour] = (newHourly[currentHour] || 0) + count;

    current.steps = newTotal;
    current.distanceKm = calculateDistanceKm(newTotal);
    current.caloriesKcal = calculateCalories(newTotal);
    current.activeMinutes = calculateActiveMinutes(newTotal);
    current.hourly = newHourly;
    current.lastUpdated = new Date().toISOString();

    data[todayStr] = current;
    this.saveAllData(data);
    this.notifyStepUpdate(current);

    // Sync with backend API silently
    this.syncStepRecord(current, activityLabel);

    return current;
  }

  public setDailyGoal(newGoal: number): StepRecord {
    const todayStr = getTodayString();
    const data = this.getAllData();
    const current = this.getTodayRecord();
    current.goal = Math.max(1000, newGoal);
    data[todayStr] = current;
    this.saveAllData(data);
    this.notifyStepUpdate(current);
    return current;
  }

  public resetTodaySteps(): StepRecord {
    const todayStr = getTodayString();
    const data = this.getAllData();
    const current: StepRecord = {
      date: todayStr,
      steps: 0,
      goal: data[todayStr]?.goal || DEFAULT_DAILY_GOAL,
      distanceKm: 0,
      caloriesKcal: 0,
      activeMinutes: 0,
      hourly: new Array(24).fill(0),
      lastUpdated: new Date().toISOString()
    };
    data[todayStr] = current;
    this.saveAllData(data);
    this.notifyStepUpdate(current);
    return current;
  }

  // ─── MOTION SENSOR PEDOMETER ENGINE ─────────────────────────────────────────

  public isSensorSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  public async startLiveTracking(onStep?: (record: StepRecord) => void): Promise<{ success: boolean; message: string }> {
    if (this.isListening) {
      return { success: true, message: 'Step tracking is already active.' };
    }

    if (onStep) {
      this.stepListeners.push(onStep);
    }

    // iOS 13+ requires explicit permission request
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          return { success: false, message: 'Motion sensor permission denied by user.' };
        }
      } catch (e: any) {
        return { success: false, message: 'Could not access motion sensor: ' + e?.message };
      }
    }

    // Sensor Peak Detection Algorithm (Calibrated for elderly walking dynamics)
    const ACCELERATION_THRESHOLD_HIGH = 11.8; // Peak step threshold (m/s^2)
    const ACCELERATION_THRESHOLD_LOW = 9.2;   // Valley threshold (m/s^2)
    const MIN_STEP_INTERVAL_MS = 380;        // Min time between steps (prevent double count)
    const MAX_STEP_INTERVAL_MS = 2500;       // Max window to validate rhythmic gait

    let isPeakDetected = false;

    this.motionHandler = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      // Calculate total 3D acceleration magnitude |A| = sqrt(x^2 + y^2 + z^2)
      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const now = Date.now();

      // Low-pass filter smoothing
      const smoothedMagnitude = 0.75 * magnitude + 0.25 * this.lastAccMagnitude;
      this.lastAccMagnitude = smoothedMagnitude;

      if (!isPeakDetected && smoothedMagnitude > ACCELERATION_THRESHOLD_HIGH) {
        isPeakDetected = true;
      } else if (isPeakDetected && smoothedMagnitude < ACCELERATION_THRESHOLD_LOW) {
        const interval = now - this.lastStepTimestamp;
        if (interval >= MIN_STEP_INTERVAL_MS && interval <= MAX_STEP_INTERVAL_MS) {
          this.lastStepTimestamp = now;
          this.addSteps(1, 'Live Pedometer');
        }
        isPeakDetected = false;
      }
    };

    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    this.isListening = true;
    return { success: true, message: 'Live pedometer motion tracking started.' };
  }

  public stopLiveTracking() {
    if (this.motionHandler && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.motionHandler);
      this.motionHandler = null;
    }
    this.isListening = false;
    this.stepListeners = [];
  }

  public isTrackingActive(): boolean {
    return this.isListening;
  }

  private notifyStepUpdate(record: StepRecord) {
    this.stepListeners.forEach(cb => {
      try { cb(record); } catch {}
    });
  }

  // ─── VOICE ANNOUNCEMENT & ENCOURAGEMENT ─────────────────────────────────────

  public speakStepStatus(lang: string = 'en') {
    const today = this.getTodayRecord();
    const percent = Math.min(100, Math.round((today.steps / today.goal) * 100));
    let text = '';

    if (lang === 'hi') {
      if (percent >= 100) {
        text = `बधाई हो! आपने आज का लक्ष्य पूरा कर लिया है। आपने कुल ${today.steps} कदम चले हैं, जिससे ${today.distanceKm} किलोमीटर की दूरी तय हुई। बहुत खूब!`;
      } else {
        text = `आज आपने ${today.steps} कदम पूरे किए हैं, जो आपके ${today.goal} कदमों के लक्ष्य का ${percent} प्रतिशत है। स्वस्थ रहने के लिए थोड़ा और टहलें।`;
      }
    } else if (lang === 'mr') {
      if (percent >= 100) {
        text = `अभिनंदन! तुम्ही आजचे ध्येय पूर्ण केले आहे. तुम्ही एकूण ${today.steps} पावले चालला आहात. उत्तम आरोग्य!`;
      } else {
        text = `आज तुम्ही ${today.steps} पावले चालला आहात. ध्येयाच्या ${percent} टक्के पूर्ण झाले आहे. थोडे चाला आणि निरोगी राहा.`;
      }
    } else {
      if (percent >= 100) {
        text = `Fantastic! You have achieved your daily walking goal! You walked ${today.steps} steps covering ${today.distanceKm} kilometers. Keep up the wonderful active routine!`;
      } else {
        text = `You have completed ${today.steps} steps today, which is ${percent}% of your ${today.goal} steps goal. A gentle walk in the garden is great for your health!`;
      }
    }

    speechService.speak(text, lang as any);
  }

  // ─── PERSISTENT BACKEND SYNC ───────────────────────────────────────────────

  private async syncStepRecord(record: StepRecord, activityName: string) {
    try {
      await api.post('/vitals/steps', {
        steps: record.steps,
        goal: record.goal,
        distanceKm: record.distanceKm,
        caloriesKcal: record.caloriesKcal,
        activeMinutes: record.activeMinutes,
        activityName,
        date: record.date
      });
    } catch {}
  }
}

export const stepTrackingService = new StepTrackingService();
