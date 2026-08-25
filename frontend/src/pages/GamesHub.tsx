import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Users, Brain, Heart, Zap, Flame, Trophy, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { GameCard, GameItem } from '../components/GameCard';

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

const MASTER_FALLBACK_GAMES: GameItem[] = [
  // 2-Player Battles
  { id: 'quiz-battle', icon: '🎯', title: '2-Player Quiz Battle', description: 'Fastest & correct answer gets points in real-time!', category: 'quiz', badge: 'Hot 1v1' },
  { id: 'quick-tap-battle', icon: '⚡', title: 'Quick Tap Battle', description: 'A target appears randomly; whoever taps fastest wins!', category: 'quiz', badge: 'Speed' },
  { id: 'tic-tac-toe', icon: '❌⭕', title: 'Tic-Tac-Toe Classic', description: 'Classic 1v1 with local 2-player or AABHA AI mode.', category: 'quiz', badge: 'Strategy' },
  { id: 'word-battle', icon: '🔤', title: 'Word Battle', description: 'Given a letter, both make words; longer words score more!', category: 'quiz', badge: 'Vocabulary' },
  { id: 'card-battle', icon: '🃏', title: 'Card Power Battle', description: 'Each player gets animal power cards and battles round-by-round!', category: 'quiz', badge: 'Tactical' },
  { id: 'mini-racing', icon: '🏃', title: 'Mini Racing Track', description: '2-player sprint race with rapid tap acceleration!', category: 'quiz', badge: 'Racing' },
  { id: 'aim-challenge', icon: '🎯', title: 'Aim Challenge', description: 'Hit moving targets to sharpen hand-eye coordination!', category: 'quiz', badge: 'Reflex' },

  // Therapy & Health
  { id: 'breathing-exercise', icon: '🌬️', title: 'Guided Box Breathing', description: 'Interactive biofeedback breathing to lower pulse, relieve stress & stabilize mood.', category: 'therapy', badge: 'Therapy' },
  { id: 'coloring-therapy', icon: '🎨', title: 'Art & Mandala Therapy', description: 'Mindful coloring for calming emotional release, focus & fine motor joy.', category: 'therapy', badge: 'Relaxing' },
  { id: 'physiotherapy-hand', icon: '🖐️', title: 'Physiotherapy Hand Movement', description: 'Finger tap coordination and dexterity training to strengthen motor reflexes.', category: 'therapy', badge: 'Physio' },

  // Memory & Brain
  { id: 'memory-match', icon: '🧠', title: 'Memory Match', description: 'Flip cards and find matching pairs of words & pictures.', category: 'memory', badge: 'Classic' },
  { id: 'sequence-recall', icon: '🔢', title: 'Sequence Recall', description: 'Watch the sequence and repeat it in the correct order.', category: 'memory', badge: 'Focus' },
  { id: 'picture-recognition', icon: '🖼️', title: 'Picture Recognition', description: 'Identify family, fruits and famous places.', category: 'memory', badge: 'Visual' },
  { id: 'attention-challenge', icon: '👁️', title: 'Attention Challenge', description: 'Find the target items in the grid as fast as you can.', category: 'memory', badge: 'Reflex' },
  { id: 'daily-memory-story', icon: '📖', title: 'Daily Memory Story', description: 'Read today’s personal memory story and test comprehension!', category: 'memory', badge: 'Personal' },
  { id: 'puzzle-race', icon: '🧩', title: 'Puzzle Sliding Race', description: 'Slide the tiles into sequential order from 1 to 8!', category: 'memory', badge: 'Puzzle' },
  { id: 'remember-objects', icon: '🎯', title: 'Remember Objects', description: 'Look at the objects carefully, then pick the ones you remember.', category: 'memory', badge: 'Recall' },

  // Fun & Social
  { id: 'truth-or-dare', icon: '😂', title: 'Truth or Dare Duo', description: 'Wholesome, heartwarming fun questions and challenges for family.', category: 'fun', badge: 'Family Fun' },
  { id: 'would-you-rather', icon: '🔥', title: 'Would You Rather?', description: 'Both choose an option and compare your favorite choices.', category: 'fun', badge: 'Social' },
  { id: 'guess-the-song', icon: '🎵', title: 'Guess the Song', description: 'Listen to the musical notes and identify the famous tune!', category: 'fun', badge: 'Music' },
  { id: 'who-am-i', icon: '🕵️', title: 'Who Am I?', description: 'Read clues and guess the famous historical or cultural personality.', category: 'fun', badge: 'Trivia' },
  { id: 'draw-and-guess', icon: '✏️', title: 'Draw & Guess Duo', description: 'Draw on the interactive canvas and guess the secret word!', category: 'fun', badge: 'Creative' },
  { id: 'dare-challenge', icon: '😈', title: 'Dare Challenge', description: 'Delightful, cheerful activities to bring smiles and laughter together!', category: 'fun', badge: 'Activities' }
];

