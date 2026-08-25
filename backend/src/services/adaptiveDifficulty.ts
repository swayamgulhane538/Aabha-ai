import prisma from '../config/database';
import { GameType } from '@prisma/client';

export const calculateNewDifficulty = async (patientProfileId: string, currentAccuracy: number): Promise<number> => {
  const profile = await prisma.patientProfile.findUnique({ where: { id: patientProfileId } });
  if (!profile) throw new Error('Patient profile not found');

  let newDiff = profile.currentDifficulty;
  if (currentAccuracy > 0.85) {
    newDiff += 1;
  } else if (currentAccuracy < 0.6) {
    newDiff -= 1;
  }

  // Clamp between 1 and 10
  newDiff = Math.max(1, Math.min(10, newDiff));

  await prisma.patientProfile.update({
    where: { id: patientProfileId },
    data: { currentDifficulty: newDiff },
  });

  return newDiff;
};
