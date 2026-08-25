import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Play, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface GuessTheSongProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface SongItem {
  id: number;
  title: { en: string; hi: string; mr: string };
  melody: number[]; // Frequencies in Hz
  options: { en: string[]; hi: string[]; mr: string[] };
  correctIndex: number;
}

const SONGS: SongItem[] = [
  {
    id: 1,
    title: { en: 'Saare Jahan Se Achha', hi: 'सारे जहाँ से अच्छा', mr: 'सारे जहाँ से अच्छा' },
    melody: [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63],
    options: {
      en: ['Saare Jahan Se Achha', 'Vande Mataram', 'Jana Gana Mana', 'Ae Mere Watan'],
      hi: ['सारे जहाँ से अच्छा', 'वन्दे मातरम', 'जन गण मन', 'ऐ मेरे वतन के लोगों'],
      mr: ['सारे जहाँ से अच्छा', 'वंदे मातरम', 'जन गण मन', 'ऐ मेरे वतन के लोगों']
    },
    correctIndex: 0
  },
  {
    id: 2,
    title: { en: 'Twinkle Twinkle Little Star', hi: 'ट्विंकल ट्विंकल लिटिल स्टार', mr: 'चांदोबा चांदोबा भागलास का' },
    melody: [261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00],
    options: {
      en: ['Twinkle Twinkle Little Star', 'Happy Birthday', 'Jingle Bells', 'Old MacDonald'],
      hi: ['ट्विंकल ट्विंकल लिटिल स्टार', 'हैप्पी बर्थडे', 'जिंगल बेल्स', 'लकड़ी की काठी'],
      mr: ['चांदोबा चांदोबा भागलास का', 'ट्विंकल ट्विंकल', 'गोरी गोरी पान', 'सांग सांग भोलानाथ']
    },
    correctIndex: 0
  },
  {
    id: 3,
    title: { en: 'Om Jai Jagdish Hare (Aarti)', hi: 'ओम जय जगदीश हरे (आरती)', mr: 'सुखकर्ता दुखहर्ता (आरती)' },
    melody: [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63],
    options: {
      en: ['Om Jai Jagdish Hare', 'Gayatri Mantra', 'Hanuman Chalisa', 'Raghupati Raghav'],
      hi: ['ओम जय जगदीश हरे', 'गायत्री मंत्र', 'हनुमान चालीसा', 'रघुपति राघव राजा राम'],
      mr: ['सुखकर्ता दुखहर्ता', 'ओम जय जगदीश हरे', 'दुर्गे दुर्घट भारी', 'घालीन लोटांगण']
    },
    correctIndex: 0
  }
];

export const GuessTheSong: React.FC<GuessTheSongProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi' | 'mr';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentSong = SONGS[currentIdx];

  const playTune = () => {
    if (isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      setIsPlaying(true);

      let time = ctx.currentTime + 0.1;
      currentSong.melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.45);

        time += 0.45;
      });

      setTimeout(() => {
        setIsPlaying(false);
      }, currentSong.melody.length * 450 + 200);
    } catch (e) {
      console.warn('Audio Context error:', e);
      setIsPlaying(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    if (idx === currentSong.correctIndex) {
      setScore(s => s + 100);
    }

    setTimeout(() => {
      if (currentIdx + 1 < SONGS.length) {
        setCurrentIdx(i => i + 1);
        setSelectedOption(null);
      } else {
        setIsGameOver(true);
      }
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🎵</span> Guess the Song / Melody
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Listen to the musical notes and identify the famous tune!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Score: {score} pts
        </div>
      </div>

      {/* Audio Play Center */}
      <div className="p-8 rounded-3xl bg-white border-2 border-black shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <button
          onClick={playTune}
          disabled={isPlaying}
          className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition shadow-lg ${
            isPlaying 
              ? 'bg-amber-100 border-amber-500 animate-pulse' 
              : 'bg-white border-black hover:bg-gray-50'
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-10 h-10 text-amber-600 animate-bounce" />
          ) : (
            <Play className="w-10 h-10 text-black ml-1" />
          )}
        </button>

        <div>
          <h3 className="text-xl font-black text-black">
            {isPlaying ? '🎶 Playing Melodic Notes...' : 'Click to Play Song Tune'}
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Question {currentIdx + 1} of {SONGS.length}
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentSong.options[lang].map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentSong.correctIndex;
          let btnStyle = 'bg-white border-2 border-black text-black hover:bg-gray-50';

          if (selectedOption !== null) {
            if (isCorrect) btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900';
            else if (isSelected && !isCorrect) btnStyle = 'bg-red-50 border-2 border-red-500 text-red-900';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedOption !== null}
              className={`p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg text-left transition flex items-center justify-between shadow-sm ${btnStyle}`}
            >
              <span>{opt}</span>
              {selectedOption !== null && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
            </button>
          );
        })}
      </div>

      {isGameOver && (
        <div className="p-8 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-lg">
          <div className="text-5xl">🏆</div>
          <h3 className="text-3xl font-black text-black">
            🎉 Music Quiz Completed! Score: {score} pts!
          </h3>
          <button
            onClick={() => {
              setCurrentIdx(0);
              setScore(0);
              setSelectedOption(null);
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
