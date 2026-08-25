import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, Users, RefreshCw } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';
import { api } from '../services/api';

interface QuizBattleProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface Question {
  id: string | number;
  question: { en: string; hi: string; mr: string };
  options: { en: string[]; hi: string[]; mr: string[] };
  correctIndex: number;
}

const FALLBACK_QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: {
      en: 'Which organ is primarily responsible for pumping blood throughout the body?',
      hi: 'मानव शरीर में रक्त कौन सा अंग पंप करता है?',
      mr: 'मानवी शरीरात रक्त कोणते अवयव पंप करते?'
    },
    options: {
      en: ['Lungs', 'Brain', 'Heart (हृदय)', 'Kidney'],
      hi: ['फेफड़े', 'दिमाग', 'हृदय (Heart)', 'किडनी'],
      mr: ['फुफ्फुस', 'मेंदू', 'हृदय (Heart)', 'मूत्रपिंड']
    },
    correctIndex: 2
  },
  {
    id: 2,
    question: {
      en: 'Which vitamin is naturally synthesized by the human body when exposed to sunlight?',
      hi: 'धूप से शरीर में कौन सा विटामिन बनता है?',
      mr: 'सूर्यप्रकाशामुळे शरीरात कोणते जीवनसत्व तयार होते?'
    },
    options: {
      en: ['Vitamin A', 'Vitamin B12', 'Vitamin D', 'Vitamin C'],
      hi: ['विटामिन A', 'विटामिन B12', 'विटामिन D (धूप)', 'विटामिन C'],
      mr: ['व्हिटॅमिन A', 'व्हिटॅमिन B12', 'व्हिटॅमिन D (सूर्य)', 'व्हिटॅमिन C']
    },
    correctIndex: 2
  },
  {
    id: 3,
    question: {
      en: 'What is considered the normal human body temperature in Fahrenheit?',
      hi: 'मानव शरीर का सामान्य तापमान कितना होता है?',
      mr: 'मानवी शरीराचे सामान्य तापमान किती असते?'
    },
    options: {
      en: ['95.4°F', '98.6°F', '101.2°F', '104.0°F'],
      hi: ['95.4°F', '98.6°F (सामान्य)', '101.2°F', '104.0°F'],
      mr: ['95.4°F', '98.6°F (सामान्य)', '101.2°F', '104.0°F']
    },
    correctIndex: 1
  },
  {
    id: 4,
    question: {
      en: 'Which golden spice has anti-inflammatory properties widely celebrated in Ayurveda?',
      hi: 'हल्दी (Turmeric) में कौन सा औषधीय गुण होता है?',
      mr: 'हळदीमध्ये कोणता औषधी गुणधर्म असतो?'
    },
    options: {
      en: ['Curcumin (Turmeric)', 'Cumin', 'Cardamom', 'Clove'],
      hi: ['हल्दी (Turmeric)', 'जीरा', 'इलायची', 'लौंग'],
      mr: ['हळद (Turmeric)', 'जिरे', 'वेलची', 'लवंग']
    },
    correctIndex: 0
  },
  {
    id: 5,
    question: {
      en: 'Which practice combines breathing control, gentle stretches, and mindfulness?',
      hi: 'सांस और शारीरिक व्यायाम का प्राचीन अभ्यास कौन सा है?',
      mr: 'श्वास आणि सौम्य हालचालींचा प्राचीन सराव कोणता आहे?'
    },
    options: {
      en: ['Aerobics', 'Yoga & Pranayama', 'Heavy Lifting', 'Fast Sprinting'],
      hi: ['एरोबिक्स', 'योग और प्राणायाम (Yoga)', 'भारी वजन', 'दौड़ना'],
      mr: ['एरोबिक्स', 'योग आणि प्राणायाम (Yoga)', 'जड वजन', 'धावणे']
    },
    correctIndex: 1
  }
];

