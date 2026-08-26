/**
 * SignBridge – Real-Time Two-Way Sign Communication Service
 * 
 * Manages instant peer-to-peer sign language messaging and speech subtitle delivery between:
 * - Patient Screen (Patient -> Doctor)
 * - Doctor Screen (Doctor -> Patient)
 * 
 * Transport Layers:
 * 1. BroadcastChannel (Instant cross-window / multi-tab local synchronization)
 * 2. REST Signaling API (`/api/signbridge/messages`) for server-backed persistence
 */

import { api } from './api';
import { RecognitionResult } from './signRecognitionService';

export type CommunicationMode = 'SIGN_LANGUAGE' | 'VOICE' | 'TEXT';

export interface SignBridgeLiveMessage {
  id: string;
  roomId: string;
  senderRole: 'PATIENT' | 'DOCTOR' | 'CAREGIVER';
  senderName: string;
  type: 'PATIENT_SIGN' | 'DOCTOR_SIGN' | 'DOCTOR_SPEECH_SUBTITLE' | 'TEXT_CHAT' | 'EMERGENCY_ALERT' | 'MODE_CHANGE';
  text: string;
  hindiText?: string;
  marathiText?: string;
  bengaliText?: string;
  assameseText?: string;
  confidence?: number;
  isEmergency?: boolean;
  timestamp: string;
  icon?: string;
  mode?: CommunicationMode;
}

export type MessageListener = (msg: SignBridgeLiveMessage) => void;

class RealTimeSignCommunicationService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<MessageListener> = new Set();
  private roomId: string = 'aabha-signbridge-room';
  private pollingIntervalId: any = null;
  private lastPolledMessageId: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('aabha_signbridge_twoway');
      this.broadcastChannel.onmessage = this.handleBroadcastMessage;
    }
  }

  public setRoomId(roomId: string) {
    this.roomId = roomId;
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast Patient Detected Sign to Doctor Screen
   */
  public async sendPatientSign(result: RecognitionResult, senderName = 'Patient'): Promise<void> {
    const msg: SignBridgeLiveMessage = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      roomId: this.roomId,
      senderRole: 'PATIENT',
      senderName,
      type: result.isEmergency ? 'EMERGENCY_ALERT' : 'PATIENT_SIGN',
      text: result.text,
      hindiText: result.hindiText,
      marathiText: result.marathiText,
      bengaliText: result.bengaliText,
      assameseText: result.assameseText,
      confidence: result.confidence,
      isEmergency: result.isEmergency,
      timestamp: new Date().toISOString(),
      icon: result.icon
    };

    this.dispatchLocal(msg);
    this.sendToServer(msg);
  }

  /**
   * Broadcast Doctor Detected Sign to Patient Screen
   */
  public async sendDoctorSign(result: RecognitionResult, senderName = 'Dr. Anita Verma'): Promise<void> {
    const msg: SignBridgeLiveMessage = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      roomId: this.roomId,
      senderRole: 'DOCTOR',
      senderName,
      type: result.isEmergency ? 'EMERGENCY_ALERT' : 'DOCTOR_SIGN',
      text: result.text,
      hindiText: result.hindiText,
      marathiText: result.marathiText,
      bengaliText: result.bengaliText,
      assameseText: result.assameseText,
      confidence: result.confidence,
      isEmergency: result.isEmergency,
      timestamp: new Date().toISOString(),
      icon: result.icon
    };

    this.dispatchLocal(msg);
    this.sendToServer(msg);
  }

  /**
   * Broadcast Doctor Speech-To-Text Voice Subtitle to Patient Screen
   */
  public async sendDoctorSubtitle(subtitleText: string, senderName = 'Dr. Anita Verma'): Promise<void> {
    if (!subtitleText.trim()) return;

    const msg: SignBridgeLiveMessage = {
      id: 'sub-' + Date.now(),
      roomId: this.roomId,
      senderRole: 'DOCTOR',
      senderName,
      type: 'DOCTOR_SPEECH_SUBTITLE',
      text: subtitleText.trim(),
      confidence: 95,
      timestamp: new Date().toISOString()
    };

    this.dispatchLocal(msg);
    this.sendToServer(msg);
  }

  /**
   * Broadcast Communication Mode Switch (Sign, Voice, Text)
   */
  public broadcastModeChange(mode: CommunicationMode, role: 'PATIENT' | 'DOCTOR'): void {
    const msg: SignBridgeLiveMessage = {
      id: 'mode-' + Date.now(),
      roomId: this.roomId,
      senderRole: role,
      senderName: role === 'PATIENT' ? 'Patient' : 'Dr. Anita Verma',
      type: 'MODE_CHANGE',
      text: `Switched communication mode to ${mode}`,
      mode,
      timestamp: new Date().toISOString()
    };

    this.dispatchLocal(msg);
  }

  /**
   * Start periodic server polling fallback for background tab synchronization
   */
  public startPolling(intervalMs = 2000) {
    if (this.pollingIntervalId) return;

    this.pollingIntervalId = setInterval(async () => {
      try {
        const list: any = await api.get(`/signbridge/messages/${this.roomId}`);
        if (Array.isArray(list) && list.length > 0) {
          const latest = list[list.length - 1];
          if (latest && latest.id !== this.lastPolledMessageId) {
            this.lastPolledMessageId = latest.id;
            this.notifyListeners(latest);
          }
        }
      } catch {}
    }, intervalMs);
  }

  public stopPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  private dispatchLocal(msg: SignBridgeLiveMessage) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(msg);
    }
    this.notifyListeners(msg);
  }

  private handleBroadcastMessage = (event: MessageEvent) => {
    const msg = event.data as SignBridgeLiveMessage;
    if (msg && msg.roomId === this.roomId) {
      this.notifyListeners(msg);
    }
  };

  private notifyListeners(msg: SignBridgeLiveMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(msg);
      } catch (err) {
        console.error('[SignBridge Comm] Error in listener callback:', err);
      }
    });
  }

  private async sendToServer(msg: SignBridgeLiveMessage) {
    try {
      await api.post('/signbridge/messages', msg);
    } catch {}
  }
}

export const realTimeSignCommunicationService = new RealTimeSignCommunicationService();
