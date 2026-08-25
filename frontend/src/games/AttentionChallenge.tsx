import React, { useState, useEffect } from 'react';
import { getRandomEmojis, shuffleArray, DIFFICULTY_CONFIG, calculateScore } from './gameUtils';
import { GameCompleteParams } from './MemoryMatch';

interface AttentionChallengeProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

export const AttentionChallenge: React.FC<AttentionChallengeProps> = ({ difficulty, onComplete }) => {
  const config = DIFFICULTY_CONFIG.attentionChallenge(difficulty);
  const [targetEmoji, setTargetEmoji] = useState<string>('');
  const [grid, setGrid] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const initializeGame = () => {
    // Select one target
    const targets = getRandomEmojis(1, 'animals');
    const target = targets[0];
    
    // Select distractors
    const totalCells = config.grid * config.grid;
    const distractorsNeeded = totalCells - config.targets;
    const distractors = getRandomEmojis(8, 'nature'); // Need enough unique distractors
    
    // Build array with exact number of targets and randomly chosen distractors
    const items: string[] = [];
    for (let i = 0; i < config.targets; i++) {
      items.push(target);
    }
    
    for (let i = 0; i < distractorsNeeded; i++) {
      const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
      items.push(randomDistractor);
    }
    
    setTargetEmoji(target);
    setGrid(shuffleArray(items));
    setSelectedIndices(new Set());
    setTimeLeft(config.timeLimit);
    setIsFinished(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      handleFinish();
    }
  }, [timeLeft, isFinished]);

  const toggleSelection = (index: number) => {
    if (isFinished) return;
    
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleFinish = () => {
    setIsFinished(true);
    
    let correct = 0;
    let falseSelections = 0;
    
    selectedIndices.forEach(index => {
      if (grid[index] === targetEmoji) {
        correct++;
      } else {
        falseSelections++;
      }
    });
    
    // Prevent negative score
    const score = Math.max(0, correct - (falseSelections * 0.5));
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const result = calculateScore(score, config.targets, timeTaken, config.timeLimit);
    
    setTimeout(() => {
      onComplete({
        ...result,
        timeTaken
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-purple-50 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-800 mb-2">Attention Challenge</h2>
      
      {!isFinished && (
        <div className="w-full text-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
          <p className="text-2xl text-gray-800 font-medium flex items-center justify-center gap-4">
            Find all the <span className="text-5xl bg-purple-100 p-2 rounded-lg">{targetEmoji}</span>
          </p>
          <div className="mt-4 text-xl font-bold text-purple-600">
            Time Left: <span className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}>{timeLeft}s</span>
          </div>
        </div>
      )}

      <div 
        className="grid gap-3 mb-8 w-full max-w-md mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${config.grid}, minmax(0, 1fr))` 
        }}
      >
        {grid.map((emoji, idx) => {
          let extraClass = "bg-white hover:bg-purple-100 border-2 border-transparent";
          
          if (selectedIndices.has(idx)) {
            if (isFinished) {
              if (emoji === targetEmoji) {
                extraClass = "bg-green-200 border-green-500";
              } else {
                extraClass = "bg-red-200 border-red-500";
              }
            } else {
              extraClass = "bg-purple-200 border-purple-500 transform scale-105";
            }
          } else if (isFinished && emoji === targetEmoji) {
            extraClass = "bg-yellow-200 border-yellow-500 ring-2 ring-yellow-400 ring-offset-2"; // Missed target
          }

          return (
            <button
              key={idx}
              onClick={() => toggleSelection(idx)}
              disabled={isFinished}
              className={`
                aspect-square flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl
                rounded-xl shadow-sm transition-all duration-200 ${extraClass}
              `}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {!isFinished ? (
        <button
          onClick={handleFinish}
          className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-full shadow-lg transition-colors w-full max-w-xs"
        >
          Submit
        </button>
      ) : (
        <div className="text-center p-6 bg-white rounded-xl shadow-sm w-full">
          <p className="text-3xl font-bold text-gray-800 mb-4">Time's Up!</p>
          <div className="flex justify-center gap-8 text-xl">
            <div className="flex flex-col items-center">
              <span className="text-green-600 font-bold text-3xl">
                {Array.from(selectedIndices).filter(i => grid[i] === targetEmoji).length} / {config.targets}
              </span>
              <span className="text-gray-600">Found</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-red-500 font-bold text-3xl">
                {Array.from(selectedIndices).filter(i => grid[i] !== targetEmoji).length}
              </span>
              <span className="text-gray-600">Incorrect</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
