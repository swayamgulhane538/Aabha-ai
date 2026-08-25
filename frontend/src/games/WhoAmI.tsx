import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Lightbulb } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface WhoAmIProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const CHARACTERS = [
  {
    name: 'Mahatma Gandhi',
    hi: 'महात्मा गांधी',
    mr: 'महात्मा गांधी',
    emoji: '👓',
    clues: [
      { q: 'Is this person known as the Father of the Nation?', a: true },
      { q: 'Did they lead the Dandi March with Ahimsa (Non-violence)?', a: true },
      { q: 'Were they a famous cricket player?', a: false },
    ]
  },
  {
    name: 'Chhatrapati Shivaji Maharaj',
    hi: 'छत्रपति शिवाजी महाराज',
    mr: 'छत्रपती शिवाजी महाराज',
    emoji: '🚩',
    clues: [
      { q: 'Is this legendary king famous for founding Swarajya in Maharashtra?', a: true },
      { q: 'Are they celebrated for bravery and forts across the Sahyadris?', a: true },
      { q: 'Were they an astronaut in space?', a: false },
    ]
  },
  {
    name: 'Lata Mangeshkar',
    hi: 'लता मंगेशकर',
    mr: 'लता मंगेशकर',
    emoji: '🎤',
    clues: [
      { q: 'Is this legend known as the Nightingale of India (स्वर कोकिला)?', a: true },
      { q: 'Did they sing thousands of iconic songs in Hindi and Marathi?', a: true },
      { q: 'Did they play football in the world cup?', a: false },
    ]
  },
  {
    name: 'Sachin Tendulkar',
    hi: 'सचिन तेंदुलकर',
    mr: 'सचिन तेंडुलकर',
    emoji: '🏏',
    clues: [
      { q: 'Is this sports legend known as the God of Cricket?', a: true },
      { q: 'Did they score 100 international centuries for India?', a: true },
      { q: 'Were they a classical movie director?', a: false },
    ]
  }
];

export const WhoAmI: React.FC<WhoAmIProps> = ({ difficulty, onComplete }) => {
  const [charIdx, setCharIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState<number[]>([0]);
  const [guessInput, setGuessInput] = useState('');
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);

  const currentChar = CHARACTERS[charIdx];

  const handleRevealClue = () => {
    if (revealedClues.length < currentChar.clues.length) {
      setRevealedClues(prev => [...prev, prev.length]);
    }
  };

  const handleGuess = (name: string) => {
    if (name.toLowerCase() === currentChar.name.toLowerCase()) {
      setIsWon(true);
      setScore(s => s + 100);
      setTimeout(() => {
        if (charIdx + 1 < CHARACTERS.length) {
          setCharIdx(i => i + 1);
          setRevealedClues([0]);
          setIsWon(false);
          setGuessInput('');
        }
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🕵️</span> Who Am I? (पहचानिए कौन?)
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Read the clues and guess the famous personality!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Score: {score} pts
        </div>
      </div>

      {/* Secret Personality Box */}
      <div className="p-8 rounded-3xl bg-white border-2 border-black shadow-sm text-center space-y-4">
        <div className="text-6xl animate-bounce">
          {isWon ? currentChar.emoji : '❓'}
        </div>
        <h3 className="text-2xl font-black text-black">
          {isWon ? `🎉 It's ${currentChar.name}!` : 'Secret Historical / Cultural Personality'}
        </h3>
        <p className="text-xs text-gray-500 font-bold">
          Personality {charIdx + 1} of {CHARACTERS.length}
        </p>
      </div>

      {/* Clues Box */}
      <div className="p-6 bg-white border-2 border-black rounded-3xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-gray-500">Revealed Clues:</span>
          {revealedClues.length < currentChar.clues.length && (
            <button
              onClick={handleRevealClue}
              className="px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-black hover:bg-gray-50 flex items-center gap-1"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Unlock Next Clue</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {revealedClues.map(idx => {
            const clue = currentChar.clues[idx];
            return (
              <div key={idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-sm font-bold text-black">
                <span>{clue.q}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-black text-xs font-black">
                  {clue.a ? '✅ YES' : '❌ NO'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personality Choices */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-black">
          Who is this? (Select your guess):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHARACTERS.map(c => (
            <button
              key={c.name}
              onClick={() => handleGuess(c.name)}
              disabled={isWon}
              className="p-4 rounded-2xl border-2 border-black bg-white hover:bg-gray-50 text-left transition flex items-center justify-between shadow-sm"
            >
              <span className="font-black text-base text-black">{c.name} ({c.mr})</span>
              <span className="text-2xl">{c.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
