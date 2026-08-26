import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { AdaptiveAIEngine, AdaptationResult } from '../services/adaptiveAIEngine';
import { MemoryMatch } from '../games/MemoryMatch';
import { RememberObjects } from '../games/RememberObjects';
import { SequenceRecall } from '../games/SequenceRecall';
import { PictureRecognition } from '../games/PictureRecognition';
import { AttentionChallenge } from '../games/AttentionChallenge';
import { DailyRoutineOrdering } from '../games/DailyRoutineOrdering';
import { FamiliarObjectRecognition } from '../games/FamiliarObjectRecognition';
import { DailyMemoryStory } from '../games/DailyMemoryStory';
import { QuizBattle } from '../games/QuizBattle';
import { QuickTapBattle } from '../games/QuickTapBattle';
import { DrawAndGuess } from '../games/DrawAndGuess';
import { WordBattle } from '../games/WordBattle';
import { TicTacToe } from '../games/TicTacToe';
import { CardBattle } from '../games/CardBattle';
import { MiniRacing } from '../games/MiniRacing';
import { TruthOrDare } from '../games/TruthOrDare';
import { WouldYouRather } from '../games/WouldYouRather';
import { GuessTheSong } from '../games/GuessTheSong';
import { WhoAmI } from '../games/WhoAmI';
import { AimChallenge } from '../games/AimChallenge';
import { PuzzleRace } from '../games/PuzzleRace';
import { DareChallenge } from '../games/DareChallenge';
import { BreathingExercise } from '../games/BreathingExercise';
import { ColoringTherapy } from '../games/ColoringTherapy';
import { PhysiotherapyHand } from '../games/PhysiotherapyHand';
import { CheckCircle2, Trophy, Clock, Target, ArrowRight, RotateCcw, Sparkles, Zap, Shield } from 'lucide-react';

interface GameResult {
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  attempts?: number;
  mistakes?: number;
}

const GAME_INFO: Record<string, { title: string; emoji: string; description: string; type: string; category: 'MEMORY' | 'ATTENTION' | 'REACTION' | 'LOGIC' | 'ROUTINE' }> = {
  'memory-match': { title: 'Memory Match', emoji: '🧠', description: 'Remember and match pairs of words and pictures.', type: 'MEMORY_MATCH', category: 'MEMORY' },
  'remember-objects': { title: 'Remember the Objects', emoji: '🔍', description: 'Look at objects carefully, then pick the ones you remember.', type: 'REMEMBER_OBJECTS', category: 'MEMORY' },
  'attention-challenge': { title: 'Attention Finder', emoji: '👁️', description: 'Find all the hidden targets amid distractors as fast as you can.', type: 'ATTENTION_CHALLENGE', category: 'ATTENTION' },
  'sequence-recall': { title: 'Pattern Recall', emoji: '🔢', description: 'Watch the sequence and repeat it in the correct order.', type: 'SEQUENCE_RECALL', category: 'LOGIC' },
  'routine-ordering': { title: 'Daily Routine Ordering', emoji: '📅', description: 'Arrange daily activities in the correct chronological order.', type: 'ROUTINE_ORDERING', category: 'ROUTINE' },
  'familiar-objects': { title: 'Familiar Object Recognition', emoji: '🍵', description: 'Look at everyday household items and answer cognitive questions.', type: 'FAMILIAR_OBJECTS', category: 'MEMORY' },
  'breathing-exercise': { title: 'Guided Box Breathing', emoji: '🌬️', description: 'Interactive biofeedback box breathing to relieve stress and lower pulse.', type: 'BREATHING_EXERCISE', category: 'REACTION' },
  'coloring-therapy': { title: 'Art & Mandala Therapy', emoji: '🎨', description: 'Mindful coloring for calming emotional release and fine motor joy.', type: 'COLORING_THERAPY', category: 'REACTION' },
  'physiotherapy-hand': { title: 'Physiotherapy Hand Movement', emoji: '🖐️', description: 'Finger tap coordination and dexterity training for hand strength.', type: 'PHYSIOTHERAPY_HAND', category: 'REACTION' },
  'quiz-battle': { title: '2-Player Quiz Battle', emoji: '🎯', description: 'Both answer the same questions; fastest and correct answer gets points!', type: 'QUIZ_BATTLE', category: 'MEMORY' },
  'quick-tap-battle': { title: 'Quick Tap Battle', emoji: '⚡', description: 'A target appears randomly; whoever taps fastest wins the round!', type: 'QUICK_TAP', category: 'REACTION' },
  'draw-and-guess': { title: 'Draw & Guess', emoji: '✏️', description: 'Draw on the canvas and guess the secret word!', type: 'DRAW_GUESS', category: 'LOGIC' },
  'word-battle': { title: 'Word Battle', emoji: '🔤', description: 'Given a letter, make words! Unique and longer words score higher.', type: 'WORD_BATTLE', category: 'LOGIC' },
  'tic-tac-toe': { title: 'Tic-Tac-Toe', emoji: '❌⭕', description: 'Classic 1v1 game with local 2-player or AI mode.', type: 'TIC_TAC_TOE', category: 'LOGIC' },
  'card-battle': { title: 'Card Battle', emoji: '🃏', description: 'Play your animal cards with powers and battle round-by-round!', type: 'CARD_BATTLE', category: 'LOGIC' },
  'mini-racing': { title: 'Mini Racing Game', emoji: '🏃', description: 'Simple 2-player race with tap speed to sprint to the finish line!', type: 'MINI_RACING', category: 'REACTION' },
  'truth-or-dare': { title: 'Truth or Dare Duo', emoji: '😂', description: 'Wholesome, heartwarming fun questions and challenges for family.', type: 'TRUTH_OR_DARE', category: 'MEMORY' },
  'would-you-rather': { title: 'Would You Rather?', emoji: '🔥', description: 'Both choose an option and compare your favorite choices.', type: 'WOULD_YOU_RATHER', category: 'MEMORY' },
  'guess-the-song': { title: 'Guess the Song', emoji: '🎵', description: 'Listen to the musical notes and identify the famous tune!', type: 'GUESS_SONG', category: 'MEMORY' },
  'who-am-i': { title: 'Who Am I?', emoji: '🕵️', description: 'Read clues and guess the famous historical or cultural personality.', type: 'WHO_AM_I', category: 'MEMORY' },
  'aim-challenge': { title: 'Aim Challenge', emoji: '🎯', description: 'Hit moving targets to sharpen hand-eye coordination!', type: 'AIM_CHALLENGE', category: 'REACTION' },
  'puzzle-race': { title: 'Puzzle Race', emoji: '🧩', description: 'Slide the tiles into sequential order from 1 to 8!', type: 'PUZZLE_RACE', category: 'LOGIC' },
  'dare-challenge': { title: 'Dare Challenge', emoji: '😈', description: 'Fun, cheerful activity challenges to bring smiles and laughter!', type: 'DARE_CHALLENGE', category: 'REACTION' },
  'daily-memory-story': { title: 'Daily Memory Story', emoji: '📖', description: 'Read today’s memory story and test recall with interactive quiz.', type: 'DAILY_MEMORY_STORY', category: 'MEMORY' },
  'picture-recognition': { title: 'Picture Recognition', emoji: '🖼️', description: 'Look at the picture and identify what you see!', type: 'PICTURE_RECOGNITION', category: 'MEMORY' }
};

