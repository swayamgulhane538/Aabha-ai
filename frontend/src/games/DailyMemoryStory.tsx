import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateScore } from './gameUtils';
import { GameCompleteParams } from './MemoryMatch';
import { Globe, BookOpen, CheckCircle, Sparkles } from 'lucide-react';

interface DailyMemoryStoryProps {
  difficulty: number;
  story?: string;
  onComplete: (result: GameCompleteParams) => void;
}

const LOCALIZED_STORIES = {
  mr: {
    title: 'आजची आठवण गोष्ट',
    story: 'आज तुम्ही प्रियासोबत सुंदर बागेत गेला होतात. तिथे तुम्ही रंगीबेरंगी फुले पाहिली आणि गरमागरम चहाचा आस्वाद घेतला. जवळच तुमचा नातू आरव चेंडूने खेळत होता.',
    readPrompt: 'खालील गोष्ट लक्षपूर्वक वाचा आणि त्यानंतर विचारलेल्या प्रश्नांची उत्तरे द्या:',
    finishReadingBtn: 'मी गोष्ट वाचली, प्रश्न विचारा 📖',
    questions: [
      {
        question: '१. तुमच्यासोबत बागेत कोण गेले होते?',
        options: ['प्रिया (मुलगी)', 'आरव (नातू)', 'राजेश (मुलगा)', 'मीना (मैत्रीण)'],
        correctAnswer: 'प्रिया (मुलगी)'
      },
      {
        question: '२. तुम्ही बागेत काय पाहिले?',
        options: ['रंगीबेरंगी फुले', 'सुंदर पक्षी', 'तळ्यातील मासे', 'रात्रीचे तारे'],
        correctAnswer: 'रंगीबेरंगी फुले'
      },
      {
        question: '३. जवळच आरव काय करत होता?',
        options: ['चेंडूने खेळत होता', 'पुस्तक वाचत होता', 'झोपला होता', 'गाणे गात होता'],
        correctAnswer: 'चेंडूने खेळत होता'
      }
    ],
    completeTitle: 'अभिनंदन! गोष्ट पूर्ण झाली 🎉',
    scoreText: 'तुम्ही {{score}}/{{total}} अचूक उत्तरे दिली!',
    encouragement: 'खूपच छान आठवण! मेंदू सक्रिय राहण्यास नक्कीच मदत होईल.'
  },
  hi: {
    title: 'आज की याददाश्त कहानी',
    story: 'आज आप प्रिया के साथ खूबसूरत बगीचे में गए थे। वहाँ आपने सुंदर फूल देखे और साथ में गरमा-गरम अदरक की चाय पी। पास में ही आपका पोता आरव अपनी गेंद से खेल रहा था।',
    readPrompt: 'नीचे दी गई कहानी को ध्यान से पढ़ें और फिर पूछे गए सवालों के जवाब दें:',
    finishReadingBtn: 'मैंने कहानी पढ़ ली, सवाल पूछें 📖',
    questions: [
      {
        question: '१. आपके साथ बगीचे में कौन गया था?',
        options: ['प्रिया (बेटी)', 'आरव (पोता)', 'राजेश (बेटा)', 'मीना (दोस्त)'],
        correctAnswer: 'प्रिया (बेटी)'
      },
      {
        question: '२. आपने बगीचे में क्या देखा?',
        options: ['सुंदर फूल', 'रंग-बिरंगी चिड़िया', 'तालाब की मछलियाँ', 'आसमान के तारे'],
        correctAnswer: 'सुंदर फूल'
      },
      {
        question: '३. पास में ही आरव क्या कर रहा था?',
        options: ['गेंद से खेल रहा था', 'किताब पढ़ रहा था', 'सो रहा था', 'गाना गा रहा था'],
        correctAnswer: 'गेंद से खेल रहा था'
      }
    ],
    completeTitle: 'बधाई हो! कहानी पूरी हुई 🎉',
    scoreText: 'आपने {{score}}/{{total}} सही जवाब दिए!',
    encouragement: 'बहुत बढ़िया प्रयास! आपकी याददाश्त बहुत अच्छी है।'
  },
  en: {
    title: 'Daily Memory Story',
    story: 'Today you visited the peaceful botanical garden with Priya. You admired the colorful blooming flowers and enjoyed hot ginger tea together. Nearby, young Aarav was happily playing with his ball.',
    readPrompt: 'Read this heartwarming memory story carefully, then test your memory with 3 quick questions:',
    finishReadingBtn: 'I Finished Reading, Ask Questions 📖',
    questions: [
      {
        question: '1. Who visited the garden with you?',
        options: ['Priya (Daughter)', 'Aarav (Grandson)', 'Rajesh (Son)', 'Meena (Friend)'],
        correctAnswer: 'Priya (Daughter)'
      },
      {
        question: '2. What did you see in the garden?',
        options: ['Blooming flowers', 'Singing birds', 'Swimming fish', 'Bright stars'],
        correctAnswer: 'Blooming flowers'
      },
      {
        question: '3. What was Aarav doing nearby?',
        options: ['Playing with his ball', 'Reading a book', 'Sleeping peacefully', 'Singing songs'],
        correctAnswer: 'Playing with his ball'
      }
    ],
    completeTitle: 'Well Done! Story Recall Complete 🎉',
    scoreText: 'You remembered {{score}}/{{total}} details correctly!',
    encouragement: 'Excellent memory recall! Regular practice keeps your mind sharp and active.'
  }
};

