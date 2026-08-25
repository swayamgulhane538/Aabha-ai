import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Eraser, RotateCcw, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface DrawAndGuessProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const DRAW_WORDS = [
  { word: 'Apple', hi: 'सेब', mr: 'सफरचंद', hint: 'A red fruit you eat' },
  { word: 'House', hi: 'घर', mr: 'घर', hint: 'A place where a family lives' },
  { word: 'Tree', hi: 'पेड़', mr: 'झाड', hint: 'It has green leaves and brown trunk' },
  { word: 'Sun', hi: 'सूरज', mr: 'सूर्य', hint: 'Shines bright in the sky during day' },
  { word: 'Car', hi: 'गाड़ी', mr: 'गाडी', hint: 'Vehicle with four wheels' },
  { word: 'Cat', hi: 'बिल्ली', mr: 'मांजर', hint: 'Meows and likes milk' },
  { word: 'Flower', hi: 'फूल', mr: 'फूल', hint: 'Grows in gardens, smells nice' }
];

export const DrawAndGuess: React.FC<DrawAndGuessProps> = ({ difficulty, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentItem = DRAW_WORDS[currentWordIdx];

  useEffect(() => {
    clearCanvas();
    setIsCorrect(false);
    setShowHint(false);
    setGuessInput('');
  }, [currentWordIdx]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = guessInput.trim().toLowerCase();
    const targetEn = currentItem.word.toLowerCase();
    const targetHi = currentItem.hi.toLowerCase();
    const targetMr = currentItem.mr.toLowerCase();

    if (cleaned === targetEn || cleaned === targetHi || cleaned === targetMr) {
      setIsCorrect(true);
      setScore(s => s + 100);
      setTimeout(() => {
        if (currentWordIdx + 1 < DRAW_WORDS.length) {
          setCurrentWordIdx(i => i + 1);
        }
      }, 2000);
    } else {
      setGuessInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>✏️</span> Draw & Guess Duo
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Draw the secret word on the canvas and guess what it is!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-base">
          Score: {score} pts
        </div>
      </div>

      {/* Secret Word Prompt Box */}
      <div className="p-4 sm:p-6 bg-white border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-gray-500">Secret Word to Draw:</span>
          <div className="text-2xl sm:text-3xl font-black text-black flex items-center gap-3 mt-1">
            <span>{currentItem.word}</span>
            <span className="text-base text-gray-600 font-bold">({currentItem.hi} / {currentItem.mr})</span>
          </div>
        </div>

        <button
          onClick={() => setShowHint(!showHint)}
          className="px-3.5 py-2 bg-white border-2 border-black rounded-xl text-xs font-black hover:bg-gray-50 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{showHint ? currentItem.hint : 'Show Clue Hint'}</span>
        </button>
      </div>

      {/* Canvas Area */}
      <div className="border-2 border-black rounded-3xl bg-white p-3 shadow-sm flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-64 sm:h-80 bg-white border border-gray-200 rounded-2xl cursor-crosshair touch-none"
        />

        {/* Toolbar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {['#000000', '#2563eb', '#dc2626', '#16a34a', '#d97706'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition ${color === c ? 'border-black scale-110 shadow' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              onClick={() => setColor('#ffffff')}
              className={`p-1.5 rounded-lg border-2 text-xs font-bold flex items-center gap-1 ${color === '#ffffff' ? 'border-black bg-gray-100' : 'border-gray-300'}`}
            >
              <Eraser className="w-4 h-4" /> Eraser
            </button>
          </div>

          <button
            onClick={clearCanvas}
            className="px-3.5 py-1.5 bg-white border-2 border-gray-300 hover:border-black rounded-xl text-xs font-black flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Clear Canvas
          </button>
        </div>
      </div>

      {/* Guess Input Area */}
      <div className="p-6 bg-white border-2 border-black rounded-3xl shadow-sm space-y-4">
        <h3 className="text-lg font-black text-black">
          Guess the Drawing (अंदाज लावा / पहचानें):
        </h3>

        {isCorrect ? (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center text-emerald-900 font-black text-xl animate-bounce">
            🎉 Correct! You guessed "{currentItem.word}"! (+100 pts)
          </div>
        ) : (
          <form onSubmit={handleGuessSubmit} className="flex gap-2.5">
            <input
              type="text"
              placeholder="Type your guess here..."
              value={guessInput}
              onChange={e => setGuessInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-black bg-white text-black font-bold focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white border-2 border-black text-black font-black rounded-2xl hover:bg-gray-50 shadow"
            >
              Submit Guess
            </button>
          </form>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs font-bold text-gray-500 self-center">Suggested words:</span>
          {['Apple', 'Cat', 'House', 'Tree', 'Sun', 'Car', 'Flower'].map(w => (
            <button
              key={w}
              onClick={() => setGuessInput(w)}
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold hover:border-black"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
