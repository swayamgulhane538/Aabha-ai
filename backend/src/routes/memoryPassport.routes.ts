import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

let fallbackPeople = [
  { id: 'p1', name: 'Priya Sharma', relationship: 'Daughter', phone: '+91 98765 43210', description: 'Visits every weekend, loves cooking together', isApprovedForAI: true },
  { id: 'p2', name: 'Aarav', relationship: 'Grandson', phone: '+91 98234 56789', description: 'Age 7, loves playing football in the garden', isApprovedForAI: true },
  { id: 'p3', name: 'Rajesh', relationship: 'Son', phone: '+91 99887 76655', description: 'Calls every evening at 8 PM from Bangalore', isApprovedForAI: true },
];

let fallbackHobbies = [
  { id: 'h1', title: 'Gardening & Plants (बागकाम / बागवानी)', emoji: '🌿', category: 'Nature', description: 'Tending to Tulsi, roses and watering flowering pots in the morning sun.' },
  { id: 'h2', title: 'Classical Music & Bhajans (सुमधुर संगीत)', emoji: '🎵', category: 'Music', description: 'Listening to Lata Mangeshkar, Pandit Bhimsen Joshi, and soothing evening bhajans.' },
  { id: 'h3', title: 'Reading & Scripture Stories (ग्रंथ वाचन)', emoji: '📖', category: 'Reading', description: 'Reading Marathi devotional poetry and spiritual books with grandchildren.' },
  { id: 'h4', title: 'Traditional Cooking & Sweets (स्वादिष्ट स्वयंपाक)', emoji: '🍳', category: 'Cooking', description: 'Making soft puran poli, roasted modak, and special ginger chai for family.' },
];

let fallbackItems = [
  { id: 'i1', category: 'song', title: 'Lag Ja Gale', description: 'Favorite classic melody sung by Lata Mangeshkar', isApprovedForAI: true },
  { id: 'i2', category: 'place', title: 'Nehru Botanical Garden', description: 'Favorite peaceful morning walk garden', isApprovedForAI: true },
  { id: 'i3', category: 'routine', title: 'Morning Ginger Chai', description: 'Always drinks fresh ginger tea at 7:30 AM', isApprovedForAI: true },
  { id: 'i4', category: 'date', title: 'Grandson Birthday', description: 'Aarav was born on October 14th', isApprovedForAI: true },
];

router.get('/:patientId', async (req, res) => {
  try {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: req.params.patientId } });
    if (profile) {
      const passport = await prisma.memoryPassport.findUnique({
        where: { patientId: profile.id },
        include: { people: true, items: true }
      });
      if (passport) return res.json({ ...passport, hobbies: fallbackHobbies });
    }
  } catch (err) {}
  
  return res.json({ id: 'demo-passport-id', people: fallbackPeople, items: fallbackItems, hobbies: fallbackHobbies });
});

router.post('/', async (req, res) => {
  try {
    const { people, items, hobbies } = req.body;
    if (people && Array.isArray(people)) {
      fallbackPeople = people;
    }
    if (items && Array.isArray(items)) {
      fallbackItems = items;
    }
    if (hobbies && Array.isArray(hobbies)) {
      fallbackHobbies = hobbies;
    }
  } catch (err) {}
  return res.status(201).json({ id: 'demo-passport-id', people: fallbackPeople, items: fallbackItems, hobbies: fallbackHobbies });
});

router.post('/:id/people', async (req, res) => {
  try {
    const person = await prisma.memoryPerson.create({
      data: { passportId: req.params.id, ...req.body }
    });
    return res.status(201).json(person);
  } catch (err) {
    const newPerson = { id: 'p-' + Date.now(), ...req.body, isApprovedForAI: true };
    fallbackPeople.push(newPerson);
    return res.status(201).json(newPerson);
  }
});

router.put('/people/:id', async (req, res) => {
  try {
    const person = await prisma.memoryPerson.update({
      where: { id: req.params.id },
      data: req.body
    });
    return res.json(person);
  } catch (err) {
    const idx = fallbackPeople.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      fallbackPeople[idx] = { ...fallbackPeople[idx], ...req.body };
      return res.json(fallbackPeople[idx]);
    }
    return res.json({ id: req.params.id, ...req.body });
  }
});

router.delete('/people/:id', async (req, res) => {
  try {
    await prisma.memoryPerson.delete({ where: { id: req.params.id } });
  } catch (err) {
    fallbackPeople = fallbackPeople.filter(p => p.id !== req.params.id);
  }
  return res.json({ message: 'Person deleted' });
});

router.post('/:id/items', async (req, res) => {
  try {
    const item = await prisma.memoryItem.create({
      data: { passportId: req.params.id, ...req.body }
    });
    return res.status(201).json(item);
  } catch (err) {
    const newItem = { id: 'i-' + Date.now(), ...req.body, isApprovedForAI: true };
    fallbackItems.push(newItem);
    return res.status(201).json(newItem);
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const item = await prisma.memoryItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    return res.json(item);
  } catch (err) {
    const idx = fallbackItems.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      fallbackItems[idx] = { ...fallbackItems[idx], ...req.body };
      return res.json(fallbackItems[idx]);
    }
    return res.json({ id: req.params.id, ...req.body });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.memoryItem.delete({ where: { id: req.params.id } });
  } catch (err) {
    fallbackItems = fallbackItems.filter(i => i.id !== req.params.id);
  }
  return res.json({ message: 'Item deleted' });
});

export default router;
