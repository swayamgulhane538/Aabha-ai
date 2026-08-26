import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameCompleteParams } from './MemoryMatch';
import { CheckCircle2, Sparkles, HelpCircle, Trophy } from 'lucide-react';

interface FamiliarObjectProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface FamiliarItem {
  id: string;
  emoji: string;
  question: {
    en: string;
    hi: string;
    bn: string;
    as: string;
    mr: string;
  };
  options: {
    en: string[];
    hi: string[];
    bn: string[];
    as: string[];
    mr: string[];
  };
  correctIndex: number;
  hint: {
    en: string;
    hi: string;
    bn: string;
    as: string;
    mr: string;
  };
}

const ITEMS: FamiliarItem[] = [
  {
    id: '1',
    emoji: '🍵',
    question: {
      en: 'What everyday item is this, and what is it used for?',
      hi: 'यह कौन सी रोजमर्रा की वस्तु है और इसका क्या उपयोग है?',
      bn: 'এটি কোন দৈনন্দিন জিনিস এবং এটি কী কাজে ব্যবহৃত হয়?',
      as: 'এইটো কি বস্তু আৰু ইয়াৰ ব্যৱহাৰ কি?',
      mr: 'ही कोणती दैनंदिन वस्तू आहे आणि याचा काय उपयोग आहे?'
    },
    options: {
      en: ['Cup of Warm Tea / Beverage', 'Flower Vase', 'Candle Holder', 'Soup Spoon'],
      hi: ['गरम चाय का कप / पेय', 'फूलदान', 'मोमबत्ती स्टैंड', 'सूप चम्मच'],
      bn: ['গরম চায়ের কাপ', 'ফুলদানি', 'মোমবাতি ধারক', 'চামচ'],
      as: ['গৰম চাহৰ কাপ', 'ফুলদানী', 'মমবাতি ধাৰক', 'চামুচ'],
      mr: ['गरम चहाचा कप', 'फुलदाणी', 'मेणबत्ती स्टँড', 'चमचा']
    },
    correctIndex: 0,
    hint: {
      en: 'Used for morning tea or coffee with breakfast.',
      hi: 'सुबह के नाश्ते में चाय या कॉफी पीने के लिए उपयोग होता है।',
      bn: 'সকালের নাস্তায় চা পানের জন্য ব্যবহৃত হয়।',
      as: 'পুৱাৰ চাহ খোৱাৰ বাবে ব্যৱহাৰ কৰা হয়।',
      mr: 'सकाळच्या नाश्त्यात चहा पिण्यासाठी वापरले जाते.'
    }
  },
  {
    id: '2',
    emoji: '👓',
    question: {
      en: 'What are these spectacles used for?',
      hi: 'यह चश्मा किस काम के लिए उपयोग किया जाता है?',
      bn: 'এই চশমাটি কী কাজে ব্যবহৃত হয়?',
      as: 'এই চশমাযোৰ কি কামত ব্যৱহাৰ হয়?',
      mr: 'हा चष्मा कशासाठी वापरला जातो?'
    },
    options: {
      en: ['Listening to Radio', 'Reading Books & Clear Vision', 'Walking Aid', 'Wrist Watch'],
      hi: ['रेडियो सुनने के लिए', 'किताबें पढ़ने और स्पष्ट देखने के लिए', 'चलने के लिए', 'घड़ी देखने के लिए'],
      bn: ['রেডিও শোনার জন্য', 'বই পড়া ও স্পষ্ট দেখার জন্য', 'হাঁটার জন্য', 'ঘড়ি দেখার জন্য'],
      as: ['ৰেডিঅ’ শুনাৰ বাবে', 'কিতাপ পঢ়া আৰু স্পষ্ট দৃষ্টিৰ বাবে', 'খোজ কঢ়াৰ বাবে', 'ঘড়ী চাবলৈ'],
      mr: ['रेडिओ ऐकण्यासाठी', 'पुस्तके वाचणे व स्पष्ट दिसण्यासाठी', 'चालण्यासाठी', 'घड्याळ बघण्यासाठी']
    },
    correctIndex: 1,
    hint: {
      en: 'Helps eyes see text clearly when reading the morning newspaper.',
      hi: 'सुबह का अखबार पढ़ते समय आँखों को स्पष्ट देखने में मदद करता है।',
      bn: 'খবরের কাগজ পড়ার সময় স্পষ্ট দেখতে সাহায্য করে।',
      as: 'বাতৰি কাকত পঢ়াৰ সময়ত স্পষ্টকৈ চাবলৈ সহায় কৰে।',
      mr: 'वर्तमानपत्र वाचताना डोळ्यांना स्पष्ट दिसण्यास मदत करते.'
    }
  },
  {
    id: '3',
    emoji: '🔑',
    question: {
      en: 'What is this brass key used for?',
      hi: 'यह चाबी किस काम आती है?',
      bn: 'এই চাবিটি কী কাজে লাগে?',
      as: 'এই চাবিটো কি কামত লাগে?',
      mr: 'ही किल्ली कशासाठी वापरली जाते?'
    },
    options: {
      en: ['Unlocking House Door / Lock', 'Writing Notes', 'Stirring Milk', 'Lighting Stove'],
      hi: ['घर का ताला या दरवाजा खोलने के लिए', 'नोट्स लिखने के लिए', 'दूध मिलाने के लिए', 'चूल्हा जलाने के लिए'],
      bn: ['ঘরের তালা বা দরজা খোলার জন্য', 'নোট লেখার জন্য', 'দুধ মেশানোর জন্য', 'চুলা জ্বালানোর জন্য'],
      as: ['ঘৰৰ তলা বা দুৱাৰ খুলিবলৈ', 'লিখিবলৈ', 'গাখীৰ লৰাবলৈ', 'জুই ধৰিবলৈ'],
      mr: ['घराचे कुलूप किंवा दरवाजा उघडण्यासाठी', 'लिहिण्यासाठी', 'दूध ढवळण्यासाठी', 'चूल पेटवण्यासाठी']
    },
    correctIndex: 0,
    hint: {
      en: 'Used with a padlock to keep home safe and secure.',
      hi: 'घर को सुरक्षित रखने और ताला खोलने के लिए इस्तेमाल होता है।',
      bn: 'ঘর নিরাপদ রাখতে এবং তালা খুলতে ব্যবহৃত হয়।',
      as: 'ঘৰ সুৰক্ষিত ৰাখিবলৈ তলা খুলিবলৈ ব্যৱহাৰ হয়।',
      mr: 'घर सुरक्षित ठेवण्यासाठी व कुलूप उघडण्यासाठी वापरले जाते.'
    }
  },
  {
    id: '4',
    emoji: '⏰',
    question: {
      en: 'What does an alarm clock do in the morning?',
      hi: 'अलार्म घड़ी सुबह क्या करती है?',
      bn: 'অ্যালার্ম ঘড়ি সকালে কী করে?',
      as: 'এলার্ম ঘড়ীয়ে পুৱা কি কৰে?',
      mr: 'अलार्म घड्याळ सकाळी काय करते?'
    },
    options: {
      en: ['Rings Chime to Wake Up on Time', 'Boils Drinking Water', 'Cools Room Air', 'Washes Clothes'],
      hi: ['समय पर जगाने के लिए घंटी बजाती है', 'पीने का पानी उबालती है', 'कमरा ठंडा करती है', 'कपड़े धोती है'],
      bn: ['সময়মতো জাগানোর জন্য ঘণ্টা বাজায়', 'পানি ফুটায়', 'ঘর ঠান্ডা করে', 'কাপড় ধোয়'],
      as: ['সময়মতে সাৰ পাবলৈ ঘণ্টা বজায়', 'পানী গৰম কৰে', 'কোঠা ঠাণ্ডা কৰে', 'কাপোৰ ধোৱে'],
      mr: ['वेळेवर उठण्यासाठी बेल वाजवते', 'पाणी उकळते', 'खोली थंड करते', 'कपडे धुते']
    },
    correctIndex: 0,
    hint: {
      en: 'Tells the time and chimes for medicine and appointments.',
      hi: 'समय बताती है और दवाई लेने का समय याद दिलाती है।',
      bn: 'সময় জানায় এবং ওষুধের সময় মনে করিয়ে দেয়।',
      as: 'সময় দেখুৱায় আৰু ঔষধৰ সময় সোঁৱৰাই দিয়ে।',
      mr: 'वेळ सांगते आणि औषधांची वेळ आठवण करून देते.'
    }
  }
];

