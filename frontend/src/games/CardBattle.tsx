import React, { useState } from 'react';
import { Trophy, Shield, Zap, Sparkles, RotateCcw } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface CardBattleProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface BattleCard {
  id: string;
  name: string;
  emoji: string;
  power: number;
  type: string;
}

const DECK_CARDS: BattleCard[] = [
  { id: '1', name: 'Royal Lion (सिंह)', emoji: '🦁', power: 95, type: 'Strength' },
  { id: '2', name: 'Grand Elephant (हत्ती)', emoji: '🐘', power: 90, type: 'Heavy' },
  { id: '3', name: 'Golden Eagle (गरुड)', emoji: '🦅', power: 85, type: 'Speed' },
  { id: '4', name: 'Royal Tiger (वाघ)', emoji: '🐯', power: 80, type: 'Agility' },
  { id: '5', name: 'Swift Horse (घोडा)', emoji: '🐎', power: 70, type: 'Stamina' },
  { id: '6', name: 'Clever Fox (कोल्हा)', emoji: '🦊', power: 65, type: 'Wisdom' },
  { id: '7', name: 'Gentle Deer (हरिण)', emoji: '🦌', power: 55, type: 'Grace' },
  { id: '8', name: 'Iron Turtle (कासव)', emoji: '🐢', power: 50, type: 'Defense' },
];

export const CardBattle: React.FC<CardBattleProps> = ({ difficulty, onComplete }) => {
  const [p1Hand, setP1Hand] = useState<BattleCard[]>(DECK_CARDS.slice(0, 4));
  const [p2Hand, setP2Hand] = useState<BattleCard[]>(DECK_CARDS.slice(4, 8));
  const [p1ActiveCard, setP1ActiveCard] = useState<BattleCard | null>(null);
  const [p2ActiveCard, setP2ActiveCard] = useState<BattleCard | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const playCard = (card: BattleCard) => {
    if (p1ActiveCard || isGameOver) return;

    setP1ActiveCard(card);
    setP1Hand(prev => prev.filter(c => c.id !== card.id));

    // AI plays random card from hand
    const aiCard = p2Hand[Math.floor(Math.random() * p2Hand.length)];
    setP2ActiveCard(aiCard);
    setP2Hand(prev => prev.filter(c => c.id !== aiCard.id));

    // Determine round outcome
    if (card.power > aiCard.power) {
      setRoundWinner('Player 1 Wins Round!');
      setP1Score(s => s + 1);
    } else if (aiCard.power > card.power) {
      setRoundWinner('AABHA AI Wins Round!');
      setP2Score(s => s + 1);
    } else {
      setRoundWinner('Round Tied!');
    }

    setTimeout(() => {
      setP1ActiveCard(null);
      setP2ActiveCard(null);
      setRoundWinner(null);
      if (p1Hand.length <= 1) {
        setIsGameOver(true);
      }
    }, 2000);
  };

  const restartGame = () => {
    setP1Hand(DECK_CARDS.slice(0, 4));
    setP2Hand(DECK_CARDS.slice(4, 8));
    setP1ActiveCard(null);
    setP2ActiveCard(null);
    setRoundWinner(null);
    setP1Score(0);
    setP2Score(0);
    setIsGameOver(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🃏</span> Card Power Battle
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Play your card against the opponent! The highest power wins the round.
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Score: {p1Score} - {p2Score}
        </div>
      </div>

      {/* Battle Arena */}
      <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-sm flex flex-col items-center justify-center min-h-[220px]">
        {p1ActiveCard && p2ActiveCard ? (
          <div className="flex items-center justify-center gap-8 animate-scale-up">
            {/* Player 1 Card */}
            <div className="p-4 rounded-2xl border-2 border-blue-500 bg-white shadow-md text-center w-36">
              <span className="text-4xl">{p1ActiveCard.emoji}</span>
              <div className="text-sm font-black text-black mt-1">{p1ActiveCard.name}</div>
              <div className="text-lg font-black text-blue-600">⚡ {p1ActiveCard.power} Power</div>
            </div>

            <span className="text-2xl font-black text-gray-400">VS</span>

            {/* AI Card */}
            <div className="p-4 rounded-2xl border-2 border-purple-500 bg-white shadow-md text-center w-36">
              <span className="text-4xl">{p2ActiveCard.emoji}</span>
              <div className="text-sm font-black text-black mt-1">{p2ActiveCard.name}</div>
              <div className="text-lg font-black text-purple-600">⚡ {p2ActiveCard.power} Power</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 font-bold">
            Select a card from your hand below to enter the battle!
          </div>
        )}

        {roundWinner && (
          <div className="mt-4 px-4 py-1.5 bg-white border-2 border-black rounded-full text-xs font-black text-black animate-scale-up">
            🏆 {roundWinner}
          </div>
        )}
      </div>

      {/* Player 1 Hand */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-black">
          Your Cards Hand ({p1Hand.length} Remaining):
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {p1Hand.map(card => (
            <button
              key={card.id}
              onClick={() => playCard(card)}
              disabled={p1ActiveCard !== null}
              className="p-4 rounded-2xl border-2 border-black bg-white hover:bg-gray-50 text-center transition active:scale-95 shadow-sm flex flex-col items-center justify-between h-36"
            >
              <span className="text-4xl">{card.emoji}</span>
              <div>
                <div className="text-xs font-black text-black">{card.name}</div>
                <div className="text-sm font-black text-emerald-700">⚡ {card.power} Power</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isGameOver && (
        <div className="p-8 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-lg">
          <div className="text-5xl">🏆</div>
          <h3 className="text-3xl font-black text-black">
            {p1Score > p2Score ? '🎉 You Won the Card Battle!' : p2Score > p1Score ? '🎉 AABHA AI Won!' : "🤝 Game Tied!"}
          </h3>
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-white border-2 border-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
