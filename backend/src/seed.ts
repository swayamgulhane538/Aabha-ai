import { PrismaClient, Role, GameType, ReminderType, AlertSeverity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  await prisma.user.deleteMany();
  await prisma.patientProfile.deleteMany();

  const passwordHash = await bcrypt.hash('demo123', 10);

  const patient = await prisma.user.create({
    data: {
      name: 'Anita Devi',
      email: 'demo-patient@aabha.ai',
      passwordHash,
      role: Role.PATIENT,
      preferredLanguage: 'hi',
      isDemo: true,
      patientProfile: {
        create: {
          age: 72,
          currentDifficulty: 5,
        }
      }
    },
    include: { patientProfile: true }
  });

  const caregiver = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'demo-caregiver@aabha.ai',
      passwordHash,
      role: Role.CAREGIVER,
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Kumar',
      email: 'demo-admin@aabha.ai',
      passwordHash,
      role: Role.ADMIN,
    }
  });

  await prisma.caregiverPatientLink.create({
    data: {
      caregiverId: caregiver.id,
      patientId: patient.id,
      isPrimary: true
    }
  });

  const passport = await prisma.memoryPassport.create({
    data: { patientId: patient.patientProfile!.id }
  });

  await prisma.memoryPerson.createMany({
    data: [
      { passportId: passport.id, name: 'Priya', relationship: 'daughter', isApprovedForAI: true },
      { passportId: passport.id, name: 'Aarav', relationship: 'grandson', isApprovedForAI: true },
      { passportId: passport.id, name: 'Rajesh', relationship: 'son', isApprovedForAI: true },
    ]
  });

  await prisma.memoryItem.createMany({
    data: [
      { passportId: passport.id, category: 'song', title: 'Favourite song', isApprovedForAI: true },
      { passportId: passport.id, category: 'place', title: 'Favourite garden', isApprovedForAI: true },
      { passportId: passport.id, category: 'routine', title: 'Daily tea routine', isApprovedForAI: true },
      { passportId: passport.id, category: 'date', title: 'Birthday', isApprovedForAI: true },
    ]
  });

  const accuracies = [0.82, 0.79, 0.75, 0.61];
  for (let i = 0; i < 20; i++) {
    const acc = i < 16 ? 0.85 + (Math.random() * 0.1) : accuracies[i - 16];
    
    const session = await prisma.gameSession.create({
      data: {
        patientId: patient.patientProfile!.id,
        gameType: GameType.MEMORY_MATCH,
        isCompleted: true,
        startedAt: new Date(Date.now() - (20 - i) * 86400000),
      }
    });

    await prisma.gameResult.create({
      data: {
        sessionId: session.id,
        score: Math.floor(acc * 100),
        maxScore: 100,
        accuracy: acc,
        timeTaken: 120,
      }
    });
  }

  await prisma.reminder.createMany({
    data: [
      { userId: patient.id, type: ReminderType.MEDICINE, title: 'Medicine at 8AM', scheduledAt: new Date() },
      { userId: patient.id, type: ReminderType.WATER, title: 'Water at 4PM', scheduledAt: new Date() },
      { userId: patient.id, type: ReminderType.ACTIVITY, title: 'Memory exercise at 10AM', scheduledAt: new Date() },
    ]
  });

  await prisma.alert.create({
    data: {
      patientId: patient.patientProfile!.id,
      severity: AlertSeverity.MEDIUM,
      title: 'Potential Cognitive Decline Detected',
      message: 'A noticeable change in recent activity performance was detected. Consider reviewing the activity history and, where appropriate, consulting a healthcare professional.',
      data: { dropPercentage: 25, avgLast5: 0.61, avgPrev10: 0.85 }
    }
  });

  const conv = await prisma.aiConversation.create({
    data: { userId: patient.id, language: 'hi' }
  });

  await prisma.aiMessage.createMany({
    data: [
      { conversationId: conv.id, role: 'user', content: 'Namaste AABHA' },
      { conversationId: conv.id, role: 'assistant', content: 'Namaste Anita ji. Main apki kaise madad kar sakti hu?' }
    ]
  });

  await prisma.familyMessage.create({
    data: {
      senderId: caregiver.id,
      receiverId: patient.id,
      type: 'TEXT',
      content: 'Hi Mom, how are you feeling today?'
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
