/**
 * SignBridge – Real WebRTC Signaling Client (Socket.IO)
 * 
 * Handles real-time signaling over the internet:
 * - User registration & presence
 * - Doctor availability tracking
 * - Call lifecycle: call:initiate -> call:incoming -> call:accept / call:reject -> call:end
 * - WebRTC SDP Offer / Answer and ICE Candidate exchange
 * - Two-Way ISL Sign and Avatar sequence data transmission
 */

import { io, Socket } from 'socket.io-client';

export type DoctorAvailabilityStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'OFFLINE';

export interface DoctorPresence {
  doctorId: string;
  doctorName: string;
  specialty: string;
  status: DoctorAvailabilityStatus;
  socketId?: string;
  lastSeen?: string;
}

export interface SignalingEventCallbacks {
  onDoctorListUpdate?: (doctors: DoctorPresence[]) => void;
  onIncomingCall?: (data: { callId: string; patientId: string; patientName: string; timestamp: string }) => void;
  onCallInitiated?: (data: { callId: string; doctorName: string; status: string }) => void;
  onCallAccepted?: (data: { callId: string; patientId: string; doctorId: string; status: string }) => void;
  onCallRejected?: (data: { callId: string; reason: string }) => void;
  onCallEnded?: (data: { callId: string }) => void;
  onCallFailed?: (data: { message: string }) => void;
  onWebRTCOffer?: (data: { callId: string; sdp: any }) => void;
  onWebRTCAnswer?: (data: { callId: string; sdp: any }) => void;
  onWebRTCIceCandidate?: (data: { callId: string; candidate: any }) => void;
  onSignDetected?: (sign: any) => void;
  onISLSequence?: (sequence: any) => void;
}

class SignalingClient {
  private socket: Socket | null = null;
  private callbacks: SignalingEventCallbacks = {};
  private currentUserId: string = '';
  private currentRole: string = '';
  private currentName: string = '';

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket?.connected) return;

    const env = (import.meta as any).env;
    const backendUrl = env?.VITE_API_URL 
      ? env.VITE_API_URL.replace('/api', '')
      : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001');

    this.socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('[SignalingClient] Connected to signaling server:', this.socket?.id);
      if (this.currentUserId) {
        this.registerUser(this.currentUserId, this.currentRole, this.currentName);
      }
    });

    this.socket.on('doctor:list', (doctors: DoctorPresence[]) => {
      if (this.callbacks.onDoctorListUpdate) {
        this.callbacks.onDoctorListUpdate(doctors);
      }
    });

    this.socket.on('call:incoming', (data) => {
      if (this.callbacks.onIncomingCall) {
        this.callbacks.onIncomingCall(data);
      }
    });

    this.socket.on('call:initiated', (data) => {
      if (this.callbacks.onCallInitiated) {
        this.callbacks.onCallInitiated(data);
      }
    });

    this.socket.on('call:accepted', (data) => {
      if (this.callbacks.onCallAccepted) {
        this.callbacks.onCallAccepted(data);
      }
    });

    this.socket.on('call:rejected', (data) => {
      if (this.callbacks.onCallRejected) {
        this.callbacks.onCallRejected(data);
      }
    });

    this.socket.on('call:ended', (data) => {
      if (this.callbacks.onCallEnded) {
        this.callbacks.onCallEnded(data);
      }
    });

    this.socket.on('call:failed', (data) => {
      if (this.callbacks.onCallFailed) {
        this.callbacks.onCallFailed(data);
      }
    });

    this.socket.on('webrtc:offer', (data) => {
      if (this.callbacks.onWebRTCOffer) {
        this.callbacks.onWebRTCOffer(data);
      }
    });

    this.socket.on('webrtc:answer', (data) => {
      if (this.callbacks.onWebRTCAnswer) {
        this.callbacks.onWebRTCAnswer(data);
      }
    });

    this.socket.on('webrtc:ice-candidate', (data) => {
      if (this.callbacks.onWebRTCIceCandidate) {
        this.callbacks.onWebRTCIceCandidate(data);
      }
    });

    this.socket.on('sign:detected', (data) => {
      if (this.callbacks.onSignDetected) {
        this.callbacks.onSignDetected(data);
      }
    });

    this.socket.on('isl:sequence', (data) => {
      if (this.callbacks.onISLSequence) {
        this.callbacks.onISLSequence(data);
      }
    });
  }

  public setCallbacks(callbacks: SignalingEventCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public registerUser(userId: string, role: string, name: string, specialty?: string) {
    this.currentUserId = userId;
    this.currentRole = role;
    this.currentName = name;
    if (this.socket) {
      this.socket.emit('user:register', { userId, role, name, specialty });
    }
  }

  public setDoctorStatus(status: DoctorAvailabilityStatus) {
    if (this.socket) {
      this.socket.emit('doctor:set-status', { status });
    }
  }

  public initiateCall(doctorId: string, patientId: string, patientName: string) {
    if (this.socket) {
      this.socket.emit('call:initiate', { doctorId, patientId, patientName });
    }
  }

  public acceptCall(callId: string) {
    if (this.socket) {
      this.socket.emit('call:accept', { callId });
    }
  }

  public rejectCall(callId: string, reason?: string) {
    if (this.socket) {
      this.socket.emit('call:reject', { callId, reason });
    }
  }

  public endCall(callId: string) {
    if (this.socket) {
      this.socket.emit('call:end', { callId });
    }
  }

  public sendOffer(callId: string, sdp: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('webrtc:offer', { callId, sdp });
    }
  }

  public sendAnswer(callId: string, sdp: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('webrtc:answer', { callId, sdp });
    }
  }

  public sendIceCandidate(callId: string, candidate: RTCIceCandidateInit) {
    if (this.socket) {
      this.socket.emit('webrtc:ice-candidate', { callId, candidate });
    }
  }

  public broadcastSign(callId: string, sign: any) {
    if (this.socket) {
      this.socket.emit('sign:detected', { callId, sign });
    }
  }

  public broadcastISLSequence(callId: string, sequence: any) {
    if (this.socket) {
      this.socket.emit('isl:sequence', { callId, sequence });
    }
  }
}

export const signalingClient = new SignalingClient();
