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
  Calendar
} from 'lucide-react';
import { dietService, DoctorDietProfile, PrescribedMeal } from '../services/dietService';
import { speechService } from '../services/speechService';
import { useAuthStore } from '../stores/authStore';

export const DoctorDietPlanView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [diet, setDiet] = useState<DoctorDietProfile>(dietService.getDietProfile());
  const [completionPct, setCompletionPct] = useState<number>(dietService.getCompletionPercentage());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setDiet(e.detail || dietService.getDietProfile());
      setCompletionPct(dietService.getCompletionPercentage());
    };

    window.addEventListener('aabha-diet-updated', handleUpdate);
    return () => window.removeEventListener('aabha-diet-updated', handleUpdate);
  }, []);

  const handleToggleMeal = (mealId: string) => {
    const updated = dietService.toggleMealCompletion(mealId);
    setDiet(updated);
    setCompletionPct(dietService.getCompletionPercentage());
    setStatusMsg('Meal status updated in clinical diet record.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSpeakMeal = (meal: PrescribedMeal) => {
    let text = '';
    if (lang === 'hi') {
      text = `${meal.time} का भोजन: ${meal.nameHindi}। डॉक्टर का सुझाव: ${meal.doctorNoteHindi}`;
    } else if (lang === 'mr') {
      text = `${meal.time} चे जेवण: ${meal.nameMarathi}। डॉक्टरांचा सल्ला: ${meal.doctorNoteMarathi}`;
    } else {
      text = `${meal.time} Meal: ${meal.name}. Doctor Note: ${meal.doctorNote}`;
    }
    speechService.speak(text, lang as any);
  };

  const handleSpeakFullDiet = () => {
    dietService.speakDietSummary(lang);
  };

  const handlePrintDiet = () => {
    window.print();
  };

  const filteredMeals = diet.meals.filter(m => {
    if (activeFilter === 'PENDING') return !m.completed;
    if (activeFilter === 'COMPLETED') return m.completed;
    return true;
  });

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
                {t('Doctor Recommended Diet & Nutrition Plan')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Prescribed by Neurologist
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Evidence-based MIND and Medhya Rasayana neuro-protective diet prescribed for cognitive wellness')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSpeakFullDiet}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition-all flex items-center gap-2 shadow-xs"
            title="Listen to Diet Advice"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('Voice Diet Summary')}</span>
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

      {/* ─── Doctor Prescription Hero Badge ───────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 backdrop-blur-2xl shadow-xl space-y-5 mb-8 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Prescribed Clinical Protocol
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                  Prescription Date: {diet.lastPrescribedDate}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
                {diet.dietName}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                {diet.doctorName} • {diet.doctorSpecialty} ({diet.doctorHospital})
              </p>
            </div>
          </div>

          {/* Today's Diet Adherence Score */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] min-w-[200px] text-center">
            <span className="text-xs font-black uppercase text-emerald-400">Diet Adherence</span>
            <div className="text-3xl font-black text-[var(--text-primary)] mt-0.5">
              {completionPct}%
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full mt-2 overflow-hidden border border-[var(--border)]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Clinical Diet Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block">Daily Energy</span>
              <strong className="text-base font-black text-[var(--text-primary)]">{diet.dailyCalorieTarget} kcal</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block">Hydration Target</span>
              <strong className="text-base font-black text-[var(--text-primary)]">{diet.dailyWaterTargetLiters} Liters/day</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block">Sodium Limit</span>
              <strong className="text-base font-black text-[var(--text-primary)]">&lt; {diet.sodiumLimitMg} mg (Low Salt)</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block">Meal Consistency</span>
              <strong className="text-base font-black text-[var(--text-primary)]">Soft &amp; Easy Swallow</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Prescribed Meal Schedule (Timeline List) ──────────────────────── */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              {t("Today's Prescribed Meal Schedule")}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Scheduled clinical meals calibrated for steady brain glucose and neurotransmitter balance
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
                    onClick={() => handleToggleMeal(meal.id)}
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

      {/* ─── Brain Superfoods & Foods to Avoid Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Medhya Rasayana Superfoods */}
        <div
          className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border border-emerald-500/20 backdrop-blur-xl shadow-lg space-y-4"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {t('Cognitive Superfoods (Medhya Rasayana)')}
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Prescribed Daily
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {diet.superfoods.map((food, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{food.emoji}</span>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">{food.name}</h5>
                  <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5 leading-relaxed">
                    {food.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Red Flags - Foods to Avoid */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border border-rose-500/30 backdrop-blur-xl shadow-lg space-y-4"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {t('Doctor Red Flags (Foods to Avoid)')}
            </h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              Strict Restriction
            </span>
          </div>

          <div className="space-y-2.5">
            {diet.foodsToAvoid.map((avoid, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                <strong className="text-rose-300 block font-bold">🚫 {avoid.item}</strong>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  {avoid.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDietPlanView;