export const FamiliarObjectRecognition: React.FC<FamiliarObjectProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  const lang = ['bn', 'as', 'mr', 'hi'].includes(i18n.language) ? (i18n.language as 'bn' | 'as' | 'mr' | 'hi') : 'en';
  const currentItem = ITEMS[currentIndex];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentItem.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 25);
    } else {
      setMistakes(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < ITEMS.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowHint(false);
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const finalScore = score + (isCorrect ? 25 : 0);
        const accuracy = Math.round((finalScore / 100) * 100);

        onComplete({
          score: finalScore,
          maxScore: 100,
          accuracy,
          timeTaken,
          attempts: 1
        });
      }
    }, 1200);
  };

  return (
    <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] max-w-xl mx-auto space-y-6 text-center">
      <div>
        <span className="px-3 py-1 bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-black uppercase rounded-full">
          Game 6: Familiar Object Recognition
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-2">
          Everyday Household Objects
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
          Item {currentIndex + 1} of {ITEMS.length}
        </p>
      </div>

      {/* Large Object Card */}
      <div className="p-8 bg-[var(--bg-surface-secondary)] rounded-3xl border border-[var(--border)] shadow-inner flex flex-col items-center justify-center">
        <span className="text-7xl sm:text-8xl mb-3 animate-pulse">{currentItem.emoji}</span>
        <p className="text-sm sm:text-base font-black text-[var(--text-primary)] max-w-md">
          {currentItem.question[lang]}
        </p>
      </div>

      {/* Hint Button */}
      {showHint ? (
        <div className="p-3 bg-amber-500/15 border border-amber-400/30 rounded-xl text-xs text-amber-300 font-bold animate-fade-in">
          💡 {currentItem.hint[lang]}
        </div>
      ) : (
        <button
          onClick={() => setShowHint(true)}
          className="text-xs text-[var(--text-secondary)] hover:text-emerald-400 font-bold flex items-center justify-center gap-1 mx-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need a gentle hint?</span>
        </button>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5 text-left">
        {currentItem.options[lang].map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentItem.correctIndex;
          let btnCls = 'btn-glass text-[var(--text-primary)]';

          if (selectedOption !== null) {
            if (isCorrect) {
              btnCls = 'bg-emerald-500 text-white border-emerald-400 font-black';
            } else if (isSelected) {
              btnCls = 'bg-rose-500 text-white border-rose-400 font-black';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedOption !== null}
              className={`p-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between cursor-pointer ${btnCls}`}
            >
              <span>{opt}</span>
              {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FamiliarObjectRecognition;
