import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Trophy, Users } from 'lucide-react';

export interface GameItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'quiz' | 'therapy' | 'memory' | 'physio' | 'fun' | '2-player' | 'cognitive' | 'sih-core' | 'all';
  badge?: string;
  tag?: 'NEW' | 'TRENDING' | 'FEATURED' | string;
  is_featured?: boolean;
}

export interface GameCardProps {
  game: GameItem;
  onPlay: (gameId: string) => void;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, className = '' }) => {
  const { t } = useTranslation();
  const getBadgeColors = (badge = '') => {
    const b = badge.toLowerCase();
    if (b.includes('sih') || b.includes('core')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (b.includes('hot') || b.includes('trending')) return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
    if (b.includes('therapy') || b.includes('relax')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (b.includes('physio') || b.includes('speed')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
    if (b.includes('classic') || b.includes('memory')) return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
    if (b.includes('new') || b.includes('featured')) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
    return 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]';
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'sih-core':
        return t('SIH CORE');
      case 'quiz':
      case '2-player':
        return t('2-PLAYER');
      case 'therapy':
        return t('THERAPY');
      case 'physio':
        return t('PHYSIO');
      case 'memory':
      case 'cognitive':
        return t('MEMORY');
      case 'fun':
        return t('FAMILY');
      default:
        return t('GAME');
    }
  };

  return (
    <div
      onClick={() => onPlay(game.id)}
      className={`card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] hover:border-emerald-400/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group select-none relative overflow-hidden ${className}`}
    >
      <div className="space-y-3">
        {/* Top Header inside card */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
            {game.icon}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {game.badge && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getBadgeColors(game.badge)}`}>
                {t(game.badge) || game.badge}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
              {getCategoryLabel(game.category)}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span>{t(game.title) || game.title}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
            {t(game.description) || game.description}
          </p>
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-black text-emerald-400">
        <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{t('Adaptive AI')}</span>
        </span>
        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>{t('Start Game')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export default GameCard;
