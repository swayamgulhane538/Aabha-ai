import React, { useState, useEffect } from 'react';
import { getRandomEmojis, shuffleArray, DIFFICULTY_CONFIG, calculateScore } from './gameUtils';
import { GameCompleteParams } from './MemoryMatch';

interface RememberObjectsProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

type Phase = 'MEMORIZE' | 'RECALL' | 'RESULT';

export const RememberObjects: React.FC<RememberObjectsProps> = ({ difficulty, onComplete }) => {
  const config = DIFFICULTY_CONFIG.rememberObjects(difficulty);
  const [phase, setPhase] = useState<Phase>('MEMORIZE');
  const [targetObjects, setTargetObjects] = useState<string[]>([]);
  const [allObjects, setAllObjects] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const targets = getRandomEmojis(config.objects, 'objects');
    const distractors = getRandomEmojis(config.distractors, 'fruits'); // Mix categories to make it fair
    
    setTargetObjects(targets);
    setAllObjects(shuffleArray([...targets, ...distractors]));
    setStartTime(Date.now());
  }, [difficulty]);

  useEffect(() => {
    if (phase === 'MEMORIZE') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('RECALL');
        setStartTime(Date.now()); // Reset timer for recall phase
      }
    }
  }, [timeLeft, phase]);

  const toggleSelection = (emoji: string) => {
    const newSelection = new Set(selectedObjects);
    if (newSelection.has(emoji)) {
      newSelection.delete(emoji);
    } else {
      newSelection.add(emoji);
    }
    setSelectedObjects(newSelection);
  };

  const handleSubmit = () => {
    setPhase('RESULT');
    let correct = 0;
    selectedObjects.forEach(emoji => {
      if (targetObjects.includes(emoji)) correct++;
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const result = calculateScore(correct, targetObjects.length, timeTaken, 60);

    setTimeout(() => {
      onComplete({
        ...result,
        timeTaken
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-orange-50 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-orange-800 mb-4">Remember the Objects</h2>

      {phase === 'MEMORIZE' && (
        <div className="w-full text-center">
          <p className="text-2xl text-gray-700 mb-6 font-medium">
            Remember these objects! Time left: <span className="font-bold text-red-600">{timeLeft}s</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6 p-8 bg-white rounded-xl shadow-sm">
            {targetObjects.map((emoji, idx) => (
              <div key={idx} className="text-7xl p-4 bg-orange-100 rounded-2xl animate-pulse">
                {emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'RECALL' && (
        <div className="w-full text-center">
          <p className="text-2xl text-gray-700 mb-6 font-medium">
            Select the objects you saw before
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
            {allObjects.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => toggleSelection(emoji)}
                className={`
                  text-6xl p-6 rounded-xl transition-all duration-200 shadow-md border-4
                  ${selectedObjects.has(emoji) 
                    ? 'bg-orange-200 border-orange-500 transform scale-105' 
                    : 'bg-white border-transparent hover:bg-orange-50'}
                `}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white text-2xl font-bold rounded-full shadow-lg transition-colors"
          >
            I'm Done
          </button>
        </div>
      )}

      {phase === 'RESULT' && (
        <div className="w-full text-center">
          <p className="text-3xl text-gray-800 mb-6 font-bold">Results</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
            {allObjects.map((emoji, idx) => {
              const wasTarget = targetObjects.includes(emoji);
              const wasSelected = selectedObjects.has(emoji);
              let bgColor = "bg-white";
              let borderColor = "border-gray-200";
              
              if (wasTarget && wasSelected) {
                bgColor = "bg-green-100"; borderColor = "border-green-500"; // Correctly selected
              } else if (wasTarget && !wasSelected) {
                bgColor = "bg-yellow-100"; borderColor = "border-yellow-500"; // Missed target
              } else if (!wasTarget && wasSelected) {
                bgColor = "bg-red-100"; borderColor = "border-red-500"; // False positive
              }

              return (
                <div key={idx} className={`text-6xl p-6 rounded-xl border-4 ${bgColor} ${borderColor}`}>
                  {emoji}
                  {wasTarget && wasSelected && <div className="text-xl text-green-600 font-bold mt-2">✓</div>}
                  {wasTarget && !wasSelected && <div className="text-xl text-yellow-600 font-bold mt-2">Missed</div>}
                  {!wasTarget && wasSelected && <div className="text-xl text-red-600 font-bold mt-2">✗</div>}
                </div>
              );
            })}
          </div>
          <div className="text-2xl font-bold text-orange-800">
            Great effort! Calculating score...
          </div>
        </div>
      )}
    </div>
  );
};
