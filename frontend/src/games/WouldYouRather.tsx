import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, Heart, Users } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface WouldYouRatherProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const QUESTIONS = [
  {
    opt1: { en: 'A morning walk in a quiet garden', hi: 'सुबह शांत बगीचे में सैर करना', mr: 'सकाळी शांत बागेत फिरायला जाणे', emoji: '🌳' },
    opt2: { en: 'An evening tea on a breezy balcony', hi: 'शाम को बालकनी में गरमा-गरम चाय पीना', mr: 'संध्याकाळी बाल्कनीत गरमागरम चहा पिणे', emoji: '☕' },
  },
  {
    opt1: { en: 'Listen to classic golden melody songs', hi: 'पुराने सदाबहार गाने सुनना', mr: 'जुनी सुमधुर गाणी ऐकणे', emoji: '🎵' },
    opt2: { en: 'Look through old family photo albums', hi: 'परिवार के पुराने फोटो एल्बम देखना', mr: 'कुटुंबाचे जुने फोटो अल्बम पाहणे', emoji: '📸' },
  },
  {
    opt1: { en: 'A peaceful trip to a sacred temple', hi: 'किसी सुंदर पवित्र मंदिर की यात्रा', mr: 'एखाद्या सुंदर पवित्र मंदिराची यात्रा', emoji: '🛕' },
    opt2: { en: 'A visit to a lush green hill station', hi: 'हरे-भरे पहाड़ों और हिल स्टेशन की सैर', mr: 'हिरवेगार डोंगर आणि थंड हवेच्या ठिकाणी फिरणे', emoji: '⛰️' },
  },
  {
    opt1: { en: 'Hot Gulab Jamun with Rabri', hi: 'रबड़ी के साथ गरमा-गरम गुलाब जामुन', mr: 'गरमागरम गुलाबजाम आणि बासुंदी', emoji: '🍮' },
    opt2: { en: 'Crispy hot Samosa with Mint Chutney', hi: 'पुदीने की चटनी के साथ कुरकुरा समोसा', mr: 'पुदिन्याच्या चटणीसोबत गरमागरम समोसा', emoji: '🥟' },
  },
  {
    opt1: { en: 'Cooking favorite meal with loved ones', hi: 'अपनों के साथ मिलकर पसंदीदा खाना बनाना', mr: 'आपल्या माणसांसोबत मिळून आवडता स्वयंपाक करणे', emoji: '🍳' },
    opt2: { en: 'Enjoying a grand royal dinner together', hi: 'साथ में शाही दावत का आनंद लेना', mr: 'सगळ्यांसोबत मिळून छान शाही जेवणाचा आनंद घेणे', emoji: '🍲' },
  }
];

export const WouldYouRather: React.FC<WouldYouRatherProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi' | 'mr';

  const [qIndex, setQIndex] = useState(0);
  const [p1Choice, setP1Choice] = useState<1 | 2 | null>(null);
  const [p2Choice, setP2Choice] = useState<1 | 2 | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const currentQ = QUESTIONS[qIndex];

  const handleP1Select = (choice: 1 | 2) => {
    setP1Choice(choice);
    // AI simulation choice
    const aiChoice = Math.random() > 0.4 ? choice : (choice === 1 ? 2 : 1);
    setP2Choice(aiChoice);
    setShowMatch(true);
  };

  const handleNext = () => {
    setShowMatch(false);
    setP1Choice(null);
    setP2Choice(null);
    setQIndex(i => (i + 1) % QUESTIONS.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🔥</span> Would You Rather? (आप क्या चुनेंगे?)
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Pick your favorite option and see if your choices match!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Card {qIndex + 1} of {QUESTIONS.length}
        </div>
      </div>

      {/* Choice Arena */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1 */}
        <button
          onClick={() => !showMatch && handleP1Select(1)}
          disabled={showMatch}
          className={`p-6 sm:p-8 rounded-3xl border-2 transition text-left flex flex-col justify-between min-h-[220px] shadow-sm ${
            p1Choice === 1 
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
              : 'bg-white border-black hover:bg-gray-50'
          }`}
        >
          <div className="text-5xl mb-4">{currentQ.opt1.emoji}</div>
          <div>
            <span className="text-xs font-black uppercase text-gray-500">Option 1</span>
            <h3 className="text-xl sm:text-2xl font-black text-black mt-1">
              {currentQ.opt1[lang] || currentQ.opt1.en}
            </h3>
          </div>
          {p1Choice === 1 && (
            <span className="mt-4 text-xs font-black text-blue-700 uppercase">✓ Selected by You</span>
          )}
        </button>

        {/* Option 2 */}
        <button
          onClick={() => !showMatch && handleP1Select(2)}
          disabled={showMatch}
          className={`p-6 sm:p-8 rounded-3xl border-2 transition text-left flex flex-col justify-between min-h-[220px] shadow-sm ${
            p1Choice === 2 
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' 
              : 'bg-white border-black hover:bg-gray-50'
          }`}
        >
          <div className="text-5xl mb-4">{currentQ.opt2.emoji}</div>
          <div>
            <span className="text-xs font-black uppercase text-gray-500">Option 2</span>
            <h3 className="text-xl sm:text-2xl font-black text-black mt-1">
              {currentQ.opt2[lang] || currentQ.opt2.en}
            </h3>
          </div>
          {p1Choice === 2 && (
            <span className="mt-4 text-xs font-black text-purple-700 uppercase">✓ Selected by You</span>
          )}
        </button>
      </div>

      {showMatch && (
        <div className="p-6 bg-white border-2 border-black rounded-3xl text-center space-y-4 shadow-md animate-scale-up">
          <div className="text-4xl">
            {p1Choice === p2Choice ? '💖' : '✨'}
          </div>
          <h3 className="text-2xl font-black text-black">
            {p1Choice === p2Choice 
              ? '🎉 100% Match! You both chose the same thing!' 
              : '🌟 Great Choices! Variety makes conversations fun!'}
          </h3>
          <p className="text-sm font-bold text-gray-700">
            AABHA AI chose: Option {p2Choice} ({p2Choice === 1 ? currentQ.opt1[lang] : currentQ.opt2[lang]})
          </p>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white border-2 border-black text-black font-black rounded-2xl hover:bg-gray-50 shadow inline-flex items-center gap-2"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
