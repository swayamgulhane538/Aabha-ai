/**
 * SignBridge – Real WebRTC Peer-to-Peer Video & Audio Service
 * 
 * Provides:
 * - Real camera and microphone capture via navigator.mediaDevices.getUserMedia()
 * - Real RTCPeerConnection with STUN / TURN fallback configuration
 * - Full SDP offer/answer exchange and ICE candidate handling via signalingClient
 * - Real media track controls: Mute/Unmute, Video On/Off
 * - Call state machine: IDLE, CALLING, RINGING, CONNECTING, CONNECTED, RECONNECTING, ENDED, REJECTED, FAILED, PERMISSION_DENIED
 */

import { signalingClient } from './signalingClient';

export type CallConnectionState = 
  | 'IDLE' 
  | 'CALLING' 
  | 'RINGING' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'RECONNECTING' 
  | 'ENDED' 
  | 'REJECTED' 
  | 'FAILED' 
  | 'PERMISSION_DENIED';

export interface WebRTCCallbackHandlers {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: CallConnectionState) => void;
  onError?: (error: string) => void;
  onAudioStateChange?: (isMuted: boolean) => void;
  onVideoStateChange?: (isVideoOff: boolean) => void;
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private connectionState: CallConnectionState = 'IDLE';
  private handlers: WebRTCCallbackHandlers = {};
  private activeCallId: string = '';
  private isInitiator: boolean = false;
  private isAudioMuted: boolean = false;
  private isVideoOff: boolean = false;

  constructor() {
    this.setupSignalingListeners();
  }

  public setHandlers(handlers: WebRTCCallbackHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public getState(): CallConnectionState {
    return this.connectionState;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public getActiveCallId(): string {
    return this.activeCallId;
  }

  /**
   * Acquire real local hardware camera and microphone
   */
  public async acquireLocalMedia(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone APIs are not supported in this browser.');
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (this.handlers.onLocalStream) {
        this.handlers.onLocalStream(this.localStream);
      }

      return this.localStream;
    } catch (err: any) {
      console.error('[WebRTC] Error acquiring camera/mic:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.updateState('PERMISSION_DENIED');
        if (this.handlers.onError) {
          this.handlers.onError('Camera/Microphone permission was denied. Please allow access.');
        }
      } else {
        this.updateState('FAILED');
        if (this.handlers.onError) {
          this.handlers.onError(err.message || 'Could not access camera or microphone.');
        }
      }
      return null;
    }
  }

  /**
   * Start outgoing call (Patient -> Doctor)
   */
  public async startOutgoingCall(doctorId: string, patientId: string, patientName: string) {
    this.updateState('CALLING');
    this.isInitiator = true;

    // Acquire local media first
    const stream = await this.acquireLocalMedia();
    if (!stream) return;

    // Initiate signaling
    signalingClient.initiateCall(doctorId, patientId, patientName);
  }

  /**
   * Accept incoming call (Doctor -> Patient)
   */
  public async acceptIncomingCall(callId: string) {
    this.activeCallId = callId;
    this.isInitiator = false;
    this.updateState('CONNECTING');

    const stream = await this.acquireLocalMedia();
    if (!stream) return;

    // Accept via signaling server
    signalingClient.acceptCall(callId);
    this.initPeerConnection();
  }

  /**
   * Reject incoming call
   */
  public rejectIncomingCall(callId: string, reason?: string) {
    signalingClient.rejectCall(callId, reason);
    this.updateState('IDLE');
  }

  /**
   * Initialize RTCPeerConnection with STUN & TURN servers
   */
  private initPeerConnection() {
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch {}
    }

    // Configure STUN & TURN servers
    const stunServer = (import.meta as any).env?.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
    const stunServer2 = 'stun:stun1.l.google.com:19302';
    const turnServer = (import.meta as any).env?.VITE_TURN_SERVER;
    const turnUsername = (import.meta as any).env?.VITE_TURN_USERNAME;
    const turnCredential = (import.meta as any).env?.VITE_TURN_CREDENTIAL;

    const iceServers: RTCIceServer[] = [
      { urls: [stunServer, stunServer2] }
    ];

    if (turnServer && turnUsername && turnCredential) {
      iceServers.push({
        urls: turnServer,
        username: turnUsername,
        credential: turnCredential
      });
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10
    });

    // Add local tracks to WebRTC peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle incoming remote media tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.handlers.onRemoteStream) {
          this.handlers.onRemoteStream(this.remoteStream);
        }
      }
    };

    // Send ICE candidates across signaling server
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.activeCallId) {
        signalingClient.sendIceCandidate(this.activeCallId, event.candidate.toJSON());
      }
    };

    // Connection state listeners
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      console.log('[WebRTC] Connection state changed:', this.peerConnection.connectionState);

      switch (this.peerConnection.connectionState) {
        case 'connected':
          this.updateState('CONNECTED');
          break;
        case 'connecting':
          this.updateState('CONNECTING');
          break;
        case 'disconnected':
          this.updateState('RECONNECTING');
          break;
        case 'failed':
          this.updateState('FAILED');
          break;
        case 'closed':
          this.updateState('ENDED');
          break;
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      if (this.peerConnection.iceConnectionState === 'connected' || this.peerConnection.iceConnectionState === 'completed') {
        this.updateState('CONNECTED');
      } else if (this.peerConnection.iceConnectionState === 'disconnected') {
        this.updateState('RECONNECTING');
      } else if (this.peerConnection.iceConnectionState === 'failed') {
        this.updateState('FAILED');
      }
    };
  }

  /**
   * Create and send SDP Offer (Caller)
   */
  private async createAndSendOffer() {
    if (!this.peerConnection || !this.activeCallId) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.peerConnection.setLocalDescription(offer);
      signalingClient.sendOffer(this.activeCallId, offer);
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
      this.updateState('FAILED');
    }
  }

  /**
   * Handle incoming SDP Offer and create SDP Answer (Callee)
   */
  private async handleIncomingOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      signalingClient.sendAnswer(this.activeCallId, answer);
    } catch (err) {
      console.error('[WebRTC] Error answering offer:', err);
    }
  }

  /**
   * Handle incoming SDP Answer (Caller)
   */
  private async handleIncomingAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('[WebRTC] Error setting remote answer:', err);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIncomingIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTC] Error adding ICE candidate:', err);
    }
  }

  /**
   * Signaling message listeners
   */
  private setupSignalingListeners() {
    signalingClient.setCallbacks({
      onCallInitiated: (data) => {
        this.activeCallId = data.callId;
        this.updateState('RINGING');
      },
      onCallAccepted: async (data) => {
        this.activeCallId = data.callId;
        this.updateState('CONNECTING');
        this.initPeerConnection();
        if (this.isInitiator) {
          // Caller creates the offer
          await this.createAndSendOffer();
        }
      },
      onCallRejected: (data) => {
        this.updateState('REJECTED');
        if (this.handlers.onError) {
          this.handlers.onError(data.reason || 'Call was declined by doctor.');
        }
      },
      onCallEnded: () => {
        this.endCall(false);
      },
      onCallFailed: (data) => {
        this.updateState('FAILED');
        if (this.handlers.onError) {
          this.handlers.onError(data.message);
        }
      },
      onWebRTCOffer: (data) => {
        if (data.callId === this.activeCallId && !this.isInitiator) {
          this.handleIncomingOffer(data.sdp);
        }
      },
      onWebRTCAnswer: (data) => {
        if (data.callId === this.activeCallId && this.isInitiator) {
          this.handleIncomingAnswer(data.sdp);
        }
      },
      onWebRTCIceCandidate: (data) => {
        if (data.callId === this.activeCallId) {
          this.handleIncomingIceCandidate(data.candidate);
        }
      }
    });
  }

  /**
   * Toggle Audio Mute
   */
  public toggleAudio(): boolean {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.isAudioMuted = !this.isAudioMuted;
        audioTracks.forEach(track => {
          track.enabled = !this.isAudioMuted;
        });
        if (this.handlers.onAudioStateChange) {
          this.handlers.onAudioStateChange(this.isAudioMuted);
        }
        return this.isAudioMuted;
      }
    }
    return false;
  }

  /**
   * Toggle Video Camera
   */
  public toggleVideo(): boolean {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        this.isVideoOff = !this.isVideoOff;
        videoTracks.forEach(track => {
          track.enabled = !this.isVideoOff;
        });
        if (this.handlers.onVideoStateChange) {
          this.handlers.onVideoStateChange(this.isVideoOff);
        }
        return this.isVideoOff;
      }
    }
    return false;
  }

  /**
   * End Consultation Call
   */
  public endCall(notifySignaling = true) {
    if (notifySignaling && this.activeCallId) {
      signalingClient.endCall(this.activeCallId);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      this.localStream = null;
    }

    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch {}
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.activeCallId = '';
    this.updateState('ENDED');
  }

  private updateState(newState: CallConnectionState) {
    this.connectionState = newState;
    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(newState);
    }
  }
}

export const webrtcService = new WebRTCService();
