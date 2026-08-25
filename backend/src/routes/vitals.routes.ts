import { Router, Request, Response } from 'express';
import { db, VitalsRecord } from '../store/persistentDatabase';
import { v4 as uuidv4 } from 'uuid';

export const vitalsRouter = Router();

// GET /api/vitals - Retrieve all vitals history for logged-in patient
vitalsRouter.get('/', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const patientUserId = (req.query.patientUserId as string) || user.id;
    const records = db.getVitals(patientUserId);

    res.json({
      success: true,
      patientUserId,
      vitals: records
    });
  } catch (err: any) {
    console.error('Error fetching vitals:', err);
    res.status(500).json({ error: 'Failed to fetch vitals records' });
  }
});

// POST /api/vitals - Log new daily vital metrics
vitalsRouter.post('/', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      systolicBp,
      diastolicBp,
      bloodGlucose,
      heartRate,
      temperature,
      mood,
      sleepHours,
      stressLevel,
      notes
    } = req.body;

    const patientRecord = db.getUserById(user.id);
    const patientId = patientRecord?.patientId || user.patientId || 'PAT-2026-000001';

    const newRecord: VitalsRecord = {
      id: `vit-${uuidv4()}`,
      patientUserId: user.id,
      patientId,
      systolicBp: systolicBp ? Number(systolicBp) : undefined,
      diastolicBp: diastolicBp ? Number(diastolicBp) : undefined,
      bloodGlucose: bloodGlucose ? Number(bloodGlucose) : undefined,
      heartRate: heartRate ? Number(heartRate) : undefined,
      temperature: temperature ? Number(temperature) : undefined,
      mood: mood || 'HAPPY',
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      stressLevel: stressLevel ? Number(stressLevel) : undefined,
      notes: notes || '',
      loggedAt: new Date().toISOString()
    };

    db.addVitals(newRecord);

    // Smart health alert triggers:
    if (newRecord.systolicBp && newRecord.systolicBp >= 140) {
      db.createNotification({
        id: `notif-${uuidv4()}`,
        userId: user.id,
        title: '⚠️ Elevated Blood Pressure Notice',
        message: `Your systolic reading of ${newRecord.systolicBp} mmHg is elevated. Please rest, drink water, and practice Guided Box Breathing.`,
        type: 'ALERT',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    if (newRecord.temperature && newRecord.temperature >= 100.4) {
      db.createNotification({
        id: `notif-${uuidv4()}`,
        userId: user.id,
        title: '🌡️ Body Temperature Alert (Fever)',
        message: `Your body temperature is ${newRecord.temperature}°F. Stay hydrated and inform your caregiver or doctor.`,
        type: 'ALERT',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    if (newRecord.bloodGlucose && newRecord.bloodGlucose >= 180) {
      db.createNotification({
        id: `notif-${uuidv4()}`,
        userId: user.id,
        title: '🩸 High Blood Glucose Notice',
        message: `Your glucose reading is ${newRecord.bloodGlucose} mg/dL. Review your prescribed routine with your doctor.`,
        type: 'ALERT',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vitals logged successfully',
      vital: newRecord
    });
  } catch (err: any) {
    console.error('Error logging vitals:', err);
    res.status(500).json({ error: 'Failed to record vitals' });
  }
});

// GET /api/vitals/suggestions - Smart AI correlation analysis
vitalsRouter.get('/suggestions', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vitals = db.getVitals(user.id);
    const games = db.getGameResults(user.id);

    const latestVital = vitals[0];
    const avgSleep = vitals.length > 0
      ? vitals.reduce((sum, v) => sum + (v.sleepHours || 7), 0) / vitals.length
      : 7.5;

    const avgGameAccuracy = games.length > 0
      ? games.reduce((sum, g) => sum + g.accuracy, 0) / games.length
      : 85;

    const suggestions: string[] = [];

    if (latestVital && latestVital.stressLevel && latestVital.stressLevel > 5) {
      suggestions.push('🧘 High stress detected. Recommended: 5 minutes of Guided Box Breathing before afternoon rest.');
    } else {
      suggestions.push('✨ Great emotional balance today. Engage in 10 minutes of Relaxation Art Coloring to foster creativity.');
    }

    if (avgSleep < 7) {
      suggestions.push('😴 Sleep average is below 7 hours. Adequate sleep helps reinforce daily memory consolidation.');
    } else {
      suggestions.push('🌟 Sleep duration is optimal (7.5+ hrs), supporting cognitive sharpness and motor dexterity.');
    }

    if (avgGameAccuracy >= 80) {
      suggestions.push('🎯 High cognitive accuracy in recent games! Try the Physiotherapy Hand Dexterity exercise to train fine motor reflexes.');
    }

    res.json({
      success: true,
      suggestions,
      metricsSummary: {
        totalVitalsLogged: vitals.length,
        averageSleep: Math.round(avgSleep * 10) / 10,
        averageGameAccuracy: Math.round(avgGameAccuracy),
        latestBp: latestVital ? `${latestVital.systolicBp || 120}/${latestVital.diastolicBp || 80}` : '120/80'
      }
    });
  } catch (err: any) {
    console.error('Error generating AI suggestions:', err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});
