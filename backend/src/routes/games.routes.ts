import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, GameResultRecord } from '../store/persistentDatabase';
import {
  MASTER_GAMES_CATALOG,
  getGameContentForUser,
  getDailyChallengeForDate,
  markDailyChallengeCompleted,
  getPersonalizedGamesForUser,
  getTodayDateString
} from '../store/gameContentDatabase';

const router = Router();
router.use(authenticate);

// ─── 1. GET ALL GAMES CATALOG ───────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category, type } = req.query as { category?: string; type?: string };

  let list = [...MASTER_GAMES_CATALOG];
  if (category && category !== 'all') {
    list = list.filter(g => g.category === category);
  }
  if (type) {
    list = list.filter(g => g.type === type);
  }

  return res.json({
    success: true,
    total: list.length,
    games: list
  });
});

// ─── 2. GET RANDOMIZED & PERSONALIZED GAMES (On App Open / Refresh) ───────────
router.get('/random', (req, res) => {
  const user = req.user!;
  const personalized = getPersonalizedGamesForUser(user.id);

  return res.json({
    success: true,
    ...personalized
  });
});

// ─── 3. GET DYNAMIC DAILY CHALLENGE (Reset Every Midnight) ───────────────────
router.get('/daily-challenge', (req, res) => {
  const user = req.user!;
  const challenge = getDailyChallengeForDate(getTodayDateString(), user.id);

  return res.json({
    success: true,
    dailyChallenge: challenge
  });
});

// ─── 4. COMPLETE DAILY CHALLENGE & CLAIM REWARDS ──────────────────────────────
router.post('/daily-challenge/complete', (req, res) => {
  const user = req.user!;
  const result = markDailyChallengeCompleted(user.id, getTodayDateString());

  return res.json({
    message: result.pointsAwarded > 0
      ? `🎉 Daily challenge completed! +${result.pointsAwarded} Bonus Points awarded.`
      : '✓ Daily challenge already claimed for today.',
    ...result
  });
});

// ─── 5. GET DYNAMIC GAME CONTENT (Anti-Repetition Engine) ────────────────────
router.get('/:id/content', (req, res) => {
  const user = req.user!;
  const gameId = req.params.id;
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  const content = getGameContentForUser(gameId, user.id, limit);

  return res.json({
    success: true,
    gameId,
    total: content.length,
    content
  });
});

// ─── 6. USER ACTIVITY TRACKER ────────────────────────────────────────────────
router.post('/user-activity', (req, res) => {
  const user = req.user!;
  const { gameId, action, durationSeconds } = req.body;

  // Log audit
  db.logAudit(
    user.id,
    user.name || 'Patient',
    'GAME_ACTIVITY',
    'GAME',
    gameId || 'game',
    `Action: ${action || 'PLAY'}, Duration: ${durationSeconds || 0}s`,
    req.ip
  );

  return res.json({
    success: true,
    message: 'User activity logged'
  });
});

// ─── 7. SAVE GAME RESULT ─────────────────────────────────────────────────────
router.post('/result', (req, res) => {
  const user = req.user!;
  const { gameType, gameName, score, maxScore = 100, accuracy, timeTaken, difficulty } = req.body;

  const currentPatient = db.getUserById(user.id) || { patientId: 'PAT-2026-000001', name: user.name || 'Patient' };
  const finalDifficulty = difficulty || db.getAdaptiveDifficulty(user.id, gameType || 'memory-match');

  const rec: GameResultRecord = {
    id: 'gr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    patientUserId: user.id,
    patientId: (currentPatient as any).patientId || 'PAT-2026-000001',
    gameType: gameType || 'memory-match',
    gameName: gameName || 'Cognitive Exercise',
    score: score !== undefined ? Number(score) : 80,
    maxScore: Number(maxScore) || 100,
    accuracy: accuracy !== undefined ? Number(accuracy) : 85,
    timeTaken: timeTaken !== undefined ? Number(timeTaken) : 45,
    difficulty: finalDifficulty,
    completedAt: new Date().toISOString()
  };

  db.saveGameResult(rec);

  // Check for significant cognitive score drop -> trigger caregiver alert
  if (rec.accuracy < 50) {
    db.createAlert({
      id: 'alt-' + Date.now(),
      patientUserId: user.id,
      patientId: rec.patientId,
      patientName: user.name || 'Patient',
      severity: 'MEDIUM',
      alertType: 'COGNITIVE_DROP',
      title: `Low Accuracy Alert: ${rec.gameName}`,
      message: `An accuracy score of ${rec.accuracy}% was recorded on ${rec.gameName}. Recommend gentle encouragement and review.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  // Check if this completes the daily challenge
  const todayChallenge = getDailyChallengeForDate(getTodayDateString(), user.id);
  if (rec.gameType === todayChallenge.featured_game_id && !todayChallenge.is_completed) {
    markDailyChallengeCompleted(user.id, getTodayDateString());
  }

  db.logAudit(
    user.id,
    user.name || 'Patient',
    'GAME_COMPLETED',
    'GAME',
    rec.id,
    `Completed ${rec.gameName} with Score: ${rec.score}/${rec.maxScore} (Accuracy: ${rec.accuracy}%, Time: ${rec.timeTaken}s, Level: ${rec.difficulty})`,
    req.ip
  );

  return res.status(201).json({
    message: 'Game result recorded successfully',
    result: rec,
    nextRecommendedDifficulty: db.getAdaptiveDifficulty(user.id, rec.gameType)
  });
});

// ─── 8. GET ADAPTIVE DIFFICULTY FOR GAME ────────────────────────────────────
router.get('/difficulty/:gameType', (req, res) => {
  const user = req.user!;
  const diff = db.getAdaptiveDifficulty(user.id, req.params.gameType);
  return res.json({ gameType: req.params.gameType, difficulty: diff });
});

// ─── 9. GET COGNITIVE PROGRESS METRICS & TREND ──────────────────────────────
router.get('/progress', (req, res) => {
  const user = req.user!;
  const { patientUserId, range = '30d' } = req.query as { patientUserId?: string; range?: string };

  let targetId = user.id;
  if ((user.role === 'CAREGIVER' || user.role === 'ADMIN') && patientUserId) {
    targetId = patientUserId;
  }

  const results = db.getGameResults(targetId);

  // Calculate timeline metrics
  const memoryScores = results.map(r => ({ date: r.completedAt.split('T')[0], score: r.score, game: r.gameName }));
  const avgAccuracy = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
    : 85;

  const avgReactionTime = results.length > 0
    ? (results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length).toFixed(1)
    : '45.0';

  const attentionScore = Math.min(100, Math.round(avgAccuracy * 0.95 + 4));

  // Trend Observation (strictly labeled as non-diagnostic observation)
  let observation = 'Your recent cognitive memory performance is stable and active compared with previous results.';
  if (avgAccuracy >= 85) {
    observation = 'Positive retention detected: High accuracy across memory matching and visual recall exercises.';
  } else if (avgAccuracy < 70) {
    observation = 'Mild reaction lag observed on rapid sequences. Soothing pace and daily practice recommended.';
  }

  return res.json({
    summary: {
      totalGamesPlayed: results.length,
      averageAccuracy: avgAccuracy,
      averageReactionTimeSeconds: Number(avgReactionTime),
      attentionScore,
      currentAdaptiveLevel: db.getAdaptiveDifficulty(targetId, 'memory-match'),
      aiObservation: observation
    },
    timeline: memoryScores.slice(0, 15),
    history: results.slice(0, 20)
  });
});

export default router;
