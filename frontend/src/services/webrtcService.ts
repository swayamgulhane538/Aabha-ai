/**
 * SignBridge – WebRTC Peer-to-Peer Video & Audio Service
 * 
 * Provides:
 * - Local camera/microphone acquisition with permission handling
 * - Peer-to-peer RTCPeerConnection wrapper
 * - Mute/Unmute & Video On/Off state tracking
 * - Connection status events (CONNECTED, CONNECTING, DISCONNECTED, RECONNECTING)
 * - Cross-tab and dual-client simulated signaling for local demo testing
 */

export type CallConnectionState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'PERMISSION_DENIED';

export interface WebRTCCallbackHandlers {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: CallConnectionState) => void;
  onError?: (error: string) => void;
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private connectionState: CallConnectionState = 'IDLE';
  private handlers: WebRTCCallbackHandlers = {};
  private broadcastChannel: BroadcastChannel | null = null;
  private roomId: string = 'aabha-signbridge-room';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('aabha_signbridge_signaling');
      this.broadcastChannel.onmessage = this.handleSignalingMessage;
    }
  }

  public setHandlers(handlers: WebRTCCallbackHandlers) {
    this.handlers = handlers;
  }

  public getState(): CallConnectionState {
    return this.connectionState;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Start or Join WebRTC Call
   */
  public async startCall(roomId = 'aabha-signbridge-room'): Promise<MediaStream | null> {
    this.roomId = roomId;
    this.updateState('CONNECTING');

    try {
      // 1. Request camera and microphone access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera/Microphone API is not supported in this browser.');
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      if (this.handlers.onLocalStream) {
        this.handlers.onLocalStream(this.localStream);
      }

      // 2. Initialize RTCPeerConnection
      const rtcConfig: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      this.peerConnection = new RTCPeerConnection(rtcConfig);

      // Add local tracks to connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle incoming remote tracks
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0] && this.handlers.onRemoteStream) {
          this.handlers.onRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        if (!this.peerConnection) return;
        const iceState = this.peerConnection.iceConnectionState;
        if (iceState === 'connected' || iceState === 'completed') {
          this.updateState('CONNECTED');
        } else if (iceState === 'disconnected') {
          this.updateState('RECONNECTING');
        } else if (iceState === 'failed' || iceState === 'closed') {
          this.updateState('DISCONNECTED');
        }
      };

      // Broadcast join event to peer
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'PEER_JOINED', roomId: this.roomId, timestamp: Date.now() });
      }

      // Mark connected
      this.updateState('CONNECTED');
      return this.localStream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.updateState('PERMISSION_DENIED');
        if (this.handlers.onError) {
          this.handlers.onError('Camera and Microphone permissions were denied. Please allow permissions in browser settings.');
        }
      } else {
        this.updateState('DISCONNECTED');
        if (this.handlers.onError) {
          this.handlers.onError(err?.message || 'Failed to establish video stream.');
        }
      }
      return null;
    }
  }

  /**
   * Toggle Audio Mute / Unmute
   */
  public toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle Video Camera On / Off
   */
  public toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * End Call & Cleanly Release Hardware Resources
   */
  public endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'PEER_LEFT', roomId: this.roomId, timestamp: Date.now() });
    }

    this.updateState('DISCONNECTED');
  }

  private handleSignalingMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data || data.roomId !== this.roomId) return;

    if (data.type === 'PEER_JOINED') {
      if (this.connectionState === 'CONNECTED' && this.handlers.onStateChange) {
        this.handlers.onStateChange('CONNECTED');
      }
    } else if (data.type === 'PEER_LEFT') {
      // Remote peer left
    }
  };

  private updateState(newState: CallConnectionState) {
    this.connectionState = newState;
    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(newState);
    }
  }
}

export const webrtcService = new WebRTCService();
