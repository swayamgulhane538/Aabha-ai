import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Plus, CheckCircle2, Users } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface WordBattleProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const ROUND_LETTERS = ['S', 'M', 'P', 'A', 'T', 'B', 'R'];

export const WordBattle: React.FC<WordBattleProps> = ({ difficulty, onComplete }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [p1Input, setP1Input] = useState('');
  const [p1Words, setP1Words] = useState<string[]>([]);
  const [p2Words, setP2Words] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAgainstAI, setIsAgainstAI] = useState(true);

  const currentLetter = ROUND_LETTERS[roundIdx];

  // Timer Countdown
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      if (roundIdx + 1 < ROUND_LETTERS.length) {
        setRoundIdx(i => i + 1);
        setTimeLeft(30);
      } else {
        setIsGameOver(true);
      }
    }
  }, [timeLeft, isGameOver, roundIdx]);

  // AI Opponent simulation
  useEffect(() => {
    if (isAgainstAI && !isGameOver && timeLeft > 0) {
      const aiDelay = Math.random() * 4000 + 3000;
      const timer = setTimeout(() => {
        const sampleDict: Record<string, string[]> = {
          'S': ['Sun', 'Star', 'Smile', 'Sweet', 'Song', 'Story'],
          'M': ['Moon', 'Music', 'Memory', 'Mother', 'Morning', 'Mango'],
          'P': ['Peace', 'Plant', 'Picture', 'People', 'Paper', 'Pencil'],
          'A': ['Apple', 'Angel', 'Animal', 'Always', 'Action', 'Air'],
          'T': ['Time', 'Tree', 'Temple', 'Table', 'Travel', 'Tea'],
          'B': ['Bird', 'Book', 'Beautiful', 'Bloom', 'Brain', 'Blue'],
          'R': ['River', 'Rose', 'Rainbow', 'Radio', 'Ring', 'Road']
        };
        const words = sampleDict[currentLetter] || ['Sample', 'Simple'];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (randomWord && !p2Words.includes(randomWord)) {
          setP2Words(prev => [...prev, randomWord]);
        }
      }, aiDelay);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentLetter, isAgainstAI, isGameOver]);

  const handleAddP1Word = (e: React.FormEvent) => {
    e.preventDefault();
    const word = p1Input.trim().toUpperCase();
    if (word.length >= 2 && word.startsWith(currentLetter) && !p1Words.includes(word)) {
      setP1Words(prev => [...prev, word]);
      setP1Input('');
    }
  };

  const calculatePoints = (words: string[]) => {
    return words.reduce((sum, w) => sum + (w.length * 10), 0);
  };

  const p1Score = calculatePoints(p1Words);
  const p2Score = calculatePoints(p2Words);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🔤</span> Word Battle
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Write as many words starting with the target letter as possible!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-base flex items-center gap-1.5 shadow-sm">
            <Clock className="w-5 h-5 text-red-500 animate-pulse" />
            <span>{timeLeft}s</span>
          </div>
          <button
            onClick={() => setIsAgainstAI(!isAgainstAI)}
            className="px-3.5 py-2 rounded-2xl border-2 border-black bg-white text-xs font-black hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>{isAgainstAI ? 'vs AABHA AI' : '2 Players (Local)'}</span>
          </button>
        </div>
      </div>

      {/* Target Letter Spotlight */}
      <div className="p-6 rounded-3xl bg-white border-2 border-black text-center shadow-sm flex flex-col items-center">
        <span className="text-xs font-black uppercase text-gray-500 mb-1">Current Round Letter</span>
        <div className="text-6xl sm:text-8xl font-black text-black my-2">
          {currentLetter}
        </div>
        <p className="text-sm font-bold text-gray-700">
          Make words starting with <strong className="text-black text-lg">"{currentLetter}"</strong> (Longer words give more points!)
        </p>
      </div>

      {/* Input Form for Player 1 */}
      {!isGameOver && (
        <form onSubmit={handleAddP1Word} className="flex gap-2.5">
          <input
            type="text"
            placeholder={`Type a word starting with ${currentLetter}...`}
            value={p1Input}
            onChange={e => setP1Input(e.target.value)}
            className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-black bg-white text-black font-bold focus:outline-none text-base sm:text-lg"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-white border-2 border-black rounded-2xl font-black text-base hover:bg-gray-50 flex items-center gap-1.5 shadow"
          >
            <Plus className="w-5 h-5" />
            <span>Add Word</span>
          </button>
        </form>
      )}

      {/* Word Lists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player 1 Words */}
        <div className="p-5 rounded-2xl bg-white border-2 border-blue-500 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-black text-blue-600 uppercase">Player 1 (You)</span>
            <span className="text-lg font-black text-black">{p1Score} pts ({p1Words.length} words)</span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px]">
            {p1Words.map((w, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-black shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> {w} ({w.length * 10}p)
              </span>
            ))}
          </div>
        </div>

        {/* Player 2 / AI Words */}
        <div className="p-5 rounded-2xl bg-white border-2 border-purple-500 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-black text-purple-600 uppercase">{isAgainstAI ? 'AABHA AI' : 'Player 2'}</span>
            <span className="text-lg font-black text-black">{p2Score} pts ({p2Words.length} words)</span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px]">
            {p2Words.map((w, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-black shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> {w} ({w.length * 10}p)
              </span>
            ))}
          </div>
        </div>
      </div>

      {isGameOver && (
        <div className="p-8 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-lg">
          <div className="text-5xl">🏆</div>
          <h3 className="text-3xl font-black text-black">
            {p1Score > p2Score ? '🎉 Player 1 is the Word Master!' : p2Score > p1Score ? `🎉 ${isAgainstAI ? 'AABHA AI' : 'Player 2'} Wins!` : "🤝 It's a Tie!"}
          </h3>
          <button
            onClick={() => {
              setRoundIdx(0);
              setTimeLeft(30);
              setP1Words([]);
              setP2Words([]);
              setIsGameOver(false);
            }}
            className="px-6 py-3 bg-white border-2 border-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
