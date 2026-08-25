import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { MemoryMatch } from '../games/MemoryMatch';
import { RememberObjects } from '../games/RememberObjects';
import { SequenceRecall } from '../games/SequenceRecall';
import { PictureRecognition } from '../games/PictureRecognition';
import { AttentionChallenge } from '../games/AttentionChallenge';
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
import { CheckCircle2, Trophy, Clock, Target, ArrowRight, RotateCcw } from 'lucide-react';

interface GameResult {
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  attempts?: number;
}

const GAME_INFO: Record<string, { title: string; emoji: string; description: string; type: string }> = {
  'breathing-exercise': { title: 'Guided Box Breathing', emoji: '🌬️', description: 'Interactive biofeedback box breathing to relieve stress and lower pulse.', type: 'BREATHING_EXERCISE' },
  'coloring-therapy': { title: 'Art & Mandala Therapy', emoji: '🎨', description: 'Mindful coloring for calming emotional release and fine motor joy.', type: 'COLORING_THERAPY' },
  'physiotherapy-hand': { title: 'Physiotherapy Hand Movement', emoji: '🖐️', description: 'Finger tap coordination and dexterity training for hand strength.', type: 'PHYSIOTHERAPY_HAND' },
  'quiz-battle': { title: '2-Player Quiz Battle', emoji: '🎯', description: 'Both answer the same questions; fastest and correct answer gets points!', type: 'QUIZ_BATTLE' },
  'memory-match': { title: 'Memory Match', emoji: '🧠', description: 'Flip cards and find matching pairs of words and pictures.', type: 'MEMORY_MATCH' },
  'quick-tap-battle': { title: 'Quick Tap Battle', emoji: '⚡', description: 'A target appears randomly; whoever taps fastest wins the round!', type: 'QUICK_TAP' },
  'draw-and-guess': { title: 'Draw & Guess', emoji: '✏️', description: 'Draw on the canvas and guess the secret word!', type: 'DRAW_GUESS' },
  'word-battle': { title: 'Word Battle', emoji: '🔤', description: 'Given a letter, make words! Unique and longer words score higher.', type: 'WORD_BATTLE' },
  'tic-tac-toe': { title: 'Tic-Tac-Toe', emoji: '❌⭕', description: 'Classic 1v1 game with local 2-player or AI mode.', type: 'TIC_TAC_TOE' },
  'card-battle': { title: 'Card Battle', emoji: '🃏', description: 'Play your animal cards with powers and battle round-by-round!', type: 'CARD_BATTLE' },
  'mini-racing': { title: 'Mini Racing Game', emoji: '🏃', description: 'Simple 2-player race with tap speed to sprint to the finish line!', type: 'MINI_RACING' },
  'truth-or-dare': { title: 'Truth or Dare Duo', emoji: '😂', description: 'Wholesome, heartwarming fun questions and challenges for family.', type: 'TRUTH_OR_DARE' },
  'would-you-rather': { title: 'Would You Rather?', emoji: '🔥', description: 'Both choose an option and compare your favorite choices.', type: 'WOULD_YOU_RATHER' },
  'guess-the-song': { title: 'Guess the Song', emoji: '🎵', description: 'Listen to the musical notes and identify the famous tune!', type: 'GUESS_SONG' },
  'who-am-i': { title: 'Who Am I?', emoji: '🕵️', description: 'Read clues and guess the famous historical or cultural personality.', type: 'WHO_AM_I' },
  'aim-challenge': { title: 'Aim Challenge', emoji: '🎯', description: 'Hit moving targets to sharpen hand-eye coordination!', type: 'AIM_CHALLENGE' },
  'puzzle-race': { title: 'Puzzle Race', emoji: '🧩', description: 'Slide the tiles into sequential order from 1 to 8!', type: 'PUZZLE_RACE' },
  'dare-challenge': { title: 'Dare Challenge', emoji: '😈', description: 'Fun, cheerful activity challenges to bring smiles and laughter!', type: 'DARE_CHALLENGE' },
  'daily-memory-story': { title: 'Daily Memory Story', emoji: '📖', description: 'Read today’s memory story and test recall with interactive quiz.', type: 'DAILY_MEMORY_STORY' },
  'remember-objects': { title: 'Remember Objects', emoji: '🎯', description: 'Look at the objects carefully, then pick the ones you remember.', type: 'REMEMBER_OBJECTS' },
  'sequence-recall': { title: 'Sequence Recall', emoji: '🔢', description: 'Watch the sequence and repeat it in the correct order.', type: 'SEQUENCE_RECALL' },
  'picture-recognition': { title: 'Picture Recognition', emoji: '🖼️', description: 'Look at the picture and identify what you see!', type: 'PICTURE_RECOGNITION' },
  'attention-challenge': { title: 'Attention Challenge', emoji: '👁️', description: 'Find all the hidden targets as fast as you can!', type: 'ATTENTION_CHALLENGE' },
};

