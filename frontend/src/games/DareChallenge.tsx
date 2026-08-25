import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RotateCw, CheckCircle2, Flame, Smile } from 'lucide-react';
import { GameCompleteParams } from './MemoryMatch';

interface DareChallengeProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

const DARES = [
  {
    emoji: '😄',
    title: { en: 'Laughter Therapy', hi: 'हंसी थेरेपी', mr: 'हास्य थेरपी' },
    desc: {
      en: 'Laugh out loud together for 5 full seconds! “Ha Ha Ha!”',
      hi: 'साथ मिलकर 5 सेकंड तक जोर से हंसिए! “हा हा हा!”',
      mr: 'दोघांनी मिळून ५ सेकंद मनापासून मोठमोठ्याने हसा! “हा हा हा!”'
    }
  },
  {
    emoji: '👏',
    title: { en: 'Rhythmic Clapping', hi: 'ताली की थाप', mr: 'टाळ्यांची लय' },
    desc: {
      en: 'Clap together in a 1-2-3 rhythm 5 times in a row!',
      hi: 'साथ मिलकर 1-2-3 की लय में 5 बार तालियां बजाइए!',
      mr: '१-२-३ च्या लयीत ५ वेळा एकत्र टाळ्या वाजवा!'
    }
  },
  {
    emoji: '🦜',
    title: { en: 'Bird Chirp Sound', hi: 'चिड़िया की बोली', mr: 'पक्ष्यांचा गोड आवाज' },
    desc: {
      en: 'Imitate the sweet sound of a cuckoo (Kuhu Kuhu) or sparrow (Chee Chee)!',
      hi: 'कोयल (कुहू कुहू) या गौरैया (चीं चीं) की मीठी आवाज निकालकर दिखाइए!',
      mr: 'कोकिळेचा (कुहू कुहू) किंवा चिमणीचा (चिव चिव) गोड आवाज काढून दाखवा!'
    }
  },
  {
    emoji: '🙌',
    title: { en: 'Double High-Five', hi: 'डबल हाई-फाइव', mr: 'डबल हाय-फाय' },
    desc: {
      en: 'Give a joyful double high-five to your partner!',
      hi: 'अपने साथी या परिवार वाले को दोनों हाथों से खुशी भरा हाई-फाइव दीजिए!',
      mr: 'तुमच्या साथीदाराला दोन्ही हातांनी छान हाय-फाय द्या!'
    }
  },
  {
    emoji: '🧘',
    title: { en: 'Deep Peace Breath', hi: 'गहरी शांति की सांस', mr: 'शांत दीर्घ श्वास' },
    desc: {
      en: 'Close eyes, breathe in deeply for 4 seconds, and gently breathe out together.',
      hi: 'आंखें बंद करके 4 सेकंड तक गहरी सांस लें और धीरे-धीरे छोड़ें।',
      mr: 'डोळे मिटून ४ सेकंद दीर्घ श्वास घ्या आणि हळूच सोडा.'
    }
  }
];

export const DareChallenge: React.FC<DareChallengeProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi' | 'mr';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedDares, setCompletedDares] = useState(0);

  const currentDare = DARES[currentIdx];

  const handleNextDare = () => {
    setCompletedDares(c => c + 1);
    setCurrentIdx(i => (i + 1) % DARES.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-3xl border-2 border-black shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>😈</span> Dare & Fun Duo Challenge
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 font-bold">
            Delightful, cheerful challenges to bring smiles and laughter together!
          </p>
        </div>

        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl font-black text-sm">
          Completed: {completedDares} Dares
        </div>
      </div>

      {/* Challenge Display Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-black text-center space-y-6 shadow-sm">
        <div className="text-6xl sm:text-7xl animate-bounce">
          {currentDare.emoji}
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            Dare Activity #{currentIdx + 1}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-black mt-1">
            {currentDare.title[lang] || currentDare.title.en}
          </h3>
        </div>

        <p className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed max-w-xl mx-auto">
          “{currentDare.desc[lang] || currentDare.desc.en}”
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={handleNextDare}
            className="px-8 py-4 bg-white border-2 border-black text-black font-black text-base rounded-2xl hover:bg-gray-50 flex items-center gap-2 shadow"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Challenge Done! Next Dare</span>
          </button>
        </div>
      </div>
    </div>
  );
};
