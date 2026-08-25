import React from 'react';
import { ArrowRight, Sparkles, Trophy, Users } from 'lucide-react';

export interface GameItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'quiz' | 'therapy' | 'memory' | 'physio' | 'fun' | '2-player' | 'cognitive' | 'all';
  badge?: string;
  tag?: 'NEW' | 'TRENDING' | 'FEATURED' | string;
  is_featured?: boolean;
}

interface GameCardProps {
  game: GameItem;
  onPlay: (gameId: string) => void;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, className = '' }) => {
  const getBadgeColors = (badge = '') => {
    const b = badge.toLowerCase();
    if (b.includes('hot') || b.includes('trending')) return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
    if (b.includes('therapy') || b.includes('relax')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (b.includes('physio') || b.includes('speed')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
    if (b.includes('classic') || b.includes('memory')) return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
    if (b.includes('new') || b.includes('featured')) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
    return 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]';
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'quiz':
      case '2-player':
        return '2-PLAYER';
      case 'therapy':
        return 'THERAPY';
      case 'physio':
        return 'PHYSIO';
      case 'memory':
      case 'cognitive':
        return 'MEMORY';
      case 'fun':
        return 'FUN & SOCIAL';
      default:
        return 'GAME';
    }
  };

  return (
    <div
      onClick={() => onPlay(game.id)}
      className={`card-3d-interactive card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] text-left flex flex-col justify-between group cursor-pointer transition-all duration-300 relative select-none overflow-hidden border border-[var(--card-border-inline)] ${className}`}
    >
      {/* Subtle Ambient Radial Light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

      <div className="relative z-10">
        {/* Top Header: Icon (Left) & Category Tag/Badge (Right) */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl sm:text-4xl shadow-inner group-hover:scale-115 group-hover:-rotate-6 transition-transform duration-300 shrink-0">
            {game.icon}
          </div>

          <div className="flex flex-col items-end gap-1">
            {game.badge && (
              <span className={`text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs animate-badge-glow ${getBadgeColors(game.badge)}`}>
                {game.badge}
              </span>
            )}
            <span className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider">
              {getCategoryLabel(game.category)}
            </span>
          </div>
        </div>

        {/* Game Title */}
        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-emerald-400 transition mb-1 leading-snug">
          {game.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
          {game.description}
        </p>
      </div>

      {/* Footer "Play Now →" Button */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-black text-[var(--text-secondary)] group-hover:text-emerald-400 transition flex items-center gap-1">
          <span>Play Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>

        <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs group-hover:scale-110 transition shadow-lg">
          ▶
        </span>
      </div>
    </div>
  );
};

export default GameCard;
