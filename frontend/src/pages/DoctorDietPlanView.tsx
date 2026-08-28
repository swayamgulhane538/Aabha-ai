import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Utensils,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Heart,
  Droplets,
  Flame,
  ShieldCheck,
  Sparkles,
  Clock,
  Printer,
  ChevronRight,
  FileText,
  Apple,
  Award,
  Stethoscope,
  Info,
  Calendar,
  Search,
  Plus,
  Trash2,
  Zap,
  Bot,
  Activity
} from 'lucide-react';
import { dietService, DoctorDietProfile, PrescribedMeal } from '../services/dietService';
import { calorieCalculatorService, DailyCalorieSummary, CalorieItem } from '../services/calorieCalculatorService';
import { speechService } from '../services/speechService';
import { useAuthStore } from '../stores/authStore';

export const DoctorDietPlanView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [diet, setDiet] = useState<DoctorDietProfile>(dietService.getDietProfile());
  const [calorieSummary, setCalorieSummary] = useState<DailyCalorieSummary>(calorieCalculatorService.getDailySummary());
  const [completionPct, setCompletionPct] = useState<number>(dietService.getCompletionPercentage());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // AI Calorie Search States
  const [searchFoodInput, setSearchFoodInput] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculatedFoodResult, setCalculatedFoodResult] = useState<any | null>(null);

  useEffect(() => {
    const handleDietUpdate = (e: any) => {
      setDiet(e.detail || dietService.getDietProfile());
      setCompletionPct(dietService.getCompletionPercentage());
    };

    const handleCalorieUpdate = (e: any) => {
      setCalorieSummary(e.detail || calorieCalculatorService.getDailySummary());
    };

    window.addEventListener('aabha-diet-updated', handleDietUpdate);
    window.addEventListener('aabha-calories-updated', handleCalorieUpdate);

    return () => {
      window.removeEventListener('aabha-diet-updated', handleDietUpdate);
      window.removeEventListener('aabha-calories-updated', handleCalorieUpdate);
    };
  }, []);

  const handleToggleMeal = (meal: PrescribedMeal) => {
    const updated = dietService.toggleMealCompletion(meal.id);
    setDiet(updated);
    setCompletionPct(dietService.getCompletionPercentage());

    // If marked eaten, also automatically log its calories into daily calorie tracker
    if (!meal.completed) {
      calorieCalculatorService.addCalorieItem({
        name: meal.name,
        nameHindi: meal.nameHindi,
        portion: 'Prescribed Doctor Serving',
        caloriesKcal: meal.caloriesKcal,
        proteinG: Math.round(meal.caloriesKcal * 0.08),
        carbsG: Math.round(meal.caloriesKcal * 0.14),
        fatsG: Math.round(meal.caloriesKcal * 0.04),
        brainRating: 'EXCELLENT',
        source: 'PRESCRIBED'
      });
      setCalorieSummary(calorieCalculatorService.getDailySummary());
      setStatusMsg(`Added ${meal.caloriesKcal} kcal to today's screen tally!`);
    } else {
      setStatusMsg('Meal status updated.');
    }
    setTimeout(() => setStatusMsg(''), 3500);
  };

  const handleCalculateFoodCalories = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchFoodInput.trim()) return;

    setIsCalculating(true);
    const result = await calorieCalculatorService.estimateFoodNutrition(searchFoodInput);
    setCalculatedFoodResult(result);
    setIsCalculating(false);
  };

  const handleAddCalculatedFood = () => {
    if (!calculatedFoodResult) return;

    calorieCalculatorService.addCalorieItem({
      name: calculatedFoodResult.name,
      nameHindi: calculatedFoodResult.nameHindi,
      portion: calculatedFoodResult.portion,
      caloriesKcal: calculatedFoodResult.caloriesKcal,
      proteinG: calculatedFoodResult.proteinG,
      carbsG: calculatedFoodResult.carbsG,
      fatsG: calculatedFoodResult.fatsG,
      fiberG: calculatedFoodResult.fiberG,
      brainRating: calculatedFoodResult.brainRating,
      source: 'AI_GOOGLE'
    });

    setCalorieSummary(calorieCalculatorService.getDailySummary());
    setStatusMsg(`✓ Added ${calculatedFoodResult.caloriesKcal} kcal (${calculatedFoodResult.name}) to screen tally!`);
    setCalculatedFoodResult(null);
    setSearchFoodInput('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleQuickAddPreset = async (foodName: string) => {
    setIsCalculating(true);
    setSearchFoodInput(foodName);
    const result = await calorieCalculatorService.estimateFoodNutrition(foodName);
    setCalculatedFoodResult(result);
    setIsCalculating(false);
  };

  const handleRemoveCalorieItem = (id: string) => {
    const updated = calorieCalculatorService.removeCalorieItem(id);
    setCalorieSummary(updated);
  };

  const handleSpeakMeal = (meal: PrescribedMeal) => {
    let text = '';
    if (lang === 'hi') {
      text = `${meal.time} का भोजन: ${meal.nameHindi}। इसमें कुल ${meal.caloriesKcal} कैलोरी हैं। डॉक्टर का सुझाव: ${meal.doctorNoteHindi}`;
    } else if (lang === 'mr') {
      text = `${meal.time} चे जेवण: ${meal.nameMarathi}। यात ${meal.caloriesKcal} कॅलरीज आहेत. डॉक्टरांचा सल्ला: ${meal.doctorNoteMarathi}`;
    } else {
      text = `${meal.time} Meal: ${meal.name} containing ${meal.caloriesKcal} calories. Doctor Note: ${meal.doctorNote}`;
    }
    speechService.speak(text, lang as any);
  };

  const handleSpeakFullDiet = () => {
    const consumed = calorieSummary.consumedKcal;
    const rem = calorieSummary.remainingKcal;
    speechService.speak(
      `आज आपने कुल ${consumed} कैलोरी ग्रहण की हैं। आपके डॉक्टर के 1,750 कैलोरी के लक्ष्य में से ${rem} कैलोरी शेष हैं।`,
      'hi'
    );
  };

  const handlePrintDiet = () => {
    window.print();
  };

  const filteredMeals = diet.meals.filter(m => {
    if (activeFilter === 'PENDING') return !m.completed;
    if (activeFilter === 'COMPLETED') return m.completed;
    return true;
  });

  const calorieProgressPct = Math.min(100, Math.round((calorieSummary.consumedKcal / calorieSummary.targetKcal) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* ─── Top Header & Navigation ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <Link
            to="/patient"
            className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-[var(--text-secondary)] hover:text-emerald-400 border border-[var(--border)] transition-all shadow-xs"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Utensils className="w-7 h-7 text-emerald-500" />
                {t('Doctor Diet Plan & Live Calorie Calculator')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Google AI Nutrition Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Prescribed MIND Diet with real-time automatic calorie calculation, macro tracking & AI food estimator')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSpeakFullDiet}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition-all flex items-center gap-2 shadow-xs"
            title="Listen to Calorie Summary"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('Voice Calorie Status')}</span>
          </button>

          <button
            onClick={handlePrintDiet}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>{t('Print Diet Chart')}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ─── 1. LIVE SCREEN CALORIE CALCULATOR & MACRO METER (HERO CARD) ──── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 backdrop-blur-2xl shadow-2xl space-y-6 mb-8 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Main Calorie Numbers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> Live Calorie Meter
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                Target: {calorieSummary.targetKcal} kcal/day
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                {calorieSummary.consumedKcal}
              </h2>
              <span className="text-lg font-bold text-[var(--text-secondary)]">
                / {calorieSummary.targetKcal} kcal ({calorieProgressPct}%)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              {calorieSummary.remainingKcal > 0 ? (
                <>
                  <strong className="text-[var(--text-primary)]">{calorieSummary.remainingKcal} kcal</strong> remaining to reach doctor's recommended energy goal.
                </>
              ) : (
                <span className="text-emerald-400 font-bold">✓ Daily calorie energy target accomplished!</span>
              )}
            </p>
          </div>

          {/* Right: 4 Macro & Burn Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Protein */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
              <span className="text-xl font-black text-blue-400">{calorieSummary.proteinTotalG}g</span>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Protein</p>
            </div>

            {/* Carbs */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
              <span className="text-xl font-black text-amber-400">{calorieSummary.carbsTotalG}g</span>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Carbs</p>
            </div>

            {/* Healthy Fats */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
              <span className="text-xl font-black text-purple-400">{calorieSummary.fatsTotalG}g</span>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Healthy Fats</p>
            </div>

            {/* Burned */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
              <span className="text-xl font-black text-orange-400">-{calorieSummary.burnedKcal}</span>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Active Burn</p>
            </div>
          </div>
        </div>

        {/* Big Smooth Progress Bar */}
        <div>
          <div className="w-full bg-[var(--bg-surface-secondary)] h-3.5 rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${calorieProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── 2. GOOGLE & GEMINI AI FOOD & CALORIE CALCULATOR SCANNER ───────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-4 mb-8"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {t('Google AI Food Calorie Calculator')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Type or search ANY food item to calculate exact calories and brain nutrition
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 hidden sm:inline-block">
            Auto-Calculate Powered by AI
          </span>
        </div>

        {/* Input Search Form */}
        <form onSubmit={handleCalculateFoodCalories} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="e.g. 2 Roti and Palak Dal, 1 Apple, 1 Plate Poha, Khichdi..."
              value={searchFoodInput}
              onChange={(e) => setSearchFoodInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isCalculating}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isCalculating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Calculate Calories</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Indian Food Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-[var(--text-secondary)] mr-1">Quick Add:</span>
          {[
            { label: '2 Roti (208 kcal)', query: '2 Roti' },
            { label: '1 Bowl Dal (145 kcal)', query: '1 bowl Dal' },
            { label: '1 Apple (95 kcal)', query: '1 Apple' },
            { label: '1 Plate Poha (250 kcal)', query: '1 plate Poha' },
            { label: '1 Cup Curd (98 kcal)', query: '1 cup Curd' },
            { label: '1 Glass Haldi Milk (135 kcal)', query: '1 glass Haldi Milk' }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAddPreset(preset.query)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-[var(--border)] transition-all"
            >
              + {preset.label}
            </button>
          ))}
        </div>

        {/* Calculated Result Card Display */}
        {calculatedFoodResult && (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 animate-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Nutritional Calculation Result
                </span>
                <h4 className="text-xl font-black text-[var(--text-primary)]">
                  {calculatedFoodResult.nameHindi} ({calculatedFoodResult.name})
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Serving Size: <strong>{calculatedFoodResult.portion}</strong> • {calculatedFoodResult.explanation}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 self-start sm:self-center">
                <span className="text-3xl font-black text-emerald-400">
                  {calculatedFoodResult.caloriesKcal}
                </span>
                <span className="text-sm font-bold text-[var(--text-secondary)]">kcal</span>
              </div>
            </div>

            {/* Nutrients Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-center">
              <div className="p-2 rounded-xl bg-[var(--bg-surface)]">
                <span className="text-sm font-black text-blue-400">{calculatedFoodResult.proteinG}g</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Protein</p>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-surface)]">
                <span className="text-sm font-black text-amber-400">{calculatedFoodResult.carbsG}g</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Carbs</p>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-surface)]">
                <span className="text-sm font-black text-purple-400">{calculatedFoodResult.fatsG}g</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Fats</p>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-surface)]">
                <span className="text-sm font-black text-emerald-400">{calculatedFoodResult.brainRating}</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Brain Rating</p>
              </div>
            </div>

            <button
              onClick={handleAddCalculatedFood}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add {calculatedFoodResult.caloriesKcal} kcal to Today's Screen Tally</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. TODAY'S PRESCRIBED DOCTOR MEALS TIMELINE ──────────────────── */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              {t("Today's Doctor Prescribed Meal Schedule")}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Click "Mark Eaten" to automatically add prescribed calories to the live screen meter
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface-secondary)] p-1 rounded-xl border border-[var(--border)] text-xs font-bold">
            {(['ALL', 'PENDING', 'COMPLETED'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg transition ${
                  activeFilter === filter
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Cards */}
        <div className="space-y-4">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-md ${
                meal.completed
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-emerald-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Time & Meal Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      ⏰ {meal.time}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                      {meal.mealType.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      {meal.caloriesKcal} kcal
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      Texture: {meal.textureCategory}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-[var(--text-primary)]">
                    {lang === 'mr' ? meal.nameMarathi : lang === 'hi' ? meal.nameHindi : meal.name}
                  </h4>

                  {/* Prescribed Items Bullet List */}
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)] font-medium pl-1">
                    {(lang === 'mr' ? meal.itemsMarathi : lang === 'hi' ? meal.itemsHindi : meal.items).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Doctor Clinical Note */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 block uppercase">
                        Doctor's Clinical Rationale:
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 leading-relaxed">
                        {lang === 'mr' ? meal.doctorNoteMarathi : lang === 'hi' ? meal.doctorNoteHindi : meal.doctorNote}
                      </p>
                    </div>
                  </div>

                  {/* Brain Nutrients Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-[var(--text-secondary)] font-bold mr-1">Brain Nutrients:</span>
                    {meal.brainNutrients.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        ✨ {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => handleToggleMeal(meal)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                      meal.completed
                        ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                        : 'bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {meal.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('Completed (खा लिया)')}</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>{t('Mark Eaten (खा लिया)')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSpeakMeal(meal)}
                    className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition-all"
                    title="Listen to meal instructions"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. TODAY'S CONSUMED CALORIE LOG TABLE ────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 border border-[var(--border)] backdrop-blur-xl shadow-lg space-y-4 mb-8"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {t("Today's Food Diary & Calorie Logs")} ({calorieSummary.items.length} items)
          </h3>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Total: {calorieSummary.consumedKcal} kcal
          </span>
        </div>

        <div className="space-y-2">
          {calorieSummary.items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🥗
                </div>
                <div>
                  <h5 className="font-bold text-[var(--text-primary)]">{item.name}</h5>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {item.portion} • {item.timestamp} • {item.proteinG}g Protein • {item.carbsG}g Carbs • {item.fatsG}g Fats
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {item.caloriesKcal} kcal
                </span>
                <button
                  onClick={() => handleRemoveCalorieItem(item.id)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDietPlanView;
