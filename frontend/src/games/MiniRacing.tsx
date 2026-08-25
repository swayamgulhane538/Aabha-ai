import React, { useState, useEffect } from 'react';
import { Trophy, Flag, Zap, RotateCcw, Users } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface MiniRacingProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

export const MiniRacing: React.FC<MiniRacingProps> = ({ difficulty, onComplete }) => {
  const [p1Pos, setP1Pos] = useState(0);
  const [p2Pos, setP2Pos] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isAgainstAI, setIsAgainstAI] = useState(true);

  // AI Racing progress
  useEffect(() => {
    if (isAgainstAI && !winner) {
      const interval = setInterval(() => {
        setP2Pos(pos => {
          const next = pos + Math.floor(Math.random() * 4) + 1;
          if (next >= 100) {
            setWinner('AABHA AI (Blue Racer)');
            return 100;
          }
          return next;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isAgainstAI, winner]);

  const handleP1Tap = () => {
    if (winner) return;
    setP1Pos(pos => {
      const next = pos + 4;
      if (next >= 100) {
        setWinner('Player 1 (Red Racer)');
        return 100;
      }
      return next;
    });
  };

  const handleP2Tap = () => {
    if (winner || isAgainstAI) return;
    setP2Pos(pos => {
      const next = pos + 4;
      if (next >= 100) {
        setWinner('Player 2 (Blue Racer)');
        return 100;
      }
      return next;
    });
  };

  const resetRace = () => {
    setP1Pos(0);
    setP2Pos(0);
    setWinner(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🏃</span> Mini Racing Track
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Tap the pedal button rapidly to sprint to the finish line!
          </p>
        </div>

        <button
          onClick={() => { setIsAgainstAI(!isAgainstAI); resetRace(); }}
          className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-xs font-black hover:bg-gray-50 flex items-center gap-1.5"
        >
          <Users className="w-4 h-4" />
          <span>{isAgainstAI ? 'vs AABHA AI' : '2 Players (Local)'}</span>
        </button>
      </div>

      {/* Race Tracks */}
      <div className="space-y-4 p-6 bg-white border-2 border-black rounded-3xl shadow-sm">
        {/* Track 1: Player 1 */}
        <div>
          <div className="flex justify-between text-xs font-black text-black mb-1">
            <span>Player 1 (Red Racer 🏎️)</span>
            <span>{p1Pos}%</span>
          </div>
          <div className="h-14 bg-gray-50 border-2 border-black rounded-2xl relative flex items-center px-2 overflow-hidden">
            <div 
              className="absolute transition-all duration-75 text-3xl sm:text-4xl"
              style={{ left: `calc(${p1Pos}% - 40px)` }}
            >
              🏎️
            </div>
            <div className="absolute right-3 text-2xl">🏁</div>
          </div>
        </div>

        {/* Track 2: Player 2 / AI */}
        <div>
          <div className="flex justify-between text-xs font-black text-black mb-1">
            <span>{isAgainstAI ? 'AABHA AI (Blue Racer 🚙)' : 'Player 2 (Blue Racer 🚙)'}</span>
            <span>{p2Pos}%</span>
          </div>
          <div className="h-14 bg-gray-50 border-2 border-black rounded-2xl relative flex items-center px-2 overflow-hidden">
            <div 
              className="absolute transition-all duration-75 text-3xl sm:text-4xl"
              style={{ left: `calc(${p2Pos}% - 40px)` }}
            >
              🚙
            </div>
            <div className="absolute right-3 text-2xl">🏁</div>
          </div>
        </div>
      </div>

      {/* Racing Pedals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleP1Tap}
          disabled={winner !== null}
          className="h-28 rounded-2xl border-4 border-red-500 bg-white hover:bg-red-50 text-red-950 font-black text-xl shadow-md active:scale-95 transition flex flex-col items-center justify-center"
        >
          <span>🏎️ TAP ACCELERATE!</span>
          <span className="text-xs font-bold text-gray-500">Player 1 Pedal</span>
        </button>

        {!isAgainstAI ? (
          <button
            onClick={handleP2Tap}
            disabled={winner !== null}
            className="h-28 rounded-2xl border-4 border-blue-500 bg-white hover:bg-blue-50 text-blue-950 font-black text-xl shadow-md active:scale-95 transition flex flex-col items-center justify-center"
          >
            <span>🚙 TAP ACCELERATE!</span>
            <span className="text-xs font-bold text-gray-500">Player 2 Pedal</span>
          </button>
        ) : (
          <div className="h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center p-3">
            <span className="text-2xl mb-1">🤖</span>
            <span className="text-xs font-black text-gray-700">AABHA AI Auto-Driving</span>
          </div>
        )}
      </div>

      {winner && (
        <div className="p-6 bg-white border-2 border-black rounded-3xl text-center space-y-3 shadow-lg animate-scale-up">
          <div className="text-5xl">🏆</div>
          <h3 className="text-2xl font-black text-black">
            🎉 {winner} Wins the Race!
          </h3>
          <button
            onClick={resetRace}
            className="px-6 py-2.5 bg-white border-2 border-black rounded-xl font-black text-sm hover:bg-gray-50 shadow"
          >
            Race Again
          </button>
        </div>
      )}
    </div>
  );
};
