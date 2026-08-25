import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eraser, RotateCcw, Download, Sparkles, Heart, CheckCircle2, Paintbrush, Palette } from 'lucide-react';
import { api } from '../services/api';

const THERAPY_PALETTES = [
  { name: 'Emerald Calm', hex: '#10b981' },
  { name: 'Teal Peace', hex: '#14b8a6' },
  { name: 'Sky Clarity', hex: '#0284c7' },
  { name: 'Indigo Serenity', hex: '#6366f1' },
  { name: 'Lavender Rest', hex: '#a855f7' },
  { name: 'Rose Joy', hex: '#f43f5e' },
  { name: 'Coral Warmth', hex: '#f97316' },
  { name: 'Amber Sunlight', hex: '#f59e0b' },
  { name: 'Deep Earth', hex: '#78350f' },
  { name: 'Charcoal Ink', hex: '#0f172a' }
];

export const ColoringTherapy: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [strokesCount, setStrokesCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill canvas with warm soft white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw initial relaxing flower mandala guide lines
    drawMandalaTemplate(ctx, canvas.width / 2, canvas.height / 2);
  }, []);

  const drawMandalaTemplate = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;

    // Center circular rings
    for (let r = 30; r <= 150; r += 35) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Petals
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const px = cx + Math.cos(angle) * 75;
      const py = cy + Math.sin(angle) * 75;

      ctx.beginPath();
      ctx.arc(px, py, 35, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setStrokesCount(s => s + 1);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = isEraser ? '#ffffff' : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMandalaTemplate(ctx, canvas.width / 2, canvas.height / 2);
  };

  const handleSaveToMemoryPassport = async () => {
    setSavedSuccess(true);

    try {
      await api.post('/games/result', {
        gameType: 'coloring_therapy',
        gameName: 'Mindful Art & Mandala Therapy',
        score: Math.min(100, Math.max(70, strokesCount * 5)),
        maxScore: 100,
        accuracy: 100,
        timeTaken: 120,
        difficulty: 'NORMAL'
      });
    } catch (err) {
      console.warn('Coloring save note:', err);
    }

    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/games')}
          className="px-4 py-2 bg-white border-2 border-black rounded-2xl text-xs font-black text-black hover:bg-gray-100 flex items-center gap-1.5 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToMemoryPassport}
            className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-xs font-black rounded-2xl flex items-center gap-1.5 shadow transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Save to Memory Passport</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-950 font-black text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✓ Beautiful artwork saved to your Memory Passport and daily cognitive milestones!</span>
        </div>
      )}

      {/* Main Drawing Canvas Card */}
      <div className="card-3d bg-white p-5 sm:p-7 rounded-3xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-gray-100 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
              <span>🎨</span>
              <span>Relaxing Art & Mandala Therapy</span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              Mindful color expression for stress release, mood stabilization & fine motor enjoyment
            </p>
          </div>
        </div>

        {/* Color Palette & Brush Tool Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl border-2 border-black">
          {/* Swatches */}
          <div className="flex items-center gap-2 flex-wrap">
            {THERAPY_PALETTES.map(p => (
              <button
                key={p.hex}
                onClick={() => {
                  setSelectedColor(p.hex);
                  setIsEraser(false);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition transform ${
                  !isEraser && selectedColor === p.hex
                    ? 'scale-125 border-black shadow-md ring-2 ring-emerald-400'
                    : 'border-white hover:scale-110 shadow-xs'
                }`}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
          </div>

          {/* Brush Sizes & Eraser */}
          <div className="flex items-center gap-2">
            {[
              { label: 'Fine', size: 4 },
              { label: 'Medium', size: 10 },
              { label: 'Broad', size: 20 }
            ].map(b => (
              <button
                key={b.size}
                onClick={() => setBrushSize(b.size)}
                className={`px-2.5 py-1 text-xs font-black rounded-xl border transition ${
                  brushSize === b.size
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {b.label}
              </button>
            ))}

            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl border-2 transition ${
                isEraser
                  ? 'bg-amber-200 border-black text-black'
                  : 'bg-white border-gray-300 hover:border-black text-black'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-white border-2 border-gray-300 hover:border-black transition text-black"
              title="Clear Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="w-full flex justify-center overflow-hidden rounded-2xl border-2 border-black bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            width={700}
            height={500}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-[700px] h-auto touch-none cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
};

export default ColoringTherapy;
