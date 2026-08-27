import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Lightbulb, Clock, Check, X, ArrowRight, Droplets, Calendar } from 'lucide-react';
import { speechService } from '../services/speechService';

interface AabhaSuggestionsWidgetProps {
  onApplySpacing?: () => void;
  onLogHydration?: () => void;
}

export const AabhaSuggestionsWidget: React.FC<AabhaSuggestionsWidgetProps> = ({
  onApplySpacing,
  onLogHydration
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [appliedMsg, setAppliedMsg] = useState('');

  const suggestions = [
    {
      id: 'sug-1',
      title: lang === 'mr' ? 'पुढील क्रियाकलाप २० मिनिटांत आहे' : lang === 'hi' ? 'अगला कार्य 20 मिनट में है' : 'Next activity in 20 minutes',
      desc: lang === 'mr'
        ? 'दुपारचे जेवण आणि मेमेंटाइन औषध (01:00 PM). तयारी सुरू करा.'
        : lang === 'hi'
        ? 'दोपहर का भोजन और मेमेंटाइन दवा (01:00 PM)। तैयार हो जाइए।'
        : 'Lunch & Memantine HCl scheduled at 01:00 PM.',
      icon: '⏰',
      actionLabel: lang === 'mr' ? 'तपासा' : lang === 'hi' ? 'देखें' : 'Review',
      onAction: () => {
        setAppliedMsg('Reminder verified!');
        setTimeout(() => setAppliedMsg(''), 2500);
      }
    },
    {
      id: 'sug-2',
      title: lang === 'mr' ? 'सकाळच्या कामांमध्ये १५ मिनिटांचे अंतर ठेवा' : lang === 'hi' ? 'सुबह के कार्यों में 15 मिनट का अंतर रखें' : 'Optimize Morning Routine Spacing',
      desc: lang === 'mr'
        ? 'तुमची सकाळची औषधे आणि नाश्ता खूप जवळ आहेत. १५ मिनिटांचे अंतर ठेवल्यास सोपे जाईल.'
        : lang === 'hi'
        ? 'आपकी सुबह की दवा और नाश्ता बहुत पास-पास हैं। 15 मिनट का अंतर रखने से आराम रहेगा।'
        : 'Your morning has several activities close together. Would you like to space them comfortably by 15 minutes?',
      icon: '📅',
      actionLabel: lang === 'mr' ? 'सल्ला लागू करा' : lang === 'hi' ? 'सुझाव लागू करें' : 'Apply Spacing',
      onAction: () => {
        if (onApplySpacing) onApplySpacing();
        setAppliedMsg(lang === 'hi' ? 'सुझाव लागू किया गया!' : 'Spacing Applied!');
        setTimeout(() => setAppliedMsg(''), 2500);
      }
    },
    {
      id: 'sug-3',
      title: lang === 'mr' ? 'शरीर ताजेतवाने ठेवण्यासाठी पाणी प्या' : lang === 'hi' ? 'ताजा पानी पीने की याद' : 'Hydration Reminder',
      desc: lang === 'mr'
        ? 'गेल्या २ तासांत पाणी पिण्याची नोंद नाही. १ ग्लास कोमट पाणी प्या.'
        : lang === 'hi'
        ? 'पिछले 2 घंटों में पानी पीने का लॉग नहीं मिला। 1 गिलास पानी पीजिए।'
        : 'You have not logged water in the last 2 hours. Drink a glass of water.',
      icon: '💧',
      actionLabel: lang === 'mr' ? '+१ ग्लास पाणी नोंदवा' : lang === 'hi' ? '+1 गिलास पानी' : '+1 Glass Water',
      onAction: () => {
        if (onLogHydration) onLogHydration();
        setAppliedMsg(lang === 'hi' ? 'पानी का ग्लास लॉग हो गया!' : 'Logged 1 Glass!');
        setTimeout(() => setAppliedMsg(''), 2500);
      }
    }
  ];

  if (dismissed || suggestions.length === 0) return null;

  const current = suggestions[activeSuggestionIdx % suggestions.length];

  return (
    <div className="card-3d bg-gradient-to-r from-purple-950/30 via-[var(--card-bg-inline)] to-indigo-950/20 border-2 border-purple-400/30 rounded-[24px] p-5 shadow-xl backdrop-blur-xl font-sans space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center text-base">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
              AABHA Suggestions
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Intelligent Routine Optimizations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSuggestionIdx((prev) => (prev + 1) % suggestions.length)}
            className="text-[11px] font-bold text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 cursor-pointer"
          >
            Next ➔
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-white bg-white/5"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Body */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-secondary)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5">{current.icon}</span>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
              {current.title}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 leading-relaxed">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 self-end sm:self-center">
          {appliedMsg ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {appliedMsg}
            </span>
          ) : (
            <button
              type="button"
              onClick={current.onAction}
              className="btn-glow px-4 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