export const GamePlayer: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [gameState, setGameState] = useState<'PLAYING' | 'FINISHED'>('PLAYING');
  const [result, setResult] = useState<GameResult | null>(null);
  const [adaptation, setAdaptation] = useState<AdaptationResult | null>(null);
  const [difficulty, setDifficulty] = useState(2);

  const gameInfo = type ? GAME_INFO[type] : null;

  useEffect(() => {
    if (type) {
      const storedDiff = AdaptiveAIEngine.getGameDifficulty(type);
      setDifficulty(storedDiff);
    }
  }, [type]);

  const handleComplete = async (gameResult: GameResult) => {
    setResult(gameResult);

    // Evaluate AI Adaptation
    const adaptationResult = AdaptiveAIEngine.evaluatePerformance({
      gameId: type || 'memory-match',
      gameTitle: gameInfo?.title || 'Cognitive Game',
      category: gameInfo?.category || 'MEMORY',
      score: gameResult.score,
      maxScore: gameResult.maxScore,
      accuracy: gameResult.accuracy,
      timeTakenSec: gameResult.timeTaken,
      attempts: gameResult.attempts || 1,
      mistakes: gameResult.mistakes || 0,
      difficulty,
      timestamp: new Date().toISOString()
    });

    setAdaptation(adaptationResult);
    setGameState('FINISHED');

    // Save result to persistent database
    try {
      await api.post('/games/result', {
        gameType: type || 'memory-match',
        gameName: gameInfo?.title || 'Cognitive Game',
        score: gameResult.score,
        maxScore: gameResult.maxScore,
        accuracy: gameResult.accuracy,
        timeTaken: gameResult.timeTaken,
        difficulty: `Level ${difficulty}`
      });
    } catch (err) {
      console.warn('Saved locally via AdaptiveAIEngine fallback:', err);
    }
  };

  const handleRestart = () => {
    if (type) {
      setDifficulty(AdaptiveAIEngine.getGameDifficulty(type));
    }
    setResult(null);
    setAdaptation(null);
    setGameState('PLAYING');
  };

  const renderGame = () => {
    if (!type) return null;
    const onComplete = (res: GameResult) => handleComplete(res);

    switch (type) {
      case 'memory-match':
        return <MemoryMatch difficulty={difficulty} onComplete={onComplete} />;
      case 'remember-objects':
        return <RememberObjects difficulty={difficulty} onComplete={onComplete} />;
      case 'attention-challenge':
        return <AttentionChallenge difficulty={difficulty} onComplete={onComplete} />;
      case 'sequence-recall':
        return <SequenceRecall difficulty={difficulty} onComplete={onComplete} />;
      case 'routine-ordering':
        return <DailyRoutineOrdering difficulty={difficulty} onComplete={onComplete} />;
      case 'familiar-objects':
        return <FamiliarObjectRecognition difficulty={difficulty} onComplete={onComplete} />;
      case 'breathing-exercise':
        return <BreathingExercise />;
      case 'coloring-therapy':
        return <ColoringTherapy />;
      case 'physiotherapy-hand':
        return <PhysiotherapyHand />;
      case 'quiz-battle':
        return <QuizBattle difficulty={difficulty} onComplete={onComplete} />;
      case 'quick-tap-battle':
        return <QuickTapBattle difficulty={difficulty} onComplete={onComplete} />;
      case 'draw-and-guess':
        return <DrawAndGuess difficulty={difficulty} onComplete={onComplete} />;
      case 'word-battle':
        return <WordBattle difficulty={difficulty} onComplete={onComplete} />;
      case 'tic-tac-toe':
        return <TicTacToe difficulty={difficulty} onComplete={onComplete} />;
      case 'card-battle':
        return <CardBattle difficulty={difficulty} onComplete={onComplete} />;
      case 'mini-racing':
        return <MiniRacing difficulty={difficulty} onComplete={onComplete} />;
      case 'truth-or-dare':
        return <TruthOrDare difficulty={difficulty} onComplete={onComplete} />;
      case 'would-you-rather':
        return <WouldYouRather difficulty={difficulty} onComplete={onComplete} />;
      case 'guess-the-song':
        return <GuessTheSong difficulty={difficulty} onComplete={onComplete} />;
      case 'who-am-i':
        return <WhoAmI difficulty={difficulty} onComplete={onComplete} />;
      case 'aim-challenge':
        return <AimChallenge difficulty={difficulty} onComplete={onComplete} />;
      case 'puzzle-race':
        return <PuzzleRace difficulty={difficulty} onComplete={onComplete} />;
      case 'dare-challenge':
        return <DareChallenge difficulty={difficulty} onComplete={onComplete} />;
      case 'daily-memory-story':
        return <DailyMemoryStory difficulty={difficulty} onComplete={onComplete} />;
      case 'picture-recognition':
        return <PictureRecognition difficulty={difficulty} onComplete={onComplete} />;
      default:
        return (
          <div className="text-center p-8 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)]">
            <p className="font-bold">Game ready to play!</p>
            <button onClick={() => navigate('/patient/games')} className="btn-glow mt-4 px-6 py-2">
              Back to Games Hub
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans text-[var(--text-primary)] pb-12">
      {/* Top Header Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{gameInfo?.emoji || '🎮'}</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              {gameInfo?.title || 'Cognitive Activity'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                AI Difficulty: Level {difficulty}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold">
                (Adaptive Scale 1–5)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/patient/games')}
          className="btn-glass px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black hover:text-emerald-400 transition"
        >
          ← Exit to Hub
        </button>
      </div>

      {gameState === 'FINISHED' && result ? (
        <div className="card-3d bg-[var(--card-bg-inline)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border-inline)] shadow-2xl text-center space-y-5 animate-fade-in max-w-xl mx-auto my-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 mx-auto flex items-center justify-center text-4xl shadow-md">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Activity Completed!
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
              Your memory performance metrics have been securely recorded.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)]">
              <div className="text-2xl font-black text-[var(--text-primary)]">{result.score}</div>
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Score Points</div>
            </div>

            <div className="p-3.5 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)]">
              <div className="text-2xl font-black text-emerald-400">{result.accuracy}%</div>
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Accuracy</div>
            </div>

            <div className="p-3.5 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)]">
              <div className="text-2xl font-black text-cyan-400">{result.timeTaken}s</div>
              <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Time Taken</div>
            </div>
          </div>

          {/* AI Difficulty Adaptation Feedback Banner */}
          {adaptation && (
            <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 animate-fade-in ${
              adaptation.action === 'INCREASED'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : adaptation.action === 'DECREASED'
                ? 'bg-blue-500/15 border-blue-400/40 text-blue-300'
                : 'bg-teal-500/15 border-teal-400/40 text-teal-300'
            }`}>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-black text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>AI Adaptation Engine</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    Level {adaptation.previousDifficulty} → Level {adaptation.newDifficulty}
                  </span>
                </div>
                <p className="font-medium text-[var(--text-secondary)] leading-relaxed">
                  {adaptation.feedbackMessage}
                </p>
              </div>
            </div>
          )}

          {/* Non-Diagnostic Disclaimer */}
          <div className="p-2.5 bg-[var(--bg-surface-secondary)] rounded-xl border border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Non-diagnostic activity indicator. Not a clinical medical diagnosis.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="btn-glass flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Round (Level {adaptation?.newDifficulty || difficulty})</span>
            </button>

            <button
              onClick={() => navigate('/patient/games')}
              className="btn-glow flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Games Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {renderGame()}
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
