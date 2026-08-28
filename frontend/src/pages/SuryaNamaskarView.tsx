import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Camera,
  CameraOff,
  Flame,
  Clock,
  Heart,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { alarmAudioService } from '../services/alarmAudioService';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export interface SuryaStep {
  id: number;
  sanskritName: string;
  hindiName: string;
  marathiName: string;
  englishName: string;
  mantra: string;
  mantraMeaning: string;
  breath: 'INHALE' | 'EXHALE' | 'HOLD' | 'NORMAL';
  breathHindi: string;
  breathMarathi: string;
  breathEnglish: string;
  durationSeconds: number;
  instructionHindi: string;
  instructionMarathi: string;
  instructionEnglish: string;
  benefits: string;
  bodyVisual: 'PRAYER' | 'RAISED_ARMS' | 'FORWARD_BEND' | 'EQUESTRIAN_R' | 'PLANK' | 'EIGHT_LIMB' | 'COBRA' | 'MOUNTAIN' | 'EQUESTRIAN_L';
}

export const SURYA_NAMASKAR_STEPS: SuryaStep[] = [
  {
    id: 1,
    sanskritName: 'प्रणामासन (Pranamasana)',
    hindiName: 'प्रणामासन - नमस्कार मुद्रा',
    marathiName: 'प्रणामासन - प्रार्थना मुद्रा',
    englishName: 'Prayer Pose',
    mantra: 'ॐ मित्राय नमः (Om Mitraya Namaha)',
    mantraMeaning: 'Salutations to the friend of all living beings',
    breath: 'NORMAL',
    breathHindi: 'सामान्य श्वास',
    breathMarathi: 'सामान्य श्वास',
    breathEnglish: 'Normal Breathing',
    durationSeconds: 5,
    instructionHindi: 'सीधे खड़े हों, दोनों हाथों को छाती के सामने जोड़कर नमस्कार की मुद्रा में लाएं। मन शांत रखें।',
    instructionMarathi: 'सरळ उभे राहा, दोन्ही हात छातीजवळ जोडून नमस्कार मुद्रेत या. मन शांत ठेवा.',
    instructionEnglish: 'Stand straight with feet together, fold palms in front of chest in prayer pose. Relax your mind.',
    benefits: 'Establishes state of concentration, balance and inner peace.',
    bodyVisual: 'PRAYER'
  },
  {
    id: 2,
    sanskritName: 'हस्तोत्तानासन (Hastauttanasana)',
    hindiName: 'हस्तोत्तानासन - हस्त उत्थान मुद्रा',
    marathiName: 'हस्तोत्तानासन - हात वर करण्याची मुद्रा',
    englishName: 'Raised Arms Pose',
    mantra: 'ॐ रवये नमः (Om Ravaye Namaha)',
    mantraMeaning: 'Salutations to the radiant, shining one',
    breath: 'INHALE',
    breathHindi: 'गहरी सांस अंदर लें ⬆️',
    breathMarathi: 'दीर्घ श्वास आत घ्या ⬆️',
    breathEnglish: 'Inhale deeply ⬆️',
    durationSeconds: 5,
    instructionHindi: 'श्वास लेते हुए दोनों हाथों को ऊपर उठाएं और थोड़ा पीछे की ओर झुकें। रीढ़ की हड्डी को खिंचाव दें।',
    instructionMarathi: 'श्वास घेत दोन्ही हात वर न्या आणि थोडे मागे झुका. पाठीला हलका ताण द्या.',
    instructionEnglish: 'Inhale and raise both arms upward and gently arch backward, stretching the abdomen.',
    benefits: 'Stretches chest, tones abdominal muscles and improves oxygen uptake.',
    bodyVisual: 'RAISED_ARMS'
  },
  {
    id: 3,
    sanskritName: 'पादहस्तासन (Padahastasana)',
    hindiName: 'पादहस्तासन - हस्त पाद मुद्रा',
    marathiName: 'पादहस्तासन - पुढे वाकण्याची मुद्रा',
    englishName: 'Standing Forward Bend',
    mantra: 'ॐ सूर्याय नमः (Om Suryaya Namaha)',
    mantraMeaning: 'Salutations to the illuminator of darkness',
    breath: 'EXHALE',
    breathHindi: 'सांस बाहर छोड़ते हुए आगे झुकें ⬇️',
    breathMarathi: 'श्वास सोडत पुढे वाका ⬇️',
    breathEnglish: 'Exhale and bend forward ⬇️',
    durationSeconds: 5,
    instructionHindi: 'श्वास छोड़ते हुए कमर से आगे झुकें और हाथों से पैरों को छूने की कोशिश करें। घुटने हल्के सीधे रखें।',
    instructionMarathi: 'श्वास सोडत कंबरेतून पुढे वाका आणि हातांनी पायांना स्पर्श करा.',
    instructionEnglish: 'Exhale and bend forward from the hips, bringing hands beside feet with relaxed neck.',
    benefits: 'Enhances digestion, stimulates spinal nerves and improves blood circulation to the brain.',
    bodyVisual: 'FORWARD_BEND'
  },
  {
    id: 4,
    sanskritName: 'अश्व संचालनासन (Ashwa Sanchalanasana - Right)',
    hindiName: 'अश्व संचालनासन (दायां पैर पीछे)',
    marathiName: 'अश्व संचालनासन (उजवा पाय मागे)',
    englishName: 'Equestrian Pose (Right Leg Back)',
    mantra: 'ॐ भानवे नमः (Om Bhanave Namaha)',
    mantraMeaning: 'Salutations to the shining golden one',
    breath: 'INHALE',
    breathHindi: 'श्वास अंदर लें ⬆️',
    breathMarathi: 'श्वास आत घ्या ⬆️',
    breathEnglish: 'Inhale ⬆️',
    durationSeconds: 5,
    instructionHindi: 'श्वास लेते हुए दाएं पैर को पीछे ले जाएं, बायां घुटना मोड़ें और ऊपर की ओर देखें।',
    instructionMarathi: 'श्वास घेत उजवा पाय मागे न्या, डावा गुडघा वाकवून वर आकाशाकडे पाहा.',
    instructionEnglish: 'Inhale and push your right leg back, left knee bent at 90 degrees, gaze upward.',
    benefits: 'Strengthens leg muscles and improves balance, focus and lower back flexibility.',
    bodyVisual: 'EQUESTRIAN_R'
  },
  {
    id: 5,
    sanskritName: 'दंडासन / पर्वतासन (Dandasana)',
    hindiName: 'दंडासन - प्लैंक / पर्वत मुद्रा',
    marathiName: 'दंडासन - सरळ शरीर मुद्रा',
    englishName: 'Stick / Plank Pose',
    mantra: 'ॐ खगाय नमः (Om Khagaya Namaha)',
    mantraMeaning: 'Salutations to the leader across the cosmic sky',
    breath: 'HOLD',
    breathHindi: 'सांस रोककर रखें ⏸️',
    breathMarathi: 'श्वास रोखून धरा ⏸️',
    breathEnglish: 'Hold breath ⏸️',
    durationSeconds: 5,
    instructionHindi: 'बाएं पैर को भी पीछे ले जाएं। पूरा शरीर सिर से एड़ी तक एक सीधी रेखा में रखें।',
    instructionMarathi: 'डावा पायही मागे न्या. संपूर्ण शरीर एका रेषेत ठेवा.',
    instructionEnglish: 'Bring the other leg back, keeping body in a straight plank line from head to heels.',
    benefits: 'Strengthens core, wrists, arms and spine stability.',
    bodyVisual: 'PLANK'
  },
  {
    id: 6,
    sanskritName: 'अष्टांग नमस्कार (Ashtanga Namaskara)',
    hindiName: 'अष्टांग नमस्कार (आठ अंगों से नमन)',
    marathiName: 'अष्टांग नमस्कार (८ अवयवांचा स्पर्श)',
    englishName: 'Eight-Limbed Salutation',
    mantra: 'ॐ पूष्णे नमः (Om Pushne Namaha)',
    mantraMeaning: 'Salutations to the giver of nourishment and energy',
    breath: 'EXHALE',
    breathHindi: 'सांस छोड़ते हुए जमीन पर झुकें ⬇️',
    breathMarathi: 'श्वास सोडत खाली या ⬇️',
    breathEnglish: 'Exhale smoothly ⬇️',
    durationSeconds: 5,
    instructionHindi: 'घुटने, छाती और ठोड़ी को जमीन पर लगाएं। कूल्हों को हल्का ऊपर रखें।',
    instructionMarathi: 'गुडघे, छाती आणि हनुवटी जमिनीला लावा. कंबर हलकी वर ठेवा.',
    instructionEnglish: 'Gently lower knees, chest, and chin to the floor while keeping hips slightly elevated.',
    benefits: 'Strengthens back and chest muscles, develops humility and body control.',
    bodyVisual: 'EIGHT_LIMB'
  },
  {
    id: 7,
    sanskritName: 'भुजंगासन (Bhujangasana)',
    hindiName: 'भुजंगासन - कोबरा मुद्रा',
    marathiName: 'भुजंगासन - सर्प मुद्रा',
    englishName: 'Cobra Pose',
    mantra: 'ॐ हिरण्यगर्भाय नमः (Om Hiranyagarbhaya Namaha)',
    mantraMeaning: 'Salutations to the golden cosmic creator',
    breath: 'INHALE',
    breathHindi: 'गहरी सांस अंदर लें और छाती उठाएं ⬆️',
    breathMarathi: 'श्वास घेत छाती वर उचला ⬆️',
    breathEnglish: 'Inhale and lift chest ⬆️',
    durationSeconds: 5,
    instructionHindi: 'श्वास लेते हुए आगे खिसकें और छाती को कोबरा की तरह ऊपर उठाएं। कंधे ढीले रखें।',
    instructionMarathi: 'श्वास घेत पुढे सरका आणि छाती नागासारखी वर उचला.',
    instructionEnglish: 'Slide forward and raise your chest into Cobra pose, keeping shoulders relaxed.',
    benefits: 'Relieves back tension, stimulates memory glands and expands chest capacity.',
    bodyVisual: 'COBRA'
  },
  {
    id: 8,
    sanskritName: 'पर्वतासन (Parvatasana)',
    hindiName: 'पर्वतासन - पर्वत मुद्रा',
    marathiName: 'पर्वतासन - पर्वतासारखी मुद्रा',
    englishName: 'Mountain / Downward Dog Pose',
    mantra: 'ॐ मरीचये नमः (Om Marichaye Namaha)',
    mantraMeaning: 'Salutations to the lord of the dawn rays',
    breath: 'EXHALE',
    breathHindi: 'सांस छोड़ते हुए कूल्हे ऊपर उठाएं ⬇️',
    breathMarathi: 'श्वास सोडत कंबर वर उचला ⬇️',
    breathEnglish: 'Exhale and lift hips ⬇️',
    durationSeconds: 5,
    instructionHindi: 'श्वास छोड़ते हुए कूल्हों को ऊपर उठाएं और उल्टे V आकार में आएं। एड़ियों को जमीन की ओर दबाएं।',
    instructionMarathi: 'श्वास सोडत कंबर वर न्या, शरीराचा इंग्रजी V सारखा आकार करा.',
    instructionEnglish: 'Exhale and lift your hips up into an inverted V shape, pressing heels toward the mat.',
    benefits: 'Increases blood flow to the brain, calms anxiety and tones leg muscles.',
    bodyVisual: 'MOUNTAIN'
  },
  {
    id: 9,
    sanskritName: 'अश्व संचालनासन (Ashwa Sanchalanasana - Left)',
    hindiName: 'अश्व संचालनासन (बायां पैर आगे)',
    marathiName: 'अश्व संचालनासन (डावा पाय पुढे)',
    englishName: 'Equestrian Pose (Left Leg Forward)',
    mantra: 'ॐ आदित्याय नमः (Om Adityaya Namaha)',
    mantraMeaning: 'Salutations to the son of Aditi, the cosmic cosmic mother',
    breath: 'INHALE',
    breathHindi: 'श्वास अंदर लें ⬆️',
    breathMarathi: 'श्वास आत घ्या ⬆️',
    breathEnglish: 'Inhale ⬆️',
    durationSeconds: 5,
    instructionHindi: 'श्वास लेते हुए दाएं पैर को आगे दोनों हाथों के बीच लाएं। बायां पैर पीछे रखें और ऊपर देखें।',
    instructionMarathi: 'श्वास घेत उजवा पाय पुढे आणा आणि वर आकाशाकडे पाहा.',
    instructionEnglish: 'Inhale and step your right foot forward between hands, left knee on floor, gaze up.',
    benefits: 'Balances hip mobility, stretches hamstrings and stimulates endocrine system.',
    bodyVisual: 'EQUESTRIAN_L'
  },
  {
    id: 10,
    sanskritName: 'पादहस्तासन (Padahastasana)',
    hindiName: 'पादहस्तासन - आगे झुकने की मुद्रा',
    marathiName: 'पादहस्तासन - पुढे वाकणे',
    englishName: 'Standing Forward Bend',
    mantra: 'ॐ सवित्रे नमः (Om Savitre Namaha)',
    mantraMeaning: 'Salutations to the benevolent life-giving Sun',
    breath: 'EXHALE',
    breathHindi: 'सांस छोड़ते हुए दोनों पैर पास लाएं ⬇️',
    breathMarathi: 'श्वास सोडत पुढे वाका ⬇️',
    breathEnglish: 'Exhale and bend forward ⬇️',
    durationSeconds: 5,
    instructionHindi: 'श्वास छोड़ते हुए दूसरे पैर को भी आगे लाएं और दोनों हाथों से पैरों को छूते हुए आगे झुकें।',
    instructionMarathi: 'श्वास सोडत दुसरा पाय पुढे आणा आणि पायाला स्पर्श करा.',
    instructionEnglish: 'Exhale, step left foot forward next to right, bending forward from hips.',
    benefits: 'Enhances nervous system relaxation and massages abdominal organs.',
    bodyVisual: 'FORWARD_BEND'
  },
  {
    id: 11,
    sanskritName: 'हस्तोत्तानासन (Hastauttanasana)',
    hindiName: 'हस्तोत्तानासन - हाथ ऊपर उठाएं',
    marathiName: 'हस्तोत्तानासन - हात वर ताणणे',
    englishName: 'Raised Arms Pose',
    mantra: 'ॐ अर्काय नमः (Om Arkaya Namaha)',
    mantraMeaning: 'Salutations to the revered one worthy of praise',
    breath: 'INHALE',
    breathHindi: 'सांस लेते हुए सीधे खड़े हों और हाथ ऊपर उठाएं ⬆️',
    breathMarathi: 'श्वास घेत वर या आणि हात ताणा ⬆️',
    breathEnglish: 'Inhale, rise up and arch back ⬆️',
    durationSeconds: 5,
    instructionHindi: 'श्वास लेते हुए ऊपर उठें, हाथों को आसमान की ओर फैलाएं और हल्का पीछे झुकें।',
    instructionMarathi: 'श्वास घेत वर या, हात आकाशाकडे न्या आणि थोडे मागे झुका.',
    instructionEnglish: 'Inhale and raise arms upward, arching back gently and lengthening spine.',
    benefits: 'Improves breathing depth and relieves shoulder stiffness.',
    bodyVisual: 'RAISED_ARMS'
  },
  {
    id: 12,
    sanskritName: 'प्रणामासन / ताड़ासन (Pranamasana)',
    hindiName: 'प्रणामासन - पूर्ण नमस्कार शांति मुद्रा',
    marathiName: 'प्रणामासन - संपूर्ण शांतता मुद्रा',
    englishName: 'Mountain / Prayer Pose (Completion)',
    mantra: 'ॐ भास्कराय नमः (Om Bhaskaraya Namaha)',
    mantraMeaning: 'Salutations to the illuminator of the world',
    breath: 'EXHALE',
    breathHindi: 'सांस छोड़ते हुए विश्राम नमस्कार मुद्रा में आएं ⬇️',
    breathMarathi: 'श्वास सोडत नमस्कार मुद्रेत या ⬇️',
    breathEnglish: 'Exhale into prayer pose ⬇️',
    durationSeconds: 5,
    instructionHindi: 'श्वास छोड़ते हुए हाथों को छाती के सामने लाएं। आंखें बंद करके सूर्य ऊर्जा को महसूस करें।',
    instructionMarathi: 'श्वास सोडत हात छातीजवळ आणा आणि शांत उभे राहा.',
    instructionEnglish: 'Exhale, return hands to prayer position in front of chest. Breathe peacefully.',
    benefits: 'Harmonizes body energy, grounds thoughts and instills deep vitality.',
    bodyVisual: 'PRAYER'
  }
];

