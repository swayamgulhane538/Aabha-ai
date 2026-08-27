import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { db, ReminderRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

const VALID_TYPES = ['MEDICINE', 'WATER', 'MEAL', 'APPOINTMENT', 'ACTIVITY', 'FAMILY_CALL', 'ROUTINE', 'CUSTOM'];

// ─── 1. GET ALL REMINDERS (FOR LOGGED IN PATIENT) ───────────────────────────
router.get('/', (req, res) => {
  try {
    const user = req.user!;
    const reminders = db.getReminders(user.id);

    // If user is demo patient, ensure demo reminders exist
    if (reminders.length === 0 && (user.id === 'uuid-demo-patient' || user.email === 'demo.patient@aabha.ai')) {
      const allRems = db.getReminders();
      const demoRems = allRems.filter(r => r.userId === 'uuid-demo-patient');
      return res.json(demoRems);
    }

    const sorted = [...reminders].sort(
      (a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime()
    );

    return res.json(sorted);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch reminders' });
  }
});

// ─── 2. GET DUE REMINDERS ───────────────────────────────────────────────────
router.get('/due', (req, res) => {
  try {
    const user = req.user!;
    const reminders = db.getReminders(user.id);
    const now = new Date().getTime();

    const due = reminders.filter(r => {
      if (r.status === 'COMPLETED') return false;
      const sched = new Date(r.scheduledAt).getTime();
      return Math.abs(now - sched) <= 5 * 60 * 1000;
    });

    return res.json(due);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check due reminders' });
  }
});

// ─── 3. CREATE REMINDER (SAVES PERMANENTLY TO DATABASE DISK) ────────────────
router.post('/', (req, res) => {
  try {
    const user = req.user!;
    const { title, type, description, scheduledAt, recurrence, status, metadata } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Reminder title is required.' });
    }

    const cleanType = VALID_TYPES.includes(type) ? type : 'MEDICINE';
    const cleanStatus = (status === 'COMPLETED' || status === 'ACTIVE') ? status : 'ACTIVE';
    const cleanSched = scheduledAt ? new Date(scheduledAt).toISOString() : new Date(Date.now() + 3600000).toISOString();
    const newId = 'rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const newReminder: ReminderRecord = {
      id: newId,
      userId: user.id,
      title: title.trim(),
      type: cleanType,
      description: description || (metadata?.voiceMessage) || 'Scheduled reminder',
      scheduledAt: cleanSched,
      recurrence: recurrence || 'DAILY',
      status: cleanStatus as any,
      metadata: metadata || {
        isVoiceAlarm: true,
        voiceMessage: description || title,
        voiceLanguage: user.preferredLanguage || 'hi',
        voiceVolume: 1.0,
        vibration: true,
        ringtone: 'temple_bell',
        enabled: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save permanently to persistent JSON database file
    db.createReminder(newReminder);

    // Also attempt async sync to Prisma PostgreSQL if available
    prisma.reminder.create({
      data: {
        id: newId,
        userId: user.id,
        title: newReminder.title,
        type: cleanType as any,
        description: newReminder.description || '',
        scheduledAt: new Date(cleanSched),
        recurrence: newReminder.recurrence || 'DAILY',
        status: cleanStatus as any
      }
    }).catch(() => {});

    // Log audit
    db.logAudit(
      user.id,
      user.name || 'Patient',
      'CREATE_REMINDER',
      'REMINDER',
      newId,
      `Created reminder: "${newReminder.title}" scheduled for ${cleanSched}`,
      req.ip
    );

    return res.status(201).json(newReminder);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create reminder on database' });
  }
});

// ─── 4. UPDATE REMINDER (STATUS, TIME, TITLE) ───────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const { title, type, description, scheduledAt, recurrence, status, metadata } = req.body;

    const existing = db.getReminderById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const updates: Partial<ReminderRecord> = {};
    if (title) updates.title = title.trim();
    if (type && VALID_TYPES.includes(type)) updates.type = type;
    if (description !== undefined) updates.description = description;
    if (scheduledAt) updates.scheduledAt = new Date(scheduledAt).toISOString();
    if (recurrence) updates.recurrence = recurrence;
    if (status) updates.status = status;
    if (metadata) updates.metadata = { ...existing.metadata, ...metadata };

    const updated = db.updateReminder(id, updates);

    // Sync with Prisma
    prisma.reminder.update({
      where: { id },
      data: {
        title: updates.title,
        type: updates.type as any,
        description: updates.description,
        scheduledAt: updates.scheduledAt ? new Date(updates.scheduledAt) : undefined,
        recurrence: updates.recurrence,
        status: updates.status as any
      }
    }).catch(() => {});

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update reminder' });
  }
});

// ─── 5. DELETE REMINDER ─────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const user = req.user!;
    const id = req.params.id;

    db.deleteReminder(id);
    prisma.reminder.delete({ where: { id } }).catch(() => {});

    db.logAudit(
      user.id,
      user.name || 'Patient',
      'DELETE_REMINDER',
      'REMINDER',
      id,
      `Deleted reminder ID ${id}`,
      req.ip
    );

    return res.json({ success: true, message: 'Reminder deleted permanently' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete reminder' });
  }
});

export default router;
