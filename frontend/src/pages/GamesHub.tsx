import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Users, Brain, Heart, Zap, Flame, Trophy, RefreshCw, Clock, ArrowRight, Shield } from 'lucide-react';
import { api } from '../services/api';
import { GameCard, GameItem } from '../components/GameCard';
import { PersonalizationEngine, DailyRecommendation } from '../services/personalizationEngine';
import { AdaptiveAIEngine } from '../services/adaptiveAIEngine';

interface DailyChallengeData {
  date: string;
  featured_game_id: string;
  featured_game_title: string;
  special_challenge: string;
  reward_points: number;
  badge_title: string;
  is_completed: boolean;
  streak_days: number;
}

const SIH_CORE_GAMES: GameItem[] = [
  { id: 'memory-match', icon: '🎴', title: '1. Memory Match', description: 'Remember and match pairs of words and pictures. Tracks accuracy, attempts & time.', category: 'sih-core', badge: 'SIH Core #1' },
  { id: 'remember-objects', icon: '🔍', title: '2. Remember the Objects', description: 'Look at objects briefly, then identify remembered items. Measures recall retention.', category: 'sih-core', badge: 'SIH Core #2' },
  { id: 'attention-challenge', icon: '👁️', title: '3. Attention Finder', description: 'Spot target items amid distractors. Tracks reaction speed, focus & mistakes.', category: 'sih-core', badge: 'SIH Core #3' },
  { id: 'sequence-recall', icon: '🔢', title: '4. Pattern Recall', description: 'Watch the flashing sequence and reproduce it. Exercises sequential attention.', category: 'sih-core', badge: 'SIH Core #4' },
  { id: 'routine-ordering', icon: '📅', title: '5. Daily Routine Ordering', description: 'Arrange daily activities in the correct chronological order from morning to night.', category: 'sih-core', badge: 'SIH Core #5' },
  { id: 'familiar-objects', icon: '🍵', title: '6. Familiar Object Recognition', description: 'Identify everyday household objects and their purposes with gentle hints.', category: 'sih-core', badge: 'SIH Core #6' }
];

const OTHER_GAMES: GameItem[] = [
  // Therapy & Relax
  { id: 'surya-namaskar', icon: '☀️', title: 'Surya Namaskar 12 Steps Flow', description: 'Interactive sun salutation with breath pacing, dynamic motion poses & camera AI mirror.', category: 'therapy', badge: 'Yoga Flow' },
  { id: 'breathing-exercise', icon: '🌬️', title: 'Guided Box Breathing', description: 'Biofeedback breathing to lower pulse, relieve stress & stabilize mood.', category: 'therapy', badge: 'Therapy' },
  { id: 'coloring-therapy', icon: '🎨', title: 'Art & Mandala Therapy', description: 'Mindful coloring for calming emotional release and fine motor joy.', category: 'therapy', badge: 'Relaxing' },
  { id: 'physiotherapy-hand', icon: '🖐️', title: 'Physiotherapy Hand Movement', description: 'Finger tap dexterity training to strengthen motor reflexes.', category: 'therapy', badge: 'Physio' },

  // 2-Player Battles & Social
  { id: 'quiz-battle', icon: '🎯', title: '2-Player Quiz Battle', description: 'Fastest & correct answer gets points in real-time!', category: 'quiz', badge: '1v1 Battle' },
  { id: 'quick-tap-battle', icon: '⚡', title: 'Quick Tap Battle', description: 'A target appears randomly; whoever taps fastest wins!', category: 'quiz', badge: 'Speed' },
  { id: 'tic-tac-toe', icon: '❌⭕', title: 'Tic-Tac-Toe Classic', description: 'Classic 1v1 with local 2-player or AABHA AI mode.', category: 'quiz', badge: 'Strategy' },
  { id: 'word-battle', icon: '🔤', title: 'Word Battle', description: 'Given a letter, both make words; longer words score more!', category: 'quiz', badge: 'Vocabulary' },
  { id: 'card-battle', icon: '🃏', title: 'Card Power Battle', description: 'Each player gets animal power cards and battles round-by-round!', category: 'quiz', badge: 'Tactical' },
  { id: 'mini-racing', icon: '🏃', title: 'Mini Racing Track', description: '2-player sprint race with rapid tap acceleration!', category: 'quiz', badge: 'Racing' },
  { id: 'daily-memory-story', icon: '📖', title: 'Daily Memory Story', description: 'Read today’s personal memory story and test recall!', category: 'memory', badge: 'Story' },
  { id: 'puzzle-race', icon: '🧩', title: 'Puzzle Sliding Race', description: 'Slide the tiles into sequential order from 1 to 8!', category: 'memory', badge: 'Puzzle' },
  { id: 'truth-or-dare', icon: '😂', title: 'Truth or Dare Duo', description: 'Wholesome, heartwarming fun questions and challenges for family.', category: 'fun', badge: 'Social' },
  { id: 'would-you-rather', icon: '🔥', title: 'Would You Rather?', description: 'Both choose an option and compare your favorite choices.', category: 'fun', badge: 'Social' },
  { id: 'guess-the-song', icon: '🎵', title: 'Guess the Song', description: 'Listen to the musical notes and identify the famous tune!', category: 'fun', badge: 'Music' },
  { id: 'who-am-i', icon: '🕵️', title: 'Who Am I?', description: 'Read clues and guess the famous historical or cultural personality.', category: 'fun', badge: 'Trivia' },
  { id: 'draw-and-guess', icon: '✏️', title: 'Draw & Guess Duo', description: 'Draw on the interactive canvas and guess the secret word!', category: 'fun', badge: 'Creative' }
];

