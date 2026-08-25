import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hand, Sparkles, CheckCircle2, RotateCcw, Target, Zap, Activity } from 'lucide-react';
import { api } from '../services/api';

interface TapTarget {
  id: number;
  x: number; // percentage 10% to 90%
  y: number; // percentage 10% to 80%
  number: number;
}

export const PhysiotherapyHand: React.FC = () => {
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'COMPLETED'>('IDLE');
  const [round, setRound] = useState(1);
  const [currentTarget, setCurrentTarget] = useState<TapTarget | null>(null);
  const [tapsCompleted, setTapsCompleted] = useState(0);
  const [totalLatency, setTotalLatency] = useState(0);
  const [accuracyHits, setAccuracyHits] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [spawnTimestamp, setSpawnTimestamp] = useState<number>(0);

  const totalRounds = 10;

  const spawnNextTarget = (nextIndex: number) => {
    if (nextIndex > totalRounds) {
      handleCompleteGame();
      return;
    }

    // Generate balanced reachable positions for fingers
    const randomX = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    const randomY = Math.floor(Math.random() * 60) + 20; // 20% to 80%

    setCurrentTarget({
      id: Date.now(),
      x: randomX,
      y: randomY,
      number: nextIndex
    });
    setSpawnTimestamp(Date.now());
  };

  const handleStartGame = () => {
    setGameState('PLAYING');
    setRound(1);
    setTapsCompleted(0);
    setTotalLatency(0);
    setAccuracyHits(0);
    setStartTime(Date.now());
    spawnNextTarget(1);
  };

  const handleTapTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    const latency = Date.now() - spawnTimestamp;
    setTotalLatency(prev => prev + latency);
    setAccuracyHits(prev => prev + 1);

    const nextRound = round + 1;
    setRound(nextRound);
    setTapsCompleted(prev => prev + 1);

    spawnNextTarget(nextRound);
  };

  const handleCompleteGame = async () => {
    setGameState('COMPLETED');
    const totalTimeSec = Math.round((Date.now() - startTime) / 1000);
    const avgLatencyMs = Math.round(totalLatency / totalRounds) || 450;
    const accuracy = Math.round((accuracyHits / totalRounds) * 100) || 100;
    const score = Math.max(60, 100 - Math.floor(avgLatencyMs / 20));

    try {
      await api.post('/games/result', {
        gameType: 'physiotherapy_hand',
        gameName: 'Physiotherapy Hand Movement & Dexterity',
        score,
        maxScore: 100,
        accuracy,
        timeTaken: totalTimeSec,
        difficulty: 'NORMAL'
      });
    } catch (err) {
      console.warn('Physio result note:', err);
    }
  };

  const averageLatency = tapsCompleted > 0 ? Math.round(totalLatency / tapsCompleted) : 0;
  const dexterityGrade = averageLatency < 600 ? 'Excellent Coordination' : averageLatency < 1000 ? 'Good & Steady' : 'Improving Hand Reflexes';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans p-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/games')}
          className="px-4 py-2 bg-white border-2 border-black rounded-2xl text-xs font-black text-black hover:bg-gray-100 flex items-center gap-1.5 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>
      </div>

      {/* Main Game Container */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl space-y-4 relative">
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🖐️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-black">
                Physiotherapy Hand Coordination
              </h1>
              <p className="text-xs text-gray-600 font-bold">
                Tap targets in order to strengthen finger dexterity and reaction speed
              </p>
            </div>
          </div>

          {gameState === 'PLAYING' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-xs rounded-full">
                Target: {round} / {totalRounds}
              </span>
            </div>
          )}
        </div>

        {/* ─── GAME STATE: IDLE ─────────────────────────────────────────────── */}
        {gameState === 'IDLE' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-sm animate-pulse-gently">
              🖐️
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-black">
                Ready to Warm Up Your Hands?
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 font-bold">
                Numbered gentle targets will appear on screen. Tap each one with your index finger or thumb as quickly and comfortably as you can.
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-base shadow-md transition active:scale-95 cursor-pointer"
            >
              Start Hand Exercise (शुरू करें) →
            </button>
          </div>
        )}

        {/* ─── GAME STATE: PLAYING INTERACTIVE FIELD ──────────────────────── */}
        {gameState === 'PLAYING' && currentTarget && (
          <div
            className="relative w-full h-[380px] bg-gradient-to-b from-gray-50 to-emerald-50/20 border-2 border-black rounded-2xl overflow-hidden cursor-crosshair select-none"
          >
            {/* Target Button */}
            <button
              onClick={handleTapTarget}
              style={{
                left: `${currentTarget.x}%`,
                top: `${currentTarget.y}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-400 border-4 border-black text-black font-black text-xl sm:text-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-transform animate-bounce"
            >
              <span>{currentTarget.number}</span>
            </button>
          </div>
        )}

        {/* ─── GAME STATE: COMPLETED ───────────────────────────────────────── */}
        {gameState === 'COMPLETED' && (
          <div className="py-8 text-center space-y-6 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-black">
                Session Complete! 🎉
              </h2>
              <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-950 font-black text-xs rounded-full">
                {dexterityGrade}
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="p-3 bg-gray-50 border-2 border-black rounded-2xl">
                <div className="text-xs text-gray-600 font-black uppercase">Taps</div>
                <div className="text-2xl font-black text-black">{totalRounds} / {totalRounds}</div>
              </div>
              <div className="p-3 bg-gray-50 border-2 border-black rounded-2xl">
                <div className="text-xs text-gray-600 font-black uppercase">Avg Speed</div>
                <div className="text-2xl font-black text-black">{averageLatency}ms</div>
              </div>
              <div className="p-3 bg-gray-50 border-2 border-black rounded-2xl">
                <div className="text-xs text-gray-600 font-black uppercase">Accuracy</div>
                <div className="text-2xl font-black text-emerald-700">100%</div>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handleStartGame}
                className="px-5 py-2.5 bg-white border-2 border-black text-black font-black text-xs rounded-xl hover:bg-gray-100 shadow-xs"
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate('/patient/games')}
                className="px-5 py-2.5 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800 shadow"
              >
                Back to Games Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysiotherapyHand;
