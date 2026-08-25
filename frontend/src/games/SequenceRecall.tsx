import React, { useState, useEffect, useRef } from 'react';
import { getRandomEmojis, shuffleArray, DIFFICULTY_CONFIG, calculateScore } from './gameUtils';
import { GameCompleteParams } from './MemoryMatch';

interface SequenceRecallProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

type Phase = 'SHOW' | 'RECALL' | 'RESULT';

export const SequenceRecall: React.FC<SequenceRecallProps> = ({ difficulty, onComplete }) => {
  const config = DIFFICULTY_CONFIG.sequenceRecall(difficulty);
  const [phase, setPhase] = useState<Phase>('SHOW');
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const seq = getRandomEmojis(config.items, 'nature');
    setSequence(seq);
    setOptions(shuffleArray([...seq]));
    setCurrentIndex(0);
    setPhase('SHOW');
    setUserSequence([]);
  }, [difficulty]);

  useEffect(() => {
    if (phase === 'SHOW' && sequence.length > 0) {
      if (currentIndex < sequence.length) {
        timerRef.current = setTimeout(() => {
          setCurrentIndex(c => c + 1);
        }, 1500); // 1.5 seconds per item
      } else {
        setPhase('RECALL');
        setStartTime(Date.now());
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, currentIndex, sequence]);

  const handleOptionClick = (emoji: string) => {
    if (phase !== 'RECALL') return;
    
    const newSeq = [...userSequence, emoji];
    setUserSequence(newSeq);

    if (newSeq.length === sequence.length) {
      finishGame(newSeq);
    }
  };

  const handleClear = () => {
    setUserSequence([]);
  };

  const finishGame = (finalSeq: string[]) => {
    setPhase('RESULT');
    
    let correct = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === finalSeq[i]) correct++;
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const result = calculateScore(correct, sequence.length, timeTaken, 60);

    setTimeout(() => {
      onComplete({
        ...result,
        timeTaken
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-teal-50 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-teal-800 mb-4">Sequence Recall</h2>

      {phase === 'SHOW' && (
        <div className="w-full text-center flex flex-col items-center">
          <p className="text-2xl text-gray-700 mb-8 font-medium">Watch the sequence carefully...</p>
          <div className="h-48 flex items-center justify-center">
            {currentIndex < sequence.length ? (
              <div className="text-9xl animate-bounce">
                {sequence[currentIndex]}
              </div>
            ) : (
              <div className="text-4xl text-teal-600 font-bold">Get ready...</div>
            )}
          </div>
          <div className="flex gap-2 mt-8">
            {sequence.map((_, idx) => (
              <div key={idx} className={`w-4 h-4 rounded-full ${idx === currentIndex ? 'bg-teal-600' : 'bg-teal-200'}`} />
            ))}
          </div>
        </div>
      )}

      {phase === 'RECALL' && (
        <div className="w-full text-center flex flex-col items-center">
          <p className="text-2xl text-gray-700 mb-6 font-medium">Recreate the sequence</p>
          
          <div className="flex justify-center gap-4 mb-8 min-h-[100px] p-4 bg-white rounded-xl shadow-inner w-full overflow-x-auto">
            {userSequence.map((emoji, idx) => (
              <div key={idx} className="text-5xl">{emoji}</div>
            ))}
            {Array.from({ length: sequence.length - userSequence.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex-shrink-0" />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            {options.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(emoji)}
                disabled={userSequence.length >= sequence.length}
                className="text-6xl p-6 bg-white rounded-xl shadow-md hover:bg-teal-50 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xl font-medium rounded-full transition-colors"
          >
            Clear Sequence
          </button>
        </div>
      )}

      {phase === 'RESULT' && (
        <div className="w-full flex flex-col items-center">
          <p className="text-3xl text-gray-800 mb-8 font-bold">Let's see how you did!</p>
          
          <div className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center mb-4">
              <span className="w-32 text-xl font-bold text-gray-600">Original:</span>
              <div className="flex gap-4">
                {sequence.map((emoji, idx) => (
                  <span key={idx} className="text-4xl">{emoji}</span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="w-32 text-xl font-bold text-gray-600">Your Answer:</span>
              <div className="flex gap-4">
                {userSequence.map((emoji, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-4xl">{emoji}</span>
                    <span className={`text-2xl mt-2 ${emoji === sequence[idx] ? 'text-green-500' : 'text-red-500'}`}>
                      {emoji === sequence[idx] ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-teal-800">
            {userSequence.every((v, i) => v === sequence[i]) ? 'Perfect!' : 'Good try!'}
          </div>
        </div>
      )}
    </div>
  );
};
