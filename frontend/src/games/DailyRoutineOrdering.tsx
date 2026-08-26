import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameCompleteParams } from './MemoryMatch';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface DailyRoutineOrderingProps {
  difficulty: number;
  onComplete: (result: GameCompleteParams) => void;
}

interface RoutineStep {
  id: string;
  order: number; // 1 to N correct order
  emoji: string;
  en: string;
  hi: string;
  bn: string;
  as: string;
  mr: string;
}

const ALL_ROUTINE_STEPS: RoutineStep[] = [
  { id: '1', order: 1, emoji: '🌅', en: 'Wake Up & Drink Water', hi: 'सुबह उठना और पानी पीना', bn: 'ঘুম থেকে ওঠা ও পানি পান', as: 'পুৱা সাৰ পোৱা আৰু পানী খোৱা', mr: 'सकाळी उठणे आणि पाणी पिणे' },
  { id: '2', order: 2, emoji: '🪥', en: 'Brush Teeth & Freshen Up', hi: 'दांत साफ करना और तैयार होना', bn: 'দাঁত মাজা ও সতেজ হওয়া', as: 'দাঁত ব্ৰাছ কৰা', mr: 'दात घासणे आणि तयार होणे' },
  { id: '3', order: 3, emoji: '🥣', en: 'Healthy Morning Breakfast', hi: 'पौष्टिक सुबह का नाश्ता', bn: 'স্বাস্থ্যকর প্রাতরাশ', as: 'পুৱাৰ পুষ্টিকৰ আহাৰ', mr: 'सकाळचा पौष्टिक नाश्ता' },
  { id: '4', order: 4, emoji: '💊', en: 'Take Morning Medicines', hi: 'सुबह की निर्धारित दवाइयाँ लेना', bn: 'সকালের ওষুধ খাওয়া', as: 'পুৱাৰ ঔষধ গ্ৰহণ কৰা', mr: 'सकाळची औषधे घेणे' },
  { id: '5', order: 5, emoji: '🧠', en: 'Play Cognitive Memory Games', hi: 'दिमागी मेमोरी खेल खेलना', bn: 'স্মৃতি গেম খেলা', as: 'স্মৃতি খেল খেলা', mr: 'मेमरी गेम्स खेळणे' },
  { id: '6', order: 6, emoji: '🍲', en: 'Warm Afternoon Lunch', hi: 'दोपहर का भोजन', bn: 'দুপুরের খাবার', as: 'দুপৰীয়াৰ ভাত খোৱা', mr: 'दुपारचे जेवण' },
  { id: '7', order: 7, emoji: '🚶', en: 'Gentle Evening Walk in Garden', hi: 'शाम को बगीचे में टहलना', bn: 'বিকালে হাঁটা', as: 'গধূলি ফুৰিবলৈ যোৱা', mr: 'संध्याकाळी बागेत फिरणे' },
  { id: '8', order: 8, emoji: '🌙', en: 'Peaceful Night Sleep', hi: 'रात को समय पर सोना', bn: 'রাতে ঘুমানো', as: 'ৰাতি টোপনি যোৱা', mr: 'रात्री शांत झोपणे' }
];

export const DailyRoutineOrdering: React.FC<DailyRoutineOrderingProps> = ({ difficulty, onComplete }) => {
  const { i18n } = useTranslation();
  const stepCount = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;

  const [targetSteps, setTargetSteps] = useState<RoutineStep[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RoutineStep[]>([]);
  const [availableSteps, setAvailableSteps] = useState<RoutineStep[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  const getLabel = (step: RoutineStep): string => {
    if (i18n.language === 'bn') return step.bn;
    if (i18n.language === 'as') return step.as;
    if (i18n.language === 'mr') return step.mr;
    if (i18n.language === 'hi') return step.hi;
    return step.en;
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const initializeGame = () => {
    const selected = ALL_ROUTINE_STEPS.slice(0, stepCount);
    // Shuffle available steps
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setTargetSteps(selected);
    setAvailableSteps(shuffled);
    setSelectedOrder([]);
    setMistakes(0);
    setIsFinished(false);
  };

  const handleStepClick = (step: RoutineStep) => {
    const nextIndex = selectedOrder.length;
    const expectedStep = targetSteps[nextIndex];

    if (step.id === expectedStep.id) {
      const newSelected = [...selectedOrder, step];
      setSelectedOrder(newSelected);
      setAvailableSteps(prev => prev.filter(s => s.id !== step.id));

      if (newSelected.length === targetSteps.length) {
        setIsFinished(true);
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const accuracy = Math.max(50, Math.round(100 - mistakes * 12));
        const score = Math.round(accuracy * 1.5 + (stepCount * 20));

        onComplete({
          score,
          maxScore: 200,
          accuracy,
          timeTaken,
          attempts: 1
        });
      }
    } else {
      setMistakes(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setSelectedOrder([]);
    setAvailableSteps([...targetSteps].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] max-w-2xl mx-auto space-y-6 text-center">
      <div>
        <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase rounded-full">
          Game 5: Chronological Ordering
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-2">
          Daily Routine Sequence
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
          Tap the everyday activities in the correct order from morning to night.
        </p>
      </div>

      {/* Ordered Slots */}
      <div className="space-y-2 text-left">
        <h3 className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
          Your Ordered Routine ({selectedOrder.length}/{targetSteps.length})
        </h3>
        <div className="grid grid-cols-1 gap-2 min-h-[160px] p-3 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-2xl">
          {selectedOrder.map((step, idx) => (
            <div
              key={step.id}
              className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl flex items-center justify-between animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </span>
                <span className="text-xl">{step.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  {getLabel(step)}
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          ))}

          {selectedOrder.length < targetSteps.length && (
            <div className="p-3 border-2 border-dashed border-[var(--border)] rounded-xl flex items-center justify-center text-xs text-[var(--text-secondary)] font-bold">
              <span>Step {selectedOrder.length + 1}: Select next routine activity below</span>
            </div>
          )}
        </div>
      </div>

      {/* Available Activities to Tap */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider text-left">
          Available Activities (Tap to Place)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableSteps.map(step => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              className="btn-glass p-3.5 rounded-2xl flex items-center gap-3 text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {getLabel(step)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] font-bold">
        <span>Mistakes: {mistakes}</span>
        <button onClick={handleReset} className="text-emerald-400 hover:underline flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Order</span>
        </button>
      </div>
    </div>
  );
};

export default DailyRoutineOrdering;
