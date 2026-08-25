import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Users } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface TicTacToeProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

type BoardValue = 'X' | 'O' | null;

export const TicTacToe: React.FC<TicTacToeProps> = ({ difficulty, onComplete }) => {
  const [board, setBoard] = useState<BoardValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [isAgainstAI, setIsAgainstAI] = useState(true);

  const calculateWinner = (squares: BoardValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winResult = calculateWinner(newBoard);
    if (winResult) {
      setWinner(winResult.winner);
      setWinningLine(winResult.line);
      if (winResult.winner === 'X') setP1Wins(w => w + 1);
      else setP2Wins(w => w + 1);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('Draw');
    }
  };

  // AI Turn (O)
  useEffect(() => {
    if (isAgainstAI && !isXNext && !winner) {
      const emptyIndices = board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length > 0) {
        const timer = setTimeout(() => {
          // Check if AI can win immediately
          let move = emptyIndices[0];
          for (const idx of emptyIndices) {
            const tempBoard = [...board];
            tempBoard[idx] = 'O';
            if (calculateWinner(tempBoard)) {
              move = idx;
              break;
            }
          }
          handleClick(move);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isXNext, isAgainstAI, winner, board]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>❌⭕</span> Tic-Tac-Toe Classic
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Get 3 in a row horizontally, vertically, or diagonally to win!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsAgainstAI(!isAgainstAI); resetGame(); }}
            className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-xs font-black hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>{isAgainstAI ? 'vs AABHA AI' : '2 Players (Local)'}</span>
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl bg-white border-2 text-center transition ${isXNext && !winner ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-gray-200'}`}>
          <div className="text-xs font-black uppercase text-blue-600">Player 1 (X)</div>
          <div className="text-3xl font-black text-black mt-1">{p1Wins} wins</div>
        </div>
        <div className={`p-4 rounded-2xl bg-white border-2 text-center transition ${!isXNext && !winner ? 'border-purple-600 shadow-md ring-2 ring-purple-100' : 'border-gray-200'}`}>
          <div className="text-xs font-black uppercase text-purple-600">{isAgainstAI ? 'AABHA AI (O)' : 'Player 2 (O)'}</div>
          <div className="text-3xl font-black text-black mt-1">{p2Wins} wins</div>
        </div>
      </div>

      {/* 3x3 Board */}
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={cell !== null || winner !== null}
                className={`
                  rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition border-2 shadow-sm
                  ${isWinningCell ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-105' : 'bg-white border-black text-black hover:bg-gray-50'}
                  ${cell === 'X' ? 'text-blue-600' : cell === 'O' ? 'text-purple-600' : ''}
                `}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game State Banner & Reset */}
      <div className="text-center space-y-4">
        {winner && (
          <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-sm font-black text-xl text-black">
            {winner === 'Draw' ? "🤝 Game ended in a Draw!" : `🎉 Winner: ${winner === 'X' ? 'Player 1 (X)' : isAgainstAI ? 'AABHA AI (O)' : 'Player 2 (O)'}!`}
          </div>
        )}

        <button
          onClick={resetGame}
          className="px-6 py-3 bg-white border-2 border-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Round</span>
        </button>
      </div>
    </div>
  );
};