type Phase = 'READING' | 'QUIZ' | 'RESULT';

export const DailyMemoryStory: React.FC<DailyMemoryStoryProps> = ({ difficulty, story, onComplete }) => {
  const { i18n } = useTranslation();
  const langKey = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'mr' | 'hi' | 'en';
  const currentContent = LOCALIZED_STORIES[langKey] || LOCALIZED_STORIES.en;

  const [phase, setPhase] = useState<Phase>('READING');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState(0);

  const displayStory = story || currentContent.story;
  const questions = currentContent.questions;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleFinishReading = () => {
    setPhase('QUIZ');
  };

  const handleAnswerClick = (answer: string) => {
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));

    if (isCorrect) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(idx => idx + 1);
      } else {
        finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1200);
  };

  const finishGame = (finalScore: number) => {
    setPhase('RESULT');
    const timeTaken = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const result = calculateScore(finalScore, questions.length, timeTaken, 300);

    setTimeout(() => {
      onComplete({
        ...result,
        timeTaken,
        attempts: 1
      });
    }, 2800);
  };

  return (
    <div className="flex flex-col items-center p-6 md:p-10 bg-warm-50 rounded-3xl shadow-lg w-full max-w-4xl mx-auto border-2 border-primary-100">
      {/* Top Header with Language Selector */}
      <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-black text-primary-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-600" />
          <span>{currentContent.title}</span>
        </h2>

        {/* In-game Language Switcher */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => i18n.changeLanguage('mr')}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition ${i18n.language === 'mr' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            मराठी
          </button>
          <button
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition ${i18n.language === 'hi' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition ${i18n.language === 'en' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            EN
          </button>
        </div>
      </div>

      {phase === 'READING' && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          <p className="text-xl text-gray-600 mb-6 font-medium text-center">
            {currentContent.readPrompt}
          </p>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-md w-full mb-8 border-2 border-primary-200 relative overflow-hidden">
            <div className="text-5xl mb-4 text-center">🌳 ☕ 🌸</div>
            <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-semibold text-center">
              "{displayStory}"
            </p>
          </div>

          <button
            onClick={handleFinishReading}
            className="px-10 py-5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-2xl font-black rounded-2xl shadow-xl transition-all hover:scale-105 min-h-[64px]"
          >
            {currentContent.finishReadingBtn}
          </button>
        </div>
      )}

      {phase === 'QUIZ' && (
        <div className="w-full animate-fade-in">
          <div className="mb-6 flex justify-between items-center text-xl font-bold text-gray-600">
            <span className="bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md w-full mb-8 border-2 border-gray-100">
            <h3 className="text-3xl text-gray-900 font-extrabold mb-8 leading-snug">
              {questions[currentQuestionIndex].question}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === option;
                const isAnswered = answers[currentQuestionIndex] !== undefined;
                const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
                
                let btnClass = "bg-gray-50 hover:bg-primary-50 border-gray-200 text-gray-800 hover:border-primary-300";
                
                if (isAnswered) {
                  if (isCorrect) {
                    btnClass = "bg-green-500 text-white border-green-600 shadow-md";
                  } else if (isSelected) {
                    btnClass = "bg-red-500 text-white border-red-600 shadow-md";
                  } else {
                    btnClass = "bg-gray-100 text-gray-400 opacity-40";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(option)}
                    disabled={isAnswered}
                    className={`px-6 py-5 rounded-2xl text-2xl font-bold border-2 transition-all text-left flex items-center justify-between ${btnClass}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle className="w-7 h-7 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {phase === 'RESULT' && (
        <div className="w-full text-center bg-white p-10 md:p-14 rounded-3xl shadow-xl border-2 border-primary-200 animate-scale-up">
          <div className="text-8xl mb-6 animate-bounce">
            {score === questions.length ? '🏆' : '🌟'}
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-4">
            {currentContent.completeTitle}
          </h3>
          <p className="text-3xl text-primary-700 font-extrabold mb-4">
            {currentContent.scoreText.replace('{{score}}', String(score)).replace('{{total}}', String(questions.length))}
          </p>
          <p className="text-xl text-gray-600 font-medium">
            {currentContent.encouragement}
          </p>
        </div>
      )}
    </div>
  );
};