export const SuryaNamaskarView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  // Playback & Step State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SURYA_NAMASKAR_STEPS[0].durationSeconds);
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [targetRounds, setTargetRounds] = useState<number>(3);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isChairVariation, setIsChairVariation] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  const currentStep = SURYA_NAMASKAR_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / SURYA_NAMASKAR_STEPS.length) * 100);
  const caloriesBurned = parseFloat((completedRounds * 13.9 + (currentStepIndex / 12) * 13.9).toFixed(1));

  // Step Change Voice Announcement
  useEffect(() => {
    if (!isVoiceMuted) {
      announceCurrentStep(currentStepIndex);
    }
  }, [currentStepIndex, isVoiceMuted]);

  // Main Timer Progression Loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSessionTotalSeconds(prev => prev + 1);

        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Move to next step
            handleNextStepAuto();
            return SURYA_NAMASKAR_STEPS[(currentStepIndex + 1) % SURYA_NAMASKAR_STEPS.length].durationSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex]);

  const handleNextStepAuto = () => {
    if (currentStepIndex === SURYA_NAMASKAR_STEPS.length - 1) {
      // Completed 1 full round of 12 steps
      const newRounds = completedRounds + 1;
      setCompletedRounds(newRounds);
      setCurrentStepIndex(0);
      alarmAudioService.playMelody('temple_bell', 0.4);

      if (newRounds >= targetRounds) {
        setIsPlaying(false);
        setShowCelebration(true);
        saveCompletedYogaSession(newRounds);
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const announceCurrentStep = (stepIdx: number) => {
    const step = SURYA_NAMASKAR_STEPS[stepIdx];
    let speechText = '';

    if (lang === 'hi') {
      speechText = `स्टेप ${step.id}: ${step.hindiName}। ${step.mantra}। ${step.instructionHindi}`;
    } else if (lang === 'mr') {
      speechText = `पायरी ${step.id}: ${step.marathiName}। ${step.mantra}। ${step.instructionMarathi}`;
    } else {
      speechText = `Step ${step.id}: ${step.englishName}. ${step.mantra}. ${step.instructionEnglish}`;
    }

    speechService.speak(speechText, lang as any);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      alarmAudioService.playMelody('gentle_flute', 0.25);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(SURYA_NAMASKAR_STEPS[0].durationSeconds);
    setCompletedRounds(0);
    setShowCelebration(false);
  };

  const handleManualPrev = () => {
    const newIdx = currentStepIndex === 0 ? SURYA_NAMASKAR_STEPS.length - 1 : currentStepIndex - 1;
    setCurrentStepIndex(newIdx);
    setSecondsRemaining(SURYA_NAMASKAR_STEPS[newIdx].durationSeconds);
  };

  const handleManualNext = () => {
    const newIdx = (currentStepIndex + 1) % SURYA_NAMASKAR_STEPS.length;
    setCurrentStepIndex(newIdx);
    setSecondsRemaining(SURYA_NAMASKAR_STEPS[newIdx].durationSeconds);
  };

  // Camera Motion Feed Toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        alert('Could not access camera for posture tracking. Please ensure camera permissions are allowed.');
      }
    }
  };

  const saveCompletedYogaSession = async (rounds: number) => {
    try {
      await api.post('/vitals', {
        activityType: 'SURYA_NAMASKAR',
        roundsCompleted: rounds,
        caloriesBurned,
        durationMinutes: Math.round(sessionTotalSeconds / 60) || 5,
        notes: `Completed ${rounds} rounds of Surya Namaskar Motion Flow.`
      });
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* ─── Top Header Navigation ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <Link
            to="/patient"
            className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-amber-500/20 text-[var(--text-secondary)] hover:text-amber-400 border border-[var(--border)] transition-all shadow-xs"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Sun className="w-7 h-7 text-amber-400 animate-spin-slow" />
                {t('Surya Namaskar 12 Steps Motion Flow')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                12 Vedic Asanas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Interactive guided sun salutation with breath pacing, animated motion guides & voice trainer')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Senior Chair Mode Toggle */}
          <button
            onClick={() => setIsChairVariation(!isChairVariation)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              isChairVariation
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-black'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]'
            }`}
          >
            <span>🪑 {isChairVariation ? 'Chair / Gentle Senior Mode' : 'Standard Floor Mode'}</span>
          </button>

          {/* Voice Mute Toggle */}
          <button
            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
            className={`p-2.5 rounded-xl border transition-all shadow-xs ${
              isVoiceMuted
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-[var(--bg-surface-secondary)] text-amber-400 border-[var(--border)] hover:bg-amber-500/20'
            }`}
            title={isVoiceMuted ? 'Unmute Voice Trainer' : 'Mute Voice Trainer'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Camera Feed Toggle */}
          <button
            onClick={toggleCamera}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              isCameraActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]'
            }`}
          >
            {isCameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4" />}
            <span>{isCameraActive ? 'Camera AI Active' : 'Enable Camera'}</span>
          </button>
        </div>
      </div>

      {/* ─── Main Motion Stage & Video / Avatar Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left / Center: Animated Motion Asana Avatar */}
        <div
          className="lg:col-span-7 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/30 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[480px]"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Top Asana Badge & Step Count */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                Step {currentStep.id} / 12
              </span>
              <span className="text-xs font-bold text-amber-400">
                {currentStep.mantra}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                currentStep.breath === 'INHALE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : currentStep.breath === 'EXHALE'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {lang === 'mr' ? currentStep.breathMarathi : lang === 'hi' ? currentStep.breathHindi : currentStep.breathEnglish}
              </span>
            </div>
          </div>

          {/* Central Animated Motion Posture Canvas */}
          <div className="relative my-4 flex flex-col items-center justify-center min-h-[260px]">
            {/* Background Sun Glow */}
            <div className="absolute w-64 h-64 bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-yellow-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Dynamic Asana Vector Illustration Motion */}
            <div className="relative z-10 transform transition-all duration-700 ease-out scale-105">
              {renderDynamicAsanaVisual(currentStep.bodyVisual, isPlaying)}
            </div>

            {/* Timer Ring Counter */}
            <div className="mt-4 flex items-center gap-2 bg-[var(--bg-surface-secondary)] px-4 py-1.5 rounded-full border border-[var(--border)] z-10 shadow-md">
              <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-sm font-black text-[var(--text-primary)]">
                {secondsRemaining}s remaining
              </span>
            </div>
          </div>

          {/* Bottom Pose Name & Breath Guidance */}
          <div className="z-10 bg-[var(--bg-surface-secondary)]/80 p-4 rounded-2xl border border-[var(--border)] backdrop-blur-md">
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
              {lang === 'mr' ? currentStep.marathiName : lang === 'hi' ? currentStep.hindiName : currentStep.englishName}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
              {lang === 'mr' ? currentStep.instructionMarathi : lang === 'hi' ? currentStep.instructionHindi : currentStep.instructionEnglish}
            </p>
          </div>
        </div>

        {/* Right Side: Camera AI Mirror / Rounds Counter & Step List */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Camera AI Mirror Feed (if active) */}
          {isCameraActive ? (
            <div
              className="rounded-3xl p-4 border-2 border-emerald-500/40 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] shadow-lg"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Live AI Optical Pose Mirror
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 object-cover rounded-2xl transform -scale-x-100"
              />
              <p className="text-[11px] text-emerald-400 font-semibold mt-2 text-center">
                Pose aligned: Match your body silhouette with the virtual guru.
              </p>
            </div>
          ) : (
            /* Rounds & Calories Overview Card */
            <div
              className="rounded-3xl p-5 sm:p-6 border border-amber-500/20 backdrop-blur-xl shadow-lg space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" /> {t('Session Vitality')}
                </span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  Target: {targetRounds} Rounds
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-2xl font-black text-amber-400">{completedRounds}</span>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Rounds Met</p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-2xl font-black text-orange-400">{caloriesBurned}</span>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">kcal Burned</p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-center">
                  <span className="text-2xl font-black text-teal-400">
                    {Math.floor(sessionTotalSeconds / 60)}:{(sessionTotalSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-0.5">Total Time</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  <span>Round {completedRounds + 1} Progress</span>
                  <span className="text-amber-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[var(--bg-surface-secondary)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Step Navigator (1-12 Mini Steps Grid) */}
          <div
            className="rounded-3xl p-5 border border-[var(--border)] backdrop-blur-xl shadow-lg flex-1 flex flex-col justify-between"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 12 Step Sequence
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Click any step to preview</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {SURYA_NAMASKAR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setSecondsRemaining(s.durationSeconds);
                  }}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    currentStepIndex === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                      : idx < currentStepIndex
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-400/40'
                  }`}
                >
                  #{s.id}
                </button>
              ))}
            </div>

            {/* Health Note */}
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{currentStep.benefits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Flow Player Controls ──────────────────────────────────── */}
      <div
        className="rounded-3xl p-5 sm:p-6 border border-amber-500/20 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Step Navigation Prev / Next */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={handleManualPrev}
            className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-amber-500/20 text-[var(--text-primary)] border border-[var(--border)] transition shadow-xs"
            title="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black shadow-amber-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> Pause Flow
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Start Motion Flow
              </>
            )}
          </button>

          <button
            onClick={handleManualNext}
            className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-amber-500/20 text-[var(--text-primary)] border border-[var(--border)] transition shadow-xs"
            title="Next Step"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-rose-500/20 text-[var(--text-secondary)] hover:text-rose-400 border border-[var(--border)] transition shadow-xs ml-1"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Target Rounds Setting Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Target Rounds:</span>
          {[1, 3, 5, 12].map(r => (
            <button
              key={r}
              onClick={() => setTargetRounds(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition ${
                targetRounds === r
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border-[var(--border)]'
              }`}
            >
              {r} {r === 1 ? 'Round' : 'Rounds'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Celebration Modal ────────────────────────────────────────────── */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg rounded-3xl p-8 border-2 border-amber-400 text-center shadow-2xl space-y-5"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce">
              ☀️
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                सूर्य नमस्कार पूर्ण! (Completed)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
                Wonderful job! You completed {completedRounds} full rounds of Surya Namaskar. Your body is energized with vitality and mental clarity.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)]">
              <div>
                <span className="text-xl font-black text-amber-400">{completedRounds}</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Rounds</p>
              </div>
              <div>
                <span className="text-xl font-black text-orange-400">{caloriesBurned}</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">kcal</p>
              </div>
              <div>
                <span className="text-xl font-black text-emerald-400">100%</span>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Vitality</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg cursor-pointer"
              >
                Close & Return
              </button>
              <Link
                to="/patient"
                className="px-6 py-3 rounded-2xl text-xs font-black bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Dynamic Vector Pose Visualizer with Animated Joints and Posture Guidance */
function renderDynamicAsanaVisual(pose: string, isAnimated: boolean) {
  switch (pose) {
    case 'PRAYER':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          {/* Ground */}
          <line x1="30" y1="180" x2="170" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head */}
          <circle cx="100" cy="50" r="16" fill="#F59E0B" className={isAnimated ? 'animate-pulse' : ''} />
          {/* Torso */}
          <line x1="100" y1="66" x2="100" y2="120" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
          {/* Arms folded in Pranam prayer */}
          <path d="M 100 80 L 80 95 L 100 90 L 120 95 Z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="4" strokeLinejoin="round" />
          {/* Legs straight */}
          <line x1="95" y1="120" x2="95" y2="180" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
          <line x1="105" y1="120" x2="105" y2="180" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case 'RAISED_ARMS':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="30" y1="180" x2="170" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head tilted back */}
          <circle cx="108" cy="46" r="16" fill="#F59E0B" />
          {/* Arched Torso */}
          <path d="M 98 120 Q 90 90 106 62" fill="transparent" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
          {/* Raised Arms reaching back */}
          <line x1="102" y1="68" x2="128" y2="28" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
          <line x1="102" y1="68" x2="120" y2="26" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
          {/* Legs */}
          <line x1="96" y1="120" x2="96" y2="180" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
          <line x1="104" y1="120" x2="104" y2="180" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case 'FORWARD_BEND':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="30" y1="180" x2="170" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head near knees */}
          <circle cx="95" cy="145" r="14" fill="#F59E0B" />
          {/* Folded Torso */}
          <path d="M 120 120 L 115 75 L 98 132" fill="transparent" stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms reaching to toes */}
          <line x1="100" y1="105" x2="88" y2="178" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
          {/* Legs */}
          <line x1="120" y1="120" x2="120" y2="180" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case 'EQUESTRIAN_R':
    case 'EQUESTRIAN_L':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="20" y1="180" x2="180" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head looking up */}
          <circle cx="95" cy="65" r="14" fill="#F59E0B" />
          {/* Torso */}
          <path d="M 105 130 L 98 80" fill="transparent" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
          {/* Front Bent Leg */}
          <path d="M 105 130 L 75 145 L 75 180" fill="transparent" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Back Extended Leg */}
          <path d="M 105 130 L 145 160 L 175 180" fill="transparent" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hands on Ground */}
          <line x1="96" y1="95" x2="70" y2="180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );

    case 'PLANK':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="20" y1="180" x2="180" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head */}
          <circle cx="55" cy="115" r="14" fill="#F59E0B" />
          {/* Plank Line Body */}
          <line x1="65" y1="125" x2="165" y2="165" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
          {/* Supporting Arms */}
          <line x1="75" y1="130" x2="75" y2="180" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
          {/* Feet on Ground */}
          <circle cx="165" cy="175" r="5" fill="#14B8A6" />
        </svg>
      );

    case 'EIGHT_LIMB':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="20" y1="180" x2="180" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head on floor */}
          <circle cx="50" cy="165" r="12" fill="#F59E0B" />
          {/* Chest on floor, hips elevated */}
          <path d="M 60 170 L 85 170 L 115 140 L 140 170 L 165 178" fill="transparent" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hands by chest */}
          <line x1="80" y1="165" x2="80" y2="180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );

    case 'COBRA':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="20" y1="180" x2="180" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head arched high */}
          <circle cx="68" cy="85" r="14" fill="#F59E0B" />
          {/* Cobra Curving Spine */}
          <path d="M 72 98 Q 78 140 120 170 L 175 178" fill="transparent" stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms pushing floor */}
          <line x1="80" y1="125" x2="80" y2="180" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );

    case 'MOUNTAIN':
      return (
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-xl">
          <line x1="20" y1="180" x2="180" y2="180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Head looking down */}
          <circle cx="78" cy="140" r="14" fill="#F59E0B" />
          {/* Inverted V Mountain Body */}
          <path d="M 60 180 L 105 90 L 155 180" fill="transparent" stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms along slope */}
          <line x1="100" y1="100" x2="60" y2="180" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg width="220" height="220" viewBox="0 0 200 200">
          <circle cx="100" cy="50" r="16" fill="#F59E0B" />
          <line x1="100" y1="66" x2="100" y2="120" stroke="#10B981" strokeWidth="10" />
        </svg>
      );
  }
}

export default SuryaNamaskarView;