export const GamesHub: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recommendations, setRecommendations] = useState<DailyRecommendation[]>([]);
  const [dailyChallenge] = useState<DailyChallengeData>({
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    featured_game_id: 'memory-match',
    featured_game_title: 'Memory Match — Daily Challenge',
    special_challenge: 'Complete in under 30 seconds with 85%+ accuracy',
    reward_points: 50,
    badge_title: '🧠 Memory Master (+50 pts)',
    is_completed: false,
    streak_days: 5
  });

  useEffect(() => {
    setRecommendations(PersonalizationEngine.getDailyRecommendations());
  }, []);

  const allGames = [...SIH_CORE_GAMES, ...OTHER_GAMES];

  const filteredGames = allGames.filter(g => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'sih-core') return g.category === 'sih-core';
    if (activeCategory === 'therapy') return g.category === 'therapy';
    if (activeCategory === 'quiz') return g.category === 'quiz';
    if (activeCategory === 'memory') return g.category === 'memory' || g.category === 'sih-core';
    if (activeCategory === 'fun') return g.category === 'fun';
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-[var(--text-primary)] pb-20">
      {/* ─── 1. HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black rounded-full flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>{t('SIH26003 Cognitive Hub')}</span>
            </span>
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-black rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('Adaptive Difficulty (1–5)')}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {t('Cognitive & Memory Exercises')} 🧠
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1 max-w-2xl">
            {t('Scientifically curated memory, attention, reaction, and routine sequencing activities. Difficulty dynamically adjusts to your comfort level.')}
          </p>
        </div>

        {/* Non-Diagnostic Clinical Notice */}
        <div className="p-3.5 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-2xl text-[11px] text-[var(--text-secondary)] font-medium max-w-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>{t('Non-Diagnostic Indicator')}</span>
          </div>
          <p>
            {t('Exercises track engagement & memory activity. Designed for cognitive stimulation, not clinical diagnosis.')}
          </p>
        </div>
      </div>

      {/* ─── 2. PERSONALIZED AI RECOMMENDATIONS CAROUSEL ──────────────────── */}
      <div className="card-3d bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 p-6 rounded-[28px] border border-emerald-400/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              {t('Personalized for You Today (AI Recommendations)')}
            </h2>
          </div>
          <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
            {t('Tailored Daily Routine')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {recommendations.map(rec => (
            <div
              key={rec.gameId}
              onClick={() => navigate(`/patient/games/${rec.gameId}`)}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-emerald-400/50 transition cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{rec.icon}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    {t(rec.difficultyLabel)} ({t('Level')} {rec.difficultyLevel})
                  </span>
                </div>
                <h3 className="font-black text-sm text-[var(--text-primary)] group-hover:text-emerald-300 transition-colors">
                  {t(rec.title) || rec.title}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                  {t(rec.reason) || rec.reason}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-black text-emerald-400">
                <span>⏱️ ~{rec.estimatedMinutes} mins</span>
                <span className="group-hover:translate-x-1 transition-transform">{t('Play Activity →')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. CATEGORY FILTER TABS ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `🌟 ${t('All Games & Activities')}` },
          { id: 'sih-core', label: `🧠 ${t('6 SIH Core Games')}` },
          { id: 'memory', label: `🎴 ${t('Memory & Recall')}` },
          { id: 'therapy', label: `🌬️ ${t('Therapy & Relaxation')}` },
          { id: 'quiz', label: `⚔️ ${t('2-Player Battles')}` },
          { id: 'fun', label: `🎉 ${t('Fun & Family')}` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'btn-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 4. GAMES GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={() => navigate(`/patient/games/${game.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesHub;