export const GamesHub: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [games, setGames] = useState<GameItem[]>(MASTER_FALLBACK_GAMES);
  const [loading, setLoading] = useState(false);
  const [recentGames, setRecentGames] = useState<GameItem[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData>({
    date: new Date().toISOString().split('T')[0],
    featured_game_id: 'memory-match',
    featured_game_title: 'Memory Match Champions',
    special_challenge: 'Complete 8 matching pairs in under 60 seconds with 0 hints',
    reward_points: 150,
    badge_title: '🌟 Mind Master',
    is_completed: false,
    streak_days: 4
  });

  useEffect(() => {
    loadGamesAndChallenges();
  }, []);

  const loadGamesAndChallenges = async () => {
    setLoading(true);
    try {
      const response: any = await api.get('/games/feed').catch(() => null);
      if (response && response.games && response.games.length > 0) {
        setGames(response.games);
        if (response.dailyChallenge) {
          setDailyChallenge(response.dailyChallenge);
        }
        if (response.recentGames) {
          setRecentGames(response.recentGames);
        }
      } else {
        // Dynamic Shuffle
        const shuffled = [...MASTER_FALLBACK_GAMES].sort(() => Math.random() - 0.5);
        setGames(shuffled);
      }
    } catch (e) {
      const shuffled = [...MASTER_FALLBACK_GAMES].sort(() => Math.random() - 0.5);
      setGames(shuffled);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/patient/games/${gameId}`);
  };

  const filteredGames = games.filter(g => {
    if (activeCategory === 'all') return true;
    if (activeCategory === '2-player') return g.category === 'quiz' || g.category === '2-player';
    return g.category === activeCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans pb-24 text-[var(--text-primary)]">
      {/* ─── 1. HEADER SECTION ────────────────────────────────────────────── */}
      <header className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--card-border-inline)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 font-black text-xs rounded-full uppercase">
              18+ Cognitive Exercises
            </span>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Randomized Rotation Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>🎮</span> {t('Games & 2-Player Battles')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Interactive cognitive therapy, 2-player battles, and wholesome family games!
          </p>
        </div>

        <button
          onClick={loadGamesAndChallenges}
          className="btn-glass px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto active:scale-95"
          title="Shuffle game library"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>🔀 Shuffle Library</span>
        </button>
      </header>

      {/* ─── 2. DAILY CHALLENGE HERO BANNER ────────────────────────────── */}
      <div className="card-3d bg-gradient-to-r from-amber-500/15 via-[var(--bg-surface)] to-emerald-500/15 p-6 sm:p-8 rounded-[24px] border border-amber-400/30 relative overflow-hidden space-y-4 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[18px] bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-lg">
              <Flame className="w-6 h-6 text-amber-400 fill-current animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase rounded-md">
                  Daily Challenge
                </span>
                <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  🔥 {dailyChallenge.streak_days}-Day Streak
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                {dailyChallenge.featured_game_title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>+{dailyChallenge.reward_points} Bonus Points</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] z-10 relative max-w-xl">
          🎯 <strong>Goal:</strong> {dailyChallenge.special_challenge}
        </p>

        <div className="pt-2 flex items-center justify-between z-10 relative flex-wrap gap-2 border-t border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Reward Badge: <strong className="text-[var(--text-primary)]">{dailyChallenge.badge_title}</strong>
          </span>

          <button
            onClick={() => handlePlayGame(dailyChallenge.featured_game_id)}
            className="btn-glow px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Play Daily Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 3. CATEGORIES FILTER TABS ───────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: `All Games (${games.length})` },
          { id: '2-player', label: '🎯 2-Player Battles' },
          { id: 'memory', label: '🧠 Memory & Brain' },
          { id: 'fun', label: '😂 Fun & Social' },
          { id: 'therapy', label: '🧘 Therapy & Health' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md ring-1 ring-emerald-400/50 scale-100'
                : 'btn-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 4. GAME CARDS GRID (2-3 Cards Per Row) ────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-3d bg-[var(--card-bg-inline)] p-6 rounded-[24px] space-y-4 animate-pulse border border-[var(--card-border-inline)]">
              <div className="flex justify-between items-center">
                <div className="w-14 h-14 bg-[var(--bg-surface-secondary)] rounded-2xl" />
                <div className="w-16 h-5 bg-[var(--bg-surface-secondary)] rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-[var(--bg-surface-secondary)] rounded" />
              <div className="w-full h-10 bg-[var(--bg-surface-secondary)] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlayGame}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesHub;
