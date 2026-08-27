import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// In-memory fallback reminders with Smart Voice Alarm support
let fallbackReminders: any[] = [
  {
    id: 'rem-1',
    userId: 'demo-patient-id',
    type: 'MEDICINE',
    title: 'Morning Blood Pressure Medication',
    description: 'Take Donepezil 5mg tablet with lukewarm water after breakfast.',
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    status: 'ACTIVE',
    recurrence: 'DAILY',
    metadata: {
      isVoiceAlarm: true,
      voiceMessage: 'Medicine lene ka time ho gaya hai. Kripya Donepezil 5mg paani ke saath le lijiye.',
      voiceLanguage: 'hi',
      voiceVolume: 0.9,
      vibration: true,
      ringtone: 'temple_bell',
      enabled: true
    }
  },
  {
    id: 'rem-2',
    userId: 'demo-patient-id',
    type: 'WATER',
    title: 'Drink a Glass of Warm Water',
    description: 'Hydration check - drink 1 full glass of water.',
    scheduledAt: new Date(Date.now() + 7200000).toISOString(),
    status: 'ACTIVE',
    recurrence: 'DAILY',
    metadata: {
      isVoiceAlarm: true,
      voiceMessage: 'Kaka, ek glass garam paani piun ghya. Sharir tajatwana theva.',
      voiceLanguage: 'mr',
      voiceVolume: 0.85,
      vibration: true,
      ringtone: 'gentle_flute',
      enabled: true
    }
  },
  {
    id: 'rem-3',
    userId: 'demo-patient-id',
    type: 'ACTIVITY',
    title: 'Cognitive Memory Exercise with AABHA',
    description: 'Brain stimulation with Level 2 card match.',
    scheduledAt: new Date(Date.now() + 10800000).toISOString(),
    status: 'ACTIVE',
    recurrence: 'WEEKDAYS',
    metadata: {
      isVoiceAlarm: true,
      voiceMessage: 'Chaliye thoda dimagi vyayam aur memory game khelte hain.',
      voiceLanguage: 'hi',
      voiceVolume: 0.9,
      vibration: true,
      ringtone: 'zen_chime',
      enabled: true
    }
  },
  {
    id: 'rem-4',
    userId: 'demo-patient-id',
    type: 'FAMILY_CALL',
    title: 'Evening Call with Priya & Family',
    description: 'Daily family check-in and cheerful conversation.',
    scheduledAt: new Date(Date.now() + 21600000).toISOString(),
    status: 'ACTIVE',
    recurrence: 'DAILY',
    metadata: {
      isVoiceAlarm: true,
      voiceMessage: 'Priya aur Aarav ko call karne ka samay ho gaya hai.',
      voiceLanguage: 'hi',
      voiceVolume: 0.95,
      vibration: true,
      ringtone: 'nature_birds',
      enabled: true
    }
  },
];

router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' }
    });
    return res.json(reminders);
  } catch (err) {
    return res.json(fallbackReminders);
  }
});

router.get('/due', async (req, res) => {
  try {
    const userId = req.user!.id;
    const dueReminders = await prisma.reminder.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        scheduledAt: { lte: new Date() }
      }
    });
    return res.json(dueReminders);
  } catch (err) {
    return res.json(fallbackReminders.slice(0, 2));
  }
});

router.post('/', async (req, res) => {
  try {
    const reminder = await prisma.reminder.create({
      data: { ...req.body, userId: req.body.userId || req.user!.id }
    });
    return res.status(201).json(reminder);
  } catch (err) {
    const newRem = {
      id: 'rem-' + Date.now(),
      ...req.body,
      userId: req.body.userId || req.user!.id,
      status: req.body.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    fallbackReminders.push(newRem);
    return res.status(201).json(newRem);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: req.body
    });
    return res.json(reminder);
  } catch (err) {
    const idx = fallbackReminders.findIndex(r => r.id === req.params.id);
    if (idx !== -1) {
      fallbackReminders[idx] = { ...fallbackReminders[idx], ...req.body };
      return res.json(fallbackReminders[idx]);
    }
    return res.json({ id: req.params.id, ...req.body });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.reminder.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Reminder deleted' });
  } catch (err) {
    fallbackReminders = fallbackReminders.filter(r => r.id !== req.params.id);
    return res.json({ message: 'Reminder deleted' });
  }
});

export default router;
