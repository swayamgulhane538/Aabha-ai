import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface PuzzleRaceProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

export const PuzzleRace: React.FC<PuzzleRaceProps> = ({ difficulty, onComplete }) => {
  // 3x3 grid with numbers 1-8 and null (empty)
  const [tiles, setTiles] = useState<(number | null)[]>([1, 2, 3, 4, null, 5, 7, 8, 6]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    shuffleTiles();
  }, []);

  useEffect(() => {
    if (!isSolved) {
      const timer = setInterval(() => setSeconds(s => s + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isSolved]);

  const shuffleTiles = () => {
    setTiles([1, 2, 3, 4, null, 5, 7, 8, 6]);
    setMoves(0);
    setSeconds(0);
    setIsSolved(false);
  };

  const isAdjacent = (idx1: number, idx2: number) => {
    const row1 = Math.floor(idx1 / 3);
    const col1 = idx1 % 3;
    const row2 = Math.floor(idx2 / 3);
    const col2 = idx2 % 3;
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
  };

  const handleTileClick = (index: number) => {
    const emptyIndex = tiles.indexOf(null);
    if (emptyIndex === -1 || !isAdjacent(index, emptyIndex) || isSolved) return;

    const newTiles = [...tiles];
    newTiles[emptyIndex] = newTiles[index];
    newTiles[index] = null;
    setTiles(newTiles);
    setMoves(m => m + 1);

    // Check if solved
    const solved = newTiles.slice(0, 8).every((val, i) => val === i + 1) && newTiles[8] === null;
    if (solved) {
      setIsSolved(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🧩</span> Puzzle Sliding Race
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Slide the tiles into sequential order from 1 to 8!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4 text-black" />
            <span>{seconds}s</span>
          </div>
          <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
            Moves: {moves}
          </div>
        </div>
      </div>

      {/* 3x3 Sliding Puzzle Board */}
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80 p-3 bg-white border-2 border-black rounded-3xl shadow-sm">
          {tiles.map((tile, idx) => {
            if (tile === null) {
              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
                />
              );
            }

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className="rounded-2xl bg-white border-2 border-black hover:bg-gray-50 text-black text-3xl sm:text-4xl font-black flex items-center justify-center shadow-sm active:scale-95 transition"
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="text-center space-y-4">
        {isSolved && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl text-center space-y-2 shadow-lg animate-scale-up">
            <div className="text-4xl">🎉 🏆</div>
            <h3 className="text-2xl font-black text-emerald-900">
              Puzzle Solved in {moves} moves and {seconds} seconds!
            </h3>
          </div>
        )}

        <button
          onClick={shuffleTiles}
          className="px-6 py-3 bg-white border-2 border-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Shuffle & Restart</span>
        </button>
      </div>
    </div>
  );
};
