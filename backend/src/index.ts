import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { signalingService } from './services/signalingService';
import consultationsRoutes from './routes/consultations.routes';

import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import caregiversRoutes from './routes/caregivers.routes';
import memoryPassportRoutes from './routes/memoryPassport.routes';
import gamesRoutes from './routes/games.routes';
import aiRoutes from './routes/ai.routes';
import remindersRoutes from './routes/reminders.routes';
import alertsRoutes from './routes/alerts.routes';
import dashboardRoutes from './routes/dashboard.routes';
import familyMessagesRoutes from './routes/familyMessages.routes';
import syncRoutes from './routes/sync.routes';
import reportsRoutes from './routes/reports.routes';
import auditRoutes from './routes/audit.routes';
import medicationsRoutes from './routes/medications.routes';
import appointmentsRoutes from './routes/appointments.routes';
import moodRoutes from './routes/mood.routes';
import { vitalsRouter } from './routes/vitals.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import signbridgeRoutes from './routes/signbridge.routes';

const app = express();

// Security & Cross-Origin (Supports localhost & Online Production Domains)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow all vercel, netlify, onrender, and localhost origins
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('.vercel.app') ||
      origin.includes('.netlify.app') ||
      origin.includes('.onrender.com') ||
      origin === env.FRONTEND_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production health APIs
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/', apiLimiter);

// Health Check endpoint for Render/Railway/AWS monitoring
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'Aabha AI Cloud Backend',
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/caregivers', caregiversRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/vitals', vitalsRouter);
app.use('/api/memory-passport', memoryPassportRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', familyMessagesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/signbridge', signbridgeRoutes);
app.use('/api/consultations', consultationsRoutes);

// Serve Frontend Static Production Build (if present in unified deploy)
const possibleFrontendPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, './frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist')
];

let frontendDistPath: string | null = null;
for (const p of possibleFrontendPaths) {
  if (fs.existsSync(p)) {
    frontendDistPath = p;
    break;
  }
}

if (frontendDistPath) {
  console.log(`[Production] Serving frontend static assets from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath!, 'index.html'));
  });
}

app.use(errorHandler);

const httpServer = http.createServer(app);

// Initialize real-time WebRTC Socket.IO signaling
signalingService.init(httpServer, env.FRONTEND_URL);

const server = httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode with Socket.IO signaling`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