const GamePlayer: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [gameState, setGameState] = useState<'PLAYING' | 'FINISHED'>('PLAYING');
  const [result, setResult] = useState<GameResult | null>(null);
  const [adaptiveLevel, setAdaptiveLevel] = useState<'BEGINNER' | 'NORMAL' | 'ADVANCED'>('NORMAL');
  const [difficulty, setDifficulty] = useState(1);

  const gameInfo = type ? GAME_INFO[type] : null;

  useEffect(() => {
    if (type) {
      api.get(`/games/difficulty/${type}`)
        .then((res: any) => {
          if (res && res.difficulty) {
            setAdaptiveLevel(res.difficulty);
            setDifficulty(res.difficulty === 'ADVANCED' ? 3 : res.difficulty === 'BEGINNER' ? 1 : 2);
          }
        })
        .catch(() => {});
    }
  }, [type]);

  const handleComplete = async (gameResult: GameResult) => {
    setResult(gameResult);
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
        difficulty: adaptiveLevel
      });
    } catch (err) {
      console.warn('Failed to save game result:', err);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setGameState('PLAYING');
  };

  const renderGame = () => {
    if (!type) return null;

    const onComplete = (res: GameResult) => handleComplete(res);

    switch (type) {
      case 'breathing-exercise':
      case 'breathing':
        return <BreathingExercise />;
      case 'coloring-therapy':
      case 'coloring':
        return <ColoringTherapy />;
      case 'physiotherapy-hand':
      case 'physiotherapy':
        return <PhysiotherapyHand />;
      case 'quiz-battle':
        return <QuizBattle difficulty={difficulty} onComplete={onComplete} />;
      case 'memory-match':
        return <MemoryMatch difficulty={difficulty} onComplete={onComplete} />;
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
      case 'remember-objects':
        return <RememberObjects difficulty={difficulty} onComplete={onComplete} />;
      case 'sequence-recall':
        return <SequenceRecall difficulty={difficulty} onComplete={onComplete} />;
      case 'picture-recognition':
        return <PictureRecognition difficulty={difficulty} onComplete={onComplete} />;
      case 'attention-challenge':
        return <AttentionChallenge difficulty={difficulty} onComplete={onComplete} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl font-bold text-black">Game ready to play!</p>
              <button onClick={() => navigate('/patient/games')}
                className="mt-6 px-8 py-3 bg-white border-2 border-black text-black font-black rounded-2xl shadow">
                Back to All Games
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans">
      {/* Top Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between bg-white border-2 border-black rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{gameInfo?.emoji || '🎮'}</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-black">
              {gameInfo?.title || 'Cognitive Game'}
            </h2>
            <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
              Adaptive Level: {adaptiveLevel}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/patient/games')}
          className="px-4 py-1.5 bg-white border-2 border-black text-black rounded-xl text-xs sm:text-sm font-black hover:bg-gray-50 transition"
        >
          ← Exit to Hub
        </button>
      </div>

      {gameState === 'FINISHED' && result ? (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-black shadow-lg text-center space-y-6 animate-fade-in max-w-xl mx-auto my-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 mx-auto flex items-center justify-center text-4xl shadow-sm">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Exercise Completed!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-700">
              Your memory performance data has been securely saved to your clinical progress vault.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black">
              <div className="text-2xl font-black text-black">{result.score}</div>
              <div className="text-[11px] font-black uppercase text-gray-600">Points</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black">
              <div className="text-2xl font-black text-emerald-700">{result.accuracy}%</div>
              <div className="text-[11px] font-black uppercase text-gray-600">Accuracy</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black">
              <div className="text-2xl font-black text-indigo-700">{result.timeTaken}s</div>
              <div className="text-[11px] font-black uppercase text-gray-600">Time</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 bg-white border-2 border-black text-black font-black text-xs sm:text-sm rounded-2xl hover:bg-gray-50 flex items-center justify-center gap-2 shadow-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              onClick={() => navigate('/patient/progress')}
              className="flex-1 py-3.5 bg-black text-white font-black text-xs sm:text-sm rounded-2xl hover:bg-gray-800 flex items-center justify-center gap-2 shadow transition"
            >
              <span>View Progress Vault</span>
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
