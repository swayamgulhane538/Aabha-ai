import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

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

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

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

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