export const QuizBattle: React.FC<QuizBattleProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi' | 'mr';

  const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUIZ_QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [answeredBy, setAnsweredBy] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAgainstAI, setIsAgainstAI] = useState(true);

  // Fetch dynamic non-repeating questions from backend
  useEffect(() => {
    api.get('/games/quiz-battle/content?limit=5')
      .then((res: any) => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          const mapped: Question[] = res.content.map((c: any) => ({
            id: c.id,
            question: {
              en: c.question,
              hi: c.question,
              mr: c.question
            },
            options: {
              en: c.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              hi: c.options || ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'],
              mr: c.options || ['पर्याय A', 'पर्याय B', 'पर्याय C', 'पर्याय D']
            },
            correctIndex: typeof c.answer === 'number' ? c.answer : 0
          }));
          setQuestions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const currentQ = questions[currentQIndex] || questions[0];

  const handleAnswer = (player: 'P1' | 'P2', optionIdx: number) => {
    if (answeredBy !== null) return;

    setAnsweredBy(player);
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === currentQ.correctIndex;
    if (isCorrect) {
      if (player === 'P1') setP1Score(s => s + 100);
      else setP2Score(s => s + 100);
    }

    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(i => i + 1);
        setAnsweredBy(null);
        setSelectedOption(null);
      } else {
        setIsGameOver(true);
        onComplete({
          score: p1Score + (isCorrect && player === 'P1' ? 100 : 0),
          maxScore: questions.length * 100,
          accuracy: Math.round(((p1Score + (isCorrect && player === 'P1' ? 100 : 0)) / (questions.length * 100)) * 100),
          timeTaken: 45
        });
      }
    }, 1400);
  };

  // AI response simulation when isAgainstAI is true
  useEffect(() => {
    let timer: any = null;
    if (isAgainstAI && answeredBy === null && !isGameOver && currentQ) {
      const aiDelay = Math.random() * 2000 + 1500;
      timer = setTimeout(() => {
        if (answeredBy === null) {
          const aiCorrect = Math.random() > 0.35;
          const aiChoice = aiCorrect
            ? currentQ.correctIndex
            : (currentQ.correctIndex + 1) % 4;
          handleAnswer('P2', aiChoice);
        }
      }, aiDelay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAgainstAI, answeredBy, isGameOver, currentQIndex, currentQ]);

  const handleRestart = () => {
    setCurrentQIndex(0);
    setP1Score(0);
    setP2Score(0);
    setAnsweredBy(null);
    setSelectedOption(null);
    setIsGameOver(false);
  };

  if (!currentQ) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans">
      {/* Top Controls & Mode Switch */}
      <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-black text-sm text-black">
            Question {currentQIndex + 1} of {questions.length}
          </span>
        </div>

        <button
          onClick={() => setIsAgainstAI(!isAgainstAI)}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-black rounded-xl text-xs font-black flex items-center gap-1.5 transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isAgainstAI ? 'Mode: vs ABHA AI 🤖' : 'Mode: 2-Player Local 👥'}</span>
        </button>
      </div>

      {/* Main Battle Arena */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl space-y-6">
        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-4 border-b-2 border-gray-100 pb-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center">
            <div className="text-xs font-black uppercase text-emerald-950">You (Player 1)</div>
            <div className="text-3xl font-black text-emerald-950 mt-0.5">{p1Score} Pts</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-400 text-center">
            <div className="text-xs font-black uppercase text-indigo-950">
              {isAgainstAI ? 'ABHA AI 🤖' : 'Player 2'}
            </div>
            <div className="text-3xl font-black text-indigo-950 mt-0.5">{p2Score} Pts</div>
          </div>
        </div>

        {/* Question Text */}
        <div className="py-4 text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-black leading-snug">
            {currentQ.question[lang] || currentQ.question.en}
          </h2>
          <p className="text-xs text-gray-500 font-bold">
            Tap the correct answer before your opponent!
          </p>
        </div>

        {/* 4 Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(currentQ.options[lang] || currentQ.options.en).map((opt, idx) => {
            const isChosen = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let btnStyle = 'bg-white hover:bg-gray-50 border-black text-black';
            if (answeredBy !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black animate-pulse';
              } else if (isChosen && !isCorrect) {
                btnStyle = 'bg-red-500 border-red-600 text-white font-black';
              } else {
                btnStyle = 'bg-gray-100 border-gray-300 text-gray-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={answeredBy !== null}
                onClick={() => handleAnswer('P1', idx)}
                className={`p-4 rounded-2xl border-2 text-left font-black text-sm transition-all shadow-xs flex items-center justify-between cursor-pointer active:scale-95 ${btnStyle}`}
              >
                <span>{opt}</span>
                {answeredBy !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                {answeredBy !== null && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Live Feedback Toast */}
        {answeredBy !== null && (
          <div className="text-center py-2 animate-fade-in">
            <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-black">
              {answeredBy === 'P1' ? '⚡ You tapped first!' : '🤖 ABHA AI answered!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBattle;
