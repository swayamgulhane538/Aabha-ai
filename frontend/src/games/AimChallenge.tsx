import React, { useState, useEffect } from 'react';
import { Trophy, Target, Clock, RotateCcw } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface AimChallengeProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

export const AimChallenge: React.FC<AimChallengeProps> = ({ difficulty, onComplete }) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [targetPos, setTargetPos] = useState({ top: 40, left: 40 });
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  // Target jumps every 1.2s if not clicked
  useEffect(() => {
    if (!isGameOver) {
      const interval = setInterval(() => {
        setTargetPos({
          top: Math.floor(Math.random() * 70) + 10,
          left: Math.floor(Math.random() * 75) + 10
        });
      }, Math.max(700, 1400 - difficulty * 100));
      return () => clearInterval(interval);
    }
  }, [isGameOver, difficulty]);

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGameOver) return;
    setHits(h => h + 1);
    setScore(s => s + 100);
    setTargetPos({
      top: Math.floor(Math.random() * 70) + 10,
      left: Math.floor(Math.random() * 75) + 10
    });
  };

  const handleAreaClick = () => {
    if (isGameOver) return;
    setMisses(m => m + 1);
  };

  const resetGame = () => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(25);
    setIsGameOver(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🎯</span> Aim & Reflex Challenge
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Tap the moving target as many times as you can before the time runs out!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{timeLeft}s</span>
          </div>
          <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
            Score: {score} pts
          </div>
        </div>
      </div>

      {/* Target Arena */}
      {!isGameOver ? (
        <div
          onClick={handleAreaClick}
          className="w-full h-80 sm:h-96 rounded-3xl border-2 border-black bg-white relative overflow-hidden cursor-crosshair shadow-sm select-none"
        >
          <button
            onClick={handleTargetClick}
            style={{
              top: `${targetPos.top}%`,
              left: `${targetPos.left}%`,
            }}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-red-600 bg-white flex items-center justify-center text-3xl sm:text-4xl transform -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-all duration-100 shadow-lg hover:scale-105"
          >
            🎯
          </button>
        </div>
      ) : (
        <div className="p-8 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-lg">
          <div className="text-5xl">🏆</div>
          <h3 className="text-3xl font-black text-black">
            Challenge Completed!
          </h3>
          <p className="text-base text-gray-700 font-bold">
            Total Score: {score} pts | Target Hits: {hits} | Misses: {misses}
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-white border-2 border-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
