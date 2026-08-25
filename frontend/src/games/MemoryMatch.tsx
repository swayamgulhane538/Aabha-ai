import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getRandomWordItems, shuffleArray, DIFFICULTY_CONFIG, calculateScore, WordItem } from './gameUtils';
import { CheckCircle2, Sparkles, Trophy, RotateCcw, Volume2 } from 'lucide-react';

export interface GameCompleteParams {
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  attempts?: number;
}

interface MemoryMatchProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface MatchCard {
  uniqueId: string;
  itemId: string;
  emoji: string;
  word: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ difficulty, onComplete }) => {
  const { t, i18n } = useTranslation();
  const config = DIFFICULTY_CONFIG.memoryMatch(difficulty);

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedItems, setMatchedItems] = useState<WordItem[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  const getWordInLanguage = (item: WordItem): string => {
    if (i18n.language === 'mr') return item.mr;
    if (i18n.language === 'hi') return item.hi;
    return item.en;
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty, i18n.language]);

  const initializeGame = () => {
    const selectedItems = getRandomWordItems(config.pairs);
    
    // Create pairs for each item
    const deck: MatchCard[] = [];
    selectedItems.forEach((item, index) => {
      deck.push({
        uniqueId: `${item.id}-1`,
        itemId: item.id,
        emoji: item.emoji,
        word: getWordInLanguage(item),
        isFlipped: false,
        isMatched: false
      });
      deck.push({
        uniqueId: `${item.id}-2`,
        itemId: item.id,
        emoji: item.emoji,
        word: getWordInLanguage(item),
        isFlipped: false,
        isMatched: false
      });
    });

    const shuffledDeck = shuffleArray(deck);
    setCards(shuffledDeck);
    setFlippedIndices([]);
    setMatchedItems([]);
    setMoves(0);
    setStartTime(Date.now());
    setIsFinished(false);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      isFinished
    ) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].itemId === cards[secondIdx].itemId) {
        // MATCH FOUND! Keep cards permanently flipped & visible
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === firstIdx || i === secondIdx 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          ));
          setFlippedIndices([]);
          
          // Add to matched items list
          const matchedCard = cards[firstIdx];
          setMatchedItems(prev => {
            if (prev.some(item => item.id === matchedCard.itemId)) return prev;
            return [...prev, {
              id: matchedCard.itemId,
              emoji: matchedCard.emoji,
              en: matchedCard.word,
              hi: matchedCard.word,
              mr: matchedCard.word
            }];
          });
        }, 400);
      } else {
        // No match: Flip back after short delay
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === firstIdx || i === secondIdx 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  // Check completion
  useEffect(() => {
    if (matchedItems.length === config.pairs && config.pairs > 0) {
      setIsFinished(true);
      const timeTaken = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
      const result = calculateScore(matchedItems.length, moves, timeTaken, 120);
      
      setTimeout(() => {
        onComplete({
          ...result,
          timeTaken,
          attempts: moves
        });
      }, 2500);
    }
  }, [matchedItems.length, config.pairs]);

  return (
    <div className="flex flex-col items-center p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto space-y-8">
      {/* Top Header with Progress & Language Switcher */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2.5">
            <span>🧩</span> {t('Memory Match')}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Tap cards to find and match corresponding words & pictures
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-base border border-blue-100">
            {t('Moves')}: {moves}
          </span>
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-base border border-emerald-100">
            {t('Matched')}: {matchedItems.length} / {config.pairs}
          </span>
        </div>
      </div>

      {/* Main Grid of Memory Cards */}
      <div 
        className="grid gap-4 md:gap-5 w-full"
        style={{ 
          gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` 
        }}
      >
        {cards.map((card, index) => {
          const isVisible = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.uniqueId}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || isVisible}
              className={`
                h-36 sm:h-44 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all duration-300 transform active:scale-95 border-2 shadow-sm
                ${
                  card.isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md ring-2 ring-emerald-200'
                    : isVisible
                    ? 'bg-blue-50 border-primary-400 text-primary-900 shadow-md ring-2 ring-primary-100'
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-primary-300 text-transparent'
                }
              `}
              aria-label={isVisible ? card.word : "Card"}
            >
              {isVisible ? (
                <div className="flex flex-col items-center justify-center animate-scale-up space-y-2">
                  <span className="text-4xl sm:text-5xl">{card.emoji}</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    {card.word}
                  </span>
                  {card.isMatched && (
                    <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Matched!
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl text-gray-400 font-black">
                  ❓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Matched Words Collection Shelf (Visible Words in App) */}
      <div className="w-full p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Matched Words Visible in App ({matchedItems.length} of {config.pairs})</span>
        </h3>

        {matchedItems.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium">
            Match two cards above to unlock the words here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {matchedItems.map(item => (
              <div
                key={item.id}
                className="px-4 py-2 rounded-xl bg-white border-2 border-emerald-300 shadow-sm flex items-center gap-2 animate-scale-up"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-bold text-base text-gray-900">{getWordInLanguage(item)}</span>
                <span className="text-xs text-emerald-600 font-extrabold">✓</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="w-full p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center shadow-lg animate-bounce">
          <div className="text-4xl mb-2">🎉 🏆 🎉</div>
          <h3 className="text-2xl font-black text-emerald-900 mb-1">
            Excellent Memory! All Words Matched & Visible!
          </h3>
          <p className="text-base text-emerald-700 font-semibold">
            You completed the challenge in {moves} moves.
          </p>
        </div>
      )}
    </div>
  );
};
