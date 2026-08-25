import React, { useState, useEffect } from 'react';
import { EMOJI_SETS, getRandomEmojis, shuffleArray, DIFFICULTY_CONFIG, calculateScore } from './gameUtils';
import { GameCompleteParams } from './MemoryMatch';

interface PictureRecognitionProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface Question {
  emoji: string;
  options: string[];
  correctAnswer: string;
}

const EMOJI_NAMES: Record<string, string> = {
  '🐶': 'Dog', '🐱': 'Cat', '🐭': 'Mouse', '🐹': 'Hamster', '🐰': 'Rabbit', 
  '🍎': 'Apple', '🍌': 'Banana', '🍉': 'Watermelon', '🍇': 'Grapes', '🍓': 'Strawberry',
  '⌚': 'Watch', '📱': 'Phone', '💻': 'Laptop', '⌨️': 'Keyboard', '🖱️': 'Mouse (Computer)',
  '🌳': 'Tree', '🌴': 'Palm Tree', '🌵': 'Cactus', '🍄': 'Mushroom', '🍁': 'Maple Leaf',
  '⚽': 'Soccer Ball', '🏀': 'Basketball', '🏈': 'Football', '🎾': 'Tennis Ball', '⚾': 'Baseball'
};

export const PictureRecognition: React.FC<PictureRecognitionProps> = ({ difficulty, onComplete }) => {
  const config = DIFFICULTY_CONFIG.pictureRecognition(difficulty);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    generateQuestions();
    setStartTime(Date.now());
  }, [difficulty]);

  const generateQuestions = () => {
    const availableEmojis = Object.keys(EMOJI_NAMES);
    const selectedEmojis = shuffleArray(availableEmojis).slice(0, config.questions);
    
    const qs: Question[] = selectedEmojis.map(emoji => {
      const correct = EMOJI_NAMES[emoji];
      const allOtherNames = Object.values(EMOJI_NAMES).filter(n => n !== correct);
      const distractors = shuffleArray(allOtherNames).slice(0, 3);
      const options = shuffleArray([correct, ...distractors]);
      
      return {
        emoji,
        options,
        correctAnswer: correct
      };
    });
    
    setQuestions(qs);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsFinished(false);
  };

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    
    if (answer === questions[currentQIndex].correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(idx => idx + 1);
        setSelectedAnswer(null);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = () => {
    setIsFinished(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    // Add current correct answer if last question was correct since state update is async
    const finalScore = selectedAnswer === questions[currentQIndex].correctAnswer ? score + 1 : score;
    const result = calculateScore(finalScore, questions.length, timeTaken, 120);

    setTimeout(() => {
      onComplete({
        ...result,
        timeTaken
      });
    }, 2000);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentQIndex];

  return (
    <div className="flex flex-col items-center p-6 bg-pink-50 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-pink-800 mb-4">Picture Recognition</h2>

      {!isFinished ? (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between w-full px-6 mb-4">
            <span className="text-xl font-medium text-gray-600">Question {currentQIndex + 1} of {questions.length}</span>
            <span className="text-xl font-medium text-gray-600">Score: {score}</span>
          </div>

          <div className="bg-white p-12 rounded-2xl shadow-sm mb-8">
            <div className="text-9xl">{currentQ.emoji}</div>
          </div>

          <p className="text-2xl text-gray-800 font-bold mb-6">What is this?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {currentQ.options.map((option, idx) => {
              let btnClass = "bg-white hover:bg-pink-100 border-gray-200 text-gray-800";
              
              if (selectedAnswer !== null) {
                if (option === currentQ.correctAnswer) {
                  btnClass = "bg-green-500 text-white border-green-600";
                } else if (option === selectedAnswer) {
                  btnClass = "bg-red-500 text-white border-red-600";
                } else {
                  btnClass = "bg-gray-100 text-gray-400 border-gray-200 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(option)}
                  disabled={selectedAnswer !== null}
                  className={`px-6 py-5 rounded-xl text-2xl font-medium border-2 shadow-sm transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-4xl font-bold text-gray-800 mb-6">Quiz Complete!</h3>
          <div className="text-8xl mb-6">
            {score / questions.length >= 0.8 ? '🌟' : '👍'}
          </div>
          <p className="text-3xl text-pink-700 font-medium mb-4">
            You got {score} out of {questions.length} correct!
          </p>
        </div>
      )}
    </div>
  );
};
