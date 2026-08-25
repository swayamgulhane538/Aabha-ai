import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const messages = await prisma.familyMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { name: true } }, receiver: { select: { name: true } } }
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { receiverId, type, content, mediaUrl } = req.body;
    const message = await prisma.familyMessage.create({
      data: {
        senderId: req.user!.id,
        receiverId,
        type: type || 'TEXT',
        content,
        mediaUrl
      }
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const message = await prisma.familyMessage.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
});

export default router;
