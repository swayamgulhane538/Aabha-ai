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

const VALID_TYPES = ['MEDICINE', 'WATER', 'MEAL', 'APPOINTMENT', 'ACTIVITY', 'FAMILY_CALL', 'ROUTINE', 'CUSTOM'];

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-patient-id';
    let dbReminders: any[] = [];
    try {
      dbReminders = await prisma.reminder.findMany({
        where: { userId },
        orderBy: { scheduledAt: 'asc' }
      });
    } catch {}

    // Merge fallback reminders with DB reminders by ID
    const mergedMap = new Map<string, any>();
    fallbackReminders.forEach(r => mergedMap.set(r.id, r));
    dbReminders.forEach(r => {
      let meta = (r as any).metadata;
      if (!meta && r.description && r.description.startsWith('{')) {
        try {
          meta = JSON.parse(r.description);
        } catch {}
      }
      mergedMap.set(r.id, { ...r, metadata: meta || { isVoiceAlarm: true, voiceMessage: r.description || r.title, voiceLanguage: 'hi', enabled: true } });
    });

    const list = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime()
    );
    return res.json(list);
  } catch (err) {
    return res.json(fallbackReminders);
  }
});

router.get('/due', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-patient-id';
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
  const userId = req.user?.id || req.body.userId || 'demo-patient-id';
  const { title, type, description, scheduledAt, recurrence, status, metadata } = req.body;

  const cleanType = VALID_TYPES.includes(type) ? type : 'MEDICINE';
  const cleanStatus = (status === 'COMPLETED' || status === 'ACTIVE') ? status : 'ACTIVE';
  const cleanSched = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 3600000);
  const newId = 'rem-' + Date.now();

  const newMemoryItem = {
    id: newId,
    userId,
    title: title || 'Medicine',
    type: cleanType,
    description: description || (metadata?.voiceMessage) || 'Daily Reminder',
    scheduledAt: cleanSched.toISOString(),
    recurrence: recurrence || 'DAILY',
    status: cleanStatus,
    metadata: metadata || {
      isVoiceAlarm: true,
      voiceMessage: description || title || 'Time for reminder',
      voiceLanguage: 'hi',
      voiceVolume: 1.0,
      vibration: true,
      ringtone: 'temple_bell',
      enabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  fallbackReminders.unshift(newMemoryItem);

  try {
    const dbItem = await prisma.reminder.create({
      data: {
        id: newId,
        userId,
        title: newMemoryItem.title,
        type: cleanType as any,
        description: newMemoryItem.description,
        scheduledAt: cleanSched,
        recurrence: newMemoryItem.recurrence,
        status: cleanStatus as any
      }
    });
    return res.status(201).json({ ...dbItem, metadata: newMemoryItem.metadata });
  } catch (err) {
    console.warn('Prisma reminder create fallback to memory:', err);
    return res.status(201).json(newMemoryItem);
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { title, type, description, scheduledAt, recurrence, status, metadata } = req.body;

  // Update in fallbackReminders
  const idx = fallbackReminders.findIndex(r => r.id === id);
  if (idx !== -1) {
    fallbackReminders[idx] = {
      ...fallbackReminders[idx],
      ...req.body,
      metadata: metadata ? { ...fallbackReminders[idx].metadata, ...metadata } : fallbackReminders[idx].metadata,
      updatedAt: new Date().toISOString()
    };
  }

  try {
    const updateData: any = {};
    if (title) updateData.title = title;
    if (type && VALID_TYPES.includes(type)) updateData.type = type;
    if (description) updateData.description = description;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (recurrence) updateData.recurrence = recurrence;
    if (status) updateData.status = status;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData
    });
    return res.json({ ...reminder, metadata: metadata || (idx !== -1 ? fallbackReminders[idx].metadata : undefined) });
  } catch (err) {
    if (idx !== -1) {
      return res.json(fallbackReminders[idx]);
    }
    return res.json({ id, ...req.body });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  fallbackReminders = fallbackReminders.filter(r => r.id !== id);

  try {
    await prisma.reminder.delete({ where: { id } });
    return res.json({ message: 'Reminder deleted' });
  } catch (err) {
    return res.json({ message: 'Reminder deleted' });
  }
});

export default router;
