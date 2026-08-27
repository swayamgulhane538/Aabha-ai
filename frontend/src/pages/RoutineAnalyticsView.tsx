import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import {
  TrendingUp, Award, Flame, CheckCircle2, AlertCircle, Calendar,
  BarChart3, Sparkles, Heart, Activity, Clock, ShieldCheck, ArrowUpRight
} from 'lucide-react';

export default function RoutineAnalyticsView() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [analyticsData, setAnalyticsData] = useState({
    todayCompleted: 5,
    todayTotal: 6,
    weekCompleted: 34,
    weekTotal: 38,
    missedCount: 1,
    currentStreak: 6,
    bestStreak: 14,
    mostConsistentDays: ['Monday', 'Wednesday', 'Friday'],
    dailyBreakdown: [
      { day: 'Mon', labelHi: 'सोम', pct: 90, completed: 5, total: 6 },
      { day: 'Tue', labelHi: 'मंगल', pct: 85, completed: 5, total: 6 },
      { day: 'Wed', labelHi: 'बुध', pct: 100, completed: 6, total: 6 },
      { day: 'Thu', labelHi: 'गुरु', pct: 75, completed: 4, total: 6 },
      { day: 'Fri', labelHi: 'शुक्र', pct: 100, completed: 6, total: 6 },
      { day: 'Sat', labelHi: 'शनि', pct: 85, completed: 5, total: 6 },
      { day: 'Sun', labelHi: 'रवि', pct: 83, completed: 5, total: 6 }
    ],
    categoryStats: [
      { category: 'Medicine', emoji: '💊', pct: 96, color: 'from-emerald-400 to-teal-400' },
      { category: 'Hydration', emoji: '💧', pct: 92, color: 'from-cyan-400 to-blue-400' },
      { category: 'Meals', emoji: '🍽️', pct: 88, color: 'from-amber-400 to-orange-400' },
      { category: 'Memory & Activity', emoji: '🧠', pct: 80, color: 'from-purple-400 to-pink-400' }
    ]
  });

  const weeklyPct = Math.round((analyticsData.weekCompleted / analyticsData.weekTotal) * 100);
  const todayPct = Math.round((analyticsData.todayCompleted / analyticsData.todayTotal) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* ─── 1. HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="card-3d bg-gradient-to-br from-indigo-950/40 via-[var(--card-bg-inline)] to-purple-950/30 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border-2 border-indigo-500/30 shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Routine & Habit Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
          <span>📊</span> {lang === 'mr' ? 'साप्ताहिक दिनचर्या विश्लेषण' : lang === 'hi' ? 'साप्ताहिक दिनचर्या विश्लेषण' : 'Weekly Routine Analytics'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
          {lang === 'mr'
            ? 'तुमच्या नियमित सवयी, वेळेवर घेतलेली औषधे आणि दैनंदिन कामांची सकारात्मक प्रगती.'
            : lang === 'hi'
            ? 'आपकी नियमित आदतें, समय पर ली गई दवाइयां और दैनिक कार्यों की सकारात्मक प्रगति।'
            : 'Positive reinforcement of your healthy habits, timely medicines, and daily routine consistency.'}
        </p>
      </div>

      {/* ─── 2. 4 CORE METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Today's Tasks */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-4 sm:p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              {todayPct}%
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {analyticsData.todayCompleted}/{analyticsData.todayTotal}
            </div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)]">
              {lang === 'mr' ? 'आज पूर्ण केलेली कामे' : lang === 'hi' ? 'आज पूर्ण कार्य' : 'Tasks Done Today'}
            </p>
          </div>
        </div>

        {/* Card 2: Weekly Completion */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-4 sm:p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📅</span>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full">
              {weeklyPct}%
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {analyticsData.weekCompleted}/{analyticsData.weekTotal}
            </div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)]">
              {lang === 'mr' ? 'या आठवड्यातील कामे' : lang === 'hi' ? 'इस सप्ताह के कार्य' : 'Weekly Total Tasks'}
            </p>
          </div>
        </div>

        {/* Card 3: Consistency Streak */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-4 sm:p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔥</span>
            <span className="text-xs font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
              Streak
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {analyticsData.currentStreak} {lang === 'mr' ? 'दिवस' : lang === 'hi' ? 'दिन' : 'Days'}
            </div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)]">
              {lang === 'mr' ? 'सलग दिनचर्या ट्रॅक' : lang === 'hi' ? 'लगातार रूटीन स्ट्रीक' : 'Consistent Streak'}
            </p>
          </div>
        </div>

        {/* Card 4: Missed Reminders */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-4 sm:p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">⏰</span>
            <span className="text-xs font-black text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-full">
              Safe
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-teal-300">
              {analyticsData.missedCount}
            </div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)]">
              {lang === 'mr' ? 'चुकलेले स्मरणपत्र (पुनर्निर्धारित)' : lang === 'hi' ? 'छूटे रिमाइंडर (रीशेड्यूल)' : 'Missed Reminders'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2.1 MOST ACTIVE TIME & TOP CONSISTENCY HIGHLIGHTS ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
            ☀️
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">Most Active Time Period</span>
            <h3 className="text-base font-black text-[var(--text-primary)]">Morning (08:00 AM – 11:30 AM)</h3>
            <p className="text-xs text-[var(--text-secondary)]">Highest energy & routine completion rate (94%)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center text-2xl shrink-0">
            🏆
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Most Consistent Days</span>
            <h3 className="text-base font-black text-[var(--text-primary)]">Wednesday & Friday (100%)</h3>
            <p className="text-xs text-[var(--text-secondary)]">All scheduled doses & activities completed</p>
          </div>
        </div>
      </div>

      {/* ─── 3. WEEKLY DAY-BY-DAY BAR CHART ────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>{lang === 'mr' ? 'दैनंदिन दिनचर्या सातत्य (सोमवार - रविवार)' : lang === 'hi' ? 'दैनिक दिनचर्या सातत्य (सोमवार - रविवार)' : 'Daily Routine Consistency (Mon - Sun)'}</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {lang === 'mr'
                ? 'प्रत्येक दिवशी पूर्ण केलेल्या कामांचे प्रमाण'
                : lang === 'hi'
                ? 'प्रत्येक दिन पूरे किए गए कार्यों का अनुपात'
                : 'Proportion of scheduled tasks completed each day'}
            </p>
          </div>

          <span className="text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full self-start sm:self-center">
            {lang === 'mr' ? 'सर्वोत्तम सातत्य: सोम, बुध, शुक्र' : lang === 'hi' ? 'सर्वश्रेष्ठ दिन: सोम, बुध, शुक्र' : 'Top Days: Mon, Wed, Fri'}
          </span>
        </div>

        {/* SVG/CSS Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-6 pb-2 items-end h-48 sm:h-56 border-b border-[var(--border)]">
          {analyticsData.dailyBreakdown.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                {item.pct}%
              </span>
              <div className="w-full max-w-[36px] bg-[var(--bg-surface-secondary)] rounded-t-xl overflow-hidden h-full flex flex-col justify-end p-0.5">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-teal-500 to-emerald-400 transition-all duration-700 shadow-md"
                  style={{ height: `${item.pct}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-xs font-black text-[var(--text-primary)] block">
                  {lang === 'hi' || lang === 'mr' ? item.labelHi : item.day}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-bold">
                  {item.completed}/{item.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. CATEGORY BREAKDOWN & ENCOURAGING BADGES ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-4">
          <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Category Adherence</span>
          </h3>

          <div className="space-y-3">
            {analyticsData.categoryStats.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>{cat.emoji}</span> {cat.category}
                  </span>
                  <span className="text-emerald-400 font-black">{cat.pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Positive Reinforcement & Encouragement */}
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Healthy Habit Badges</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Celebrating your consistency and mindfulness every single day!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
              <span className="text-2xl">💊</span>
              <div>
                <div className="text-xs font-black text-emerald-300">Pill Master</div>
                <div className="text-[10px] text-[var(--text-secondary)]">96% on-time dose</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2.5">
              <span className="text-2xl">💧</span>
              <div>
                <div className="text-xs font-black text-cyan-300">Hydration Hero</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Daily water goal</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5">
              <span className="text-2xl">🧠</span>
              <div>
                <div className="text-xs font-black text-purple-300">Brain Booster</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Memory exercises</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-xs font-black text-amber-300">6-Day Streak</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Active routine</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
