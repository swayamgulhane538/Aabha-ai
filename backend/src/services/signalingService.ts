/**
 * SignBridge – Real WebRTC Signaling Service (Socket.IO)
 * 
 * Manages:
 * 1. Doctor presence & availability registry (AVAILABLE, IN_CONSULTATION, OFFLINE)
 * 2. Real WebRTC call signaling: SDP Offer, SDP Answer, ICE candidates
 * 3. Call invitation lifecycle: call:initiate -> call:incoming -> call:accept / call:reject -> call:end
 * 4. Real-time ISL animation sequences and patient gesture broadcasts
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { db } from '../store/persistentDatabase';

export type DoctorAvailabilityStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'OFFLINE';

export interface DoctorPresence {
  doctorId: string;
  doctorName: string;
  specialty: string;
  status: DoctorAvailabilityStatus;
  socketId: string;
  lastSeen: string;
}

export interface ActiveCallSession {
  callId: string;
  patientId: string;
  patientName: string;
  patientSocketId: string;
  doctorId: string;
  doctorName: string;
  doctorSocketId: string;
  status: 'CALLING' | 'RINGING' | 'CONNECTING' | 'CONNECTED' | 'ENDED' | 'REJECTED' | 'FAILED';
  startedAt: string;
}

class SignalingService {
  private io: Server | null = null;
  private doctors: Map<string, DoctorPresence> = new Map();
  private activeCalls: Map<string, ActiveCallSession> = new Map();
  private socketUserMap: Map<string, { userId: string; role: string; name: string }> = new Map();

  constructor() {
    // Seed standard doctor presence so patients immediately see Dr. Anita Verma
    this.doctors.set('uuid-demo-nurse', {
      doctorId: 'uuid-demo-nurse',
      doctorName: 'Dr. Anita Verma',
      specialty: 'Chief Cognitive Neurologist',
      status: 'AVAILABLE',
      socketId: '',
      lastSeen: new Date().toISOString()
    });
  }

  public init(httpServer: HttpServer, frontendUrl: string) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // Permissive for multi-device network discovery
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleSocketConnection(socket);
    });

    console.log('[Signaling] Real WebRTC Socket.IO signaling server initialized.');
  }

  public getDoctorsList(): DoctorPresence[] {
    return Array.from(this.doctors.values());
  }

  private handleSocketConnection(socket: Socket) {
    // ─── 1. USER REGISTRATION & PRESENCE ────────────────────────────────────
    socket.on('user:register', (data: { userId: string; role: string; name: string; specialty?: string }) => {
      const { userId, role, name, specialty } = data;
      this.socketUserMap.set(socket.id, { userId, role, name });

      if (role === 'CAREGIVER' || role === 'DOCTOR') {
        const existing = this.doctors.get(userId);
        this.doctors.set(userId, {
          doctorId: userId,
          doctorName: name || existing?.doctorName || 'Dr. Anita Verma',
          specialty: specialty || existing?.specialty || 'Cognitive Neurologist',
          status: 'AVAILABLE',
          socketId: socket.id,
          lastSeen: new Date().toISOString()
        });
        this.broadcastDoctorList();
      }
    });

    // Doctor status change (AVAILABLE, IN_CONSULTATION, OFFLINE)
    socket.on('doctor:set-status', (data: { status: DoctorAvailabilityStatus }) => {
      const user = this.socketUserMap.get(socket.id);
      if (user && this.doctors.has(user.userId)) {
        const doc = this.doctors.get(user.userId)!;
        doc.status = data.status;
        doc.lastSeen = new Date().toISOString();
        this.broadcastDoctorList();
      }
    });

    // ─── 2. CALL INVITATION LIFECYCLE ───────────────────────────────────────
    socket.on('call:initiate', (data: { doctorId: string; patientId: string; patientName: string }) => {
      const { doctorId, patientId, patientName } = data;
      const doctor = this.doctors.get(doctorId) || Array.from(this.doctors.values())[0];

      if (!doctor || doctor.status === 'OFFLINE') {
        socket.emit('call:failed', { message: 'Doctor is currently offline.' });
        return;
      }

      if (doctor.status === 'IN_CONSULTATION') {
        socket.emit('call:failed', { message: 'Doctor is currently in another consultation. Please wait.' });
        return;
      }

      const callId = 'call-' + Date.now();
      const newSession: ActiveCallSession = {
        callId,
        patientId,
        patientName: patientName || 'Demo Patient',
        patientSocketId: socket.id,
        doctorId: doctor.doctorId,
        doctorName: doctor.doctorName,
        doctorSocketId: doctor.socketId,
        status: 'CALLING',
        startedAt: new Date().toISOString()
      };

      this.activeCalls.set(callId, newSession);
      socket.join(callId);

      // Notify Patient that call is placed and ringing
      socket.emit('call:initiated', { callId, doctorName: doctor.doctorName, status: 'RINGING' });

      // Notify Doctor of incoming consultation request
      if (doctor.socketId && this.io) {
        this.io.to(doctor.socketId).emit('call:incoming', {
          callId,
          patientId,
          patientName: patientName || 'Demo Patient',
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback broadcast to all doctor sockets
        socket.broadcast.emit('call:incoming', {
          callId,
          patientId,
          patientName: patientName || 'Demo Patient',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Doctor Accepts Call
    socket.on('call:accept', (data: { callId: string }) => {
      const session = this.activeCalls.get(data.callId);
      if (!session) return;

      session.status = 'CONNECTED';
      session.doctorSocketId = socket.id;
      socket.join(data.callId);

      // Update doctor availability status
      if (this.doctors.has(session.doctorId)) {
        this.doctors.get(session.doctorId)!.status = 'IN_CONSULTATION';
        this.broadcastDoctorList();
      }

      // Notify both parties that call is accepted and WebRTC connection can start
      if (this.io) {
        this.io.to(data.callId).emit('call:accepted', {
          callId: session.callId,
          patientId: session.patientId,
          doctorId: session.doctorId,
          status: 'CONNECTED'
        });
      }
    });

    // Doctor Rejects Call
    socket.on('call:reject', (data: { callId: string; reason?: string }) => {
      const session = this.activeCalls.get(data.callId);
      if (session) {
        session.status = 'REJECTED';
        if (this.io) {
          this.io.to(session.patientSocketId).emit('call:rejected', {
            callId: data.callId,
            reason: data.reason || 'Doctor is unable to take the call at this moment.'
          });
        }
        this.activeCalls.delete(data.callId);
      }
    });

    // End Call
    socket.on('call:end', (data: { callId: string }) => {
      const session = this.activeCalls.get(data.callId);
      if (session) {
        session.status = 'ENDED';

        // Reset doctor availability
        if (this.doctors.has(session.doctorId)) {
          this.doctors.get(session.doctorId)!.status = 'AVAILABLE';
          this.broadcastDoctorList();
        }

        if (this.io) {
          this.io.to(data.callId).emit('call:ended', { callId: data.callId });
        }
        this.activeCalls.delete(data.callId);
      }
    });

    // ─── 3. WEBRTC SIGNALING: SDP OFFER / ANSWER & ICE CANDIDATES ───────────
    socket.on('webrtc:offer', (data: { callId: string; sdp: any }) => {
      socket.to(data.callId).emit('webrtc:offer', {
        callId: data.callId,
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc:answer', (data: { callId: string; sdp: any }) => {
      socket.to(data.callId).emit('webrtc:answer', {
        callId: data.callId,
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc:ice-candidate', (data: { callId: string; candidate: any }) => {
      socket.to(data.callId).emit('webrtc:ice-candidate', {
        callId: data.callId,
        candidate: data.candidate
      });
    });

    // ─── 4. REAL-TIME TWO-WAY ISL DATA DISPATCH ─────────────────────────────
    socket.on('sign:detected', (data: { callId: string; sign: any }) => {
      socket.to(data.callId).emit('sign:detected', data.sign);
    });

    socket.on('isl:sequence', (data: { callId: string; sequence: any }) => {
      socket.to(data.callId).emit('isl:sequence', data.sequence);
    });

    // ─── 5. DISCONNECTION CLEANUP ───────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = this.socketUserMap.get(socket.id);
      if (user && this.doctors.has(user.userId)) {
        const doc = this.doctors.get(user.userId)!;
        doc.status = 'OFFLINE';
        this.broadcastDoctorList();
      }
      this.socketUserMap.delete(socket.id);
    });
  }

  private broadcastDoctorList() {
    if (this.io) {
      this.io.emit('doctor:list', this.getDoctorsList());
    }
  }
}

export const signalingService = new SignalingService();
