import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RotateCw, Heart, CheckCircle2 } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface TruthOrDareProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const PROMPTS = {
  truth: [
    { en: 'What is your sweetest childhood memory?', hi: 'आपके बचपन की सबसे प्यारी याद क्या है?', mr: 'तुमच्या बालपणीची सर्वात गोड आठवण कोणती आहे?' },
    { en: 'Which family member makes you laugh the most?', hi: 'परिवार का कौन सा सदस्य आपको सबसे ज्यादा हंसाता है?', mr: 'कुटुंबातील कोणती व्यक्ती तुम्हाला सर्वात जास्त हसवते?' },
    { en: 'What is your favorite dish that you love to eat?', hi: 'आपका पसंदीदा खाना कौन सा है?', mr: 'तुमचा आवडता खाद्यपदार्थ कोणता आहे?' },
    { en: 'What was your favorite school subject?', hi: 'स्कूल में आपका पसंदीदा विषय कौन सा था?', mr: 'शाळेत तुमचा आवडता विषय कोणता होता?' },
    { en: 'Which place or temple is your favorite to visit?', hi: 'आपकी पसंदीदा घूमने की जगह या मंदिर कौन सा है?', mr: 'तुमचे आवडते फिरण्याचे ठिकाण किंवा मंदिर कोणते आहे?' },
  ],
  dare: [
    { en: 'Sing two lines of your favorite old song!', hi: 'अपने पसंदीदा पुराने गाने की 2 लाइनें गाकर सुनाइए!', mr: 'तुमच्या आवडत्या जुन्या गाण्याच्या २ ओळी गाऊन दाखवा!' },
    { en: 'Give a warm smile and compliment the person sitting with you.', hi: 'एक प्यारी सी मुस्कान दें और साथ बैठे व्यक्ति की तारीफ करें।', mr: 'एक गोड हसू द्या आणि सोबत बसलेल्या व्यक्तीचे कौतुक करा.' },
    { en: 'Tell a funny family joke or a witty saying.', hi: 'एक मजेदार चुटकुला या मुहावरा सुनाइए।', mr: 'एक मजेदार विनोद किंवा छान म्हण सांगा.' },
    { en: 'Do 3 gentle arm stretches together!', hi: 'साथ में 3 बार धीरे-धीरे हाथ स्ट्रेच करें!', mr: 'दोघांनी मिळून ३ वेळा हात हळूवार स्ट्रेच करा!' },
    { en: 'Show how you used to greet elders with full respect.', hi: 'दिखाइए कि आप पहले बड़ों को कैसे आदर से प्रणाम करते थे।', mr: 'तुम्ही पूर्वी मोठ्यांना आदरपूर्वक कसे नमस्कार करत होतात ते दाखवा.' },
  ]
};

export const TruthOrDare: React.FC<TruthOrDareProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi' | 'mr';

  const [activeType, setActiveType] = useState<'truth' | 'dare' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [playerTurn, setPlayerTurn] = useState<number>(1);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const handlePick = (type: 'truth' | 'dare') => {
    setActiveType(type);
    const list = PROMPTS[type];
    const item = list[Math.floor(Math.random() * list.length)];
    setCurrentPrompt(item[lang] || item.en);
  };

  const handleCompletePrompt = () => {
    setCompletedCount(c => c + 1);
    setPlayerTurn(p => (p === 1 ? 2 : 1));
    setActiveType(null);
    setCurrentPrompt('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>😂</span> Truth or Dare Duo
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Wholesome, heartwarming fun questions and challenges for family!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Completed: {completedCount} rounds
        </div>
      </div>

      {/* Current Player Indicator */}
      <div className="p-4 bg-white border-2 border-black rounded-2xl text-center shadow-sm">
        <span className="text-xs font-black uppercase text-gray-500">Current Turn:</span>
        <h3 className="text-2xl font-black text-black mt-0.5">
          Player {playerTurn}'s Choice!
        </h3>
      </div>

      {!activeType ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handlePick('truth')}
            className="p-8 rounded-3xl border-2 border-blue-500 bg-white hover:bg-blue-50 transition active:scale-95 shadow-md flex flex-col items-center justify-center gap-3 text-center"
          >
            <span className="text-5xl">💙</span>
            <div>
              <h4 className="text-2xl font-black text-blue-900">TRUTH (सच)</h4>
              <p className="text-xs font-bold text-gray-600 mt-1">Answer a sweet memory question</p>
            </div>
          </button>

          <button
            onClick={() => handlePick('dare')}
            className="p-8 rounded-3xl border-2 border-amber-500 bg-white hover:bg-amber-50 transition active:scale-95 shadow-md flex flex-col items-center justify-center gap-3 text-center"
          >
            <span className="text-5xl">⭐</span>
            <div>
              <h4 className="text-2xl font-black text-amber-900">DARE (हौसला)</h4>
              <p className="text-xs font-bold text-gray-600 mt-1">Do a fun, gentle challenge or song</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-3xl border-2 border-black bg-white text-center space-y-6 shadow-md animate-scale-up">
          <span className="px-4 py-1 rounded-full border border-black bg-gray-50 text-xs font-black uppercase tracking-wider text-black">
            {activeType === 'truth' ? '💙 Truth Question' : '⭐ Dare Challenge'}
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-black leading-relaxed max-w-2xl mx-auto">
            “{currentPrompt}”
          </h3>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleCompletePrompt}
              className="px-6 py-3.5 bg-white border-2 border-black text-black font-black text-base rounded-2xl hover:bg-gray-50 flex items-center gap-2 shadow"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Done! Next Player's Turn</span>
            </button>

            <button
              onClick={() => handlePick(activeType)}
              className="px-5 py-3.5 bg-white border-2 border-gray-300 hover:border-black text-black font-black text-sm rounded-2xl flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>New Prompt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
