import { AdaptiveAIEngine } from './adaptiveAIEngine';

export interface DailyRecommendation {
  gameId: string;
  title: string;
  category: string;
  difficultyLabel: 'Gentle' | 'Standard' | 'Challenging';
  difficultyLevel: number;
  reason: string;
  icon: string;
  estimatedMinutes: number;
}

export class PersonalizationEngine {
  static getDailyRecommendations(): DailyRecommendation[] {
    const history = AdaptiveAIEngine.getMetricsHistory();
    const memoryDiff = AdaptiveAIEngine.getGameDifficulty('memory-match');
    const objectsDiff = AdaptiveAIEngine.getGameDifficulty('remember-objects');
    const patternDiff = AdaptiveAIEngine.getGameDifficulty('pattern-recall');

    const getDiffLabel = (lvl: number): 'Gentle' | 'Standard' | 'Challenging' => {
      if (lvl <= 1) return 'Gentle';
      if (lvl <= 3) return 'Standard';
      return 'Challenging';
    };

    return [
      {
        gameId: 'memory-match',
        title: 'Memory Match',
        category: 'Visual Memory',
        difficultyLabel: getDiffLabel(memoryDiff),
        difficultyLevel: memoryDiff,
        reason: 'Recommended based on your strong visual recall consistency this week',
        icon: '🎴',
        estimatedMinutes: 3
      },
      {
        gameId: 'remember-objects',
        title: 'Remember the Objects',
        category: 'Short-term Recall',
        difficultyLabel: getDiffLabel(objectsDiff),
        difficultyLevel: objectsDiff,
        reason: 'Gentle daily memory practice to maintain active recall',
        icon: '🔍',
        estimatedMinutes: 2
      },
      {
        gameId: 'pattern-recall',
        title: 'Pattern Recall',
        category: 'Sequential Logic',
        difficultyLabel: getDiffLabel(patternDiff),
        difficultyLevel: patternDiff,
        reason: 'Recommended to exercise sequential attention and focus',
        icon: '🧩',
        estimatedMinutes: 4
      }
    ];
  }
}
