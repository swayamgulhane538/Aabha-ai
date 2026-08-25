import prisma from '../config/database';
import { AlertSeverity } from '@prisma/client';

export const checkForCognitiveChange = async (patientProfileId: string) => {
  const sessions = await prisma.gameSession.findMany({
    where: { patientId: patientProfileId, isCompleted: true },
    orderBy: { startedAt: 'desc' },
    take: 15,
    include: { results: true },
  });

  if (sessions.length < 15) return;

  const getAvgAccuracy = (sessList: typeof sessions) => {
    let totalAcc = 0;
    let count = 0;
    for (const s of sessList) {
      if (s.results.length > 0) {
        totalAcc += s.results[0].accuracy;
        count++;
      }
    }
    return count > 0 ? totalAcc / count : 0;
  };

  const last5 = sessions.slice(0, 5);
  const prev10 = sessions.slice(5, 15);

  const avgLast5 = getAvgAccuracy(last5);
  const avgPrev10 = getAvgAccuracy(prev10);

  if (avgPrev10 > 0) {
    const drop = (avgPrev10 - avgLast5) / avgPrev10;
    if (drop > 0.15) {
      let severity: AlertSeverity = AlertSeverity.LOW;
      if (drop > 0.3) severity = AlertSeverity.HIGH;
      else if (drop > 0.2) severity = AlertSeverity.MEDIUM;

      await prisma.alert.create({
        data: {
          patientId: patientProfileId,
          severity,
          title: 'Potential Cognitive Decline Detected',
          message: 'A noticeable change in recent activity performance was detected. Consider reviewing the activity history and, where appropriate, consulting a healthcare professional.',
          data: { dropPercentage: drop * 100, avgLast5, avgPrev10 },
        },
      });
    }
  }
};
