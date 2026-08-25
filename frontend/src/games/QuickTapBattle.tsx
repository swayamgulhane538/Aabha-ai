import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Users } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface QuickTapBattleProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

export const QuickTapBattle: React.FC<QuickTapBattleProps> = ({ difficulty, onComplete }) => {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [targetActive, setTargetActive] = useState(false);
  const [countdownText, setCountdownText] = useState('Wait for the signal...');
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAgainstAI, setIsAgainstAI] = useState(true);

  const timerRef = useRef<any>(null);

  const startNextRound = () => {
    setTargetActive(false);
    setRoundWinner(null);
    setCountdownText('Get Ready...');

    const randomDelay = Math.floor(Math.random() * 2500) + 1500;
    timerRef.current = setTimeout(() => {
      setTargetActive(true);
      setCountdownText('⚡ TAP NOW! ⚡');

      // AI Tap reaction (between 350ms to 750ms based on difficulty)
      if (isAgainstAI) {
        const aiSpeed = Math.max(300, 800 - difficulty * 80 + Math.random() * 200);
        setTimeout(() => {
          handleTap('P2');
        }, aiSpeed);
      }
    }, randomDelay);
  };

  useEffect(() => {
    startNextRound();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAgainstAI]);

  const handleTap = (player: 'P1' | 'P2') => {
    if (!targetActive || roundWinner !== null) return;

    setTargetActive(false);
    setRoundWinner(player === 'P1' ? 'Player 1' : isAgainstAI ? 'AABHA AI' : 'Player 2');

    if (player === 'P1') {
      const newScore = p1Score + 1;
      setP1Score(newScore);
      if (newScore >= 5) {
        setIsGameOver(true);
        return;
      }
    } else {
      const newScore = p2Score + 1;
      setP2Score(newScore);
      if (newScore >= 5) {
        setIsGameOver(true);
        return;
      }
    }

    setTimeout(() => {
      startNextRound();
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>⚡</span> Quick Tap Battle
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Tap as fast as you can when the signal turns GREEN! First to 5 wins.
          </p>
        </div>

        <button
          onClick={() => setIsAgainstAI(!isAgainstAI)}
          className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-xs font-black hover:bg-gray-50 flex items-center gap-1.5"
        >
          <Users className="w-4 h-4" />
          <span>{isAgainstAI ? 'vs AABHA AI' : '2 Players (Local)'}</span>
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border-2 border-blue-500 text-center">
          <div className="text-xs font-black uppercase text-blue-600">Player 1 (You)</div>
          <div className="text-3xl sm:text-4xl font-black text-black mt-1">{p1Score} / 5</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-purple-500 text-center">
          <div className="text-xs font-black uppercase text-purple-600">
            {isAgainstAI ? 'AABHA AI' : 'Player 2'}
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black mt-1">{p2Score} / 5</div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-6">
          {/* Reaction Arena */}
          <div 
            className={`h-48 sm:h-64 rounded-3xl border-4 flex flex-col items-center justify-center p-6 text-center transition-all duration-200 ${
              targetActive 
                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-[1.02] shadow-xl' 
                : 'bg-white border-black text-black'
            }`}
          >
            <Zap className={`w-16 h-16 mb-2 ${targetActive ? 'text-emerald-600 animate-bounce' : 'text-gray-300'}`} />
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              {countdownText}
            </h3>
            {roundWinner && (
              <div className="mt-3 px-4 py-1.5 bg-white border-2 border-black rounded-full font-black text-sm text-black animate-scale-up">
                🏆 {roundWinner} was fastest!
              </div>
            )}
          </div>

          {/* Interactive Tap Buzzers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleTap('P1')}
              disabled={!targetActive}
              className="h-28 sm:h-36 rounded-3xl border-4 border-blue-500 bg-white hover:bg-blue-50 text-blue-900 font-black text-2xl active:scale-95 transition shadow-lg flex flex-col items-center justify-center gap-1"
            >
              <span>👆 TAP HERE</span>
              <span className="text-xs font-bold text-gray-500">Player 1 Buzzer</span>
            </button>

            {!isAgainstAI ? (
              <button
                onClick={() => handleTap('P2')}
                disabled={!targetActive}
                className="h-28 sm:h-36 rounded-3xl border-4 border-purple-500 bg-white hover:bg-purple-50 text-purple-900 font-black text-2xl active:scale-95 transition shadow-lg flex flex-col items-center justify-center gap-1"
              >
                <span>👆 TAP HERE</span>
                <span className="text-xs font-bold text-gray-500">Player 2 Buzzer</span>
              </button>
            ) : (
              <div className="h-28 sm:h-36 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-3xl mb-1">🤖</span>
                <span className="text-sm font-black text-gray-700">AABHA AI is watching</span>
                <span className="text-xs text-gray-500 font-bold">Fast reactions active</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-lg">
          <div className="text-5xl">🏆</div>
          <h3 className="text-3xl font-black text-black">
            {p1Score >= 5 ? '🎉 Player 1 is the Reaction Champion!' : `🎉 ${isAgainstAI ? 'AABHA AI' : 'Player 2'} Wins!`}
          </h3>
          <button
            onClick={() => {
              setP1Score(0);
              setP2Score(0);
              setIsGameOver(false);
              startNextRound();
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
