import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  FileText,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Heart,
  Users,
  Activity,
  AlertTriangle,
  Stethoscope,
  Phone,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  FolderOpen,
  HelpCircle,
  Share2
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';
import { ambientMusic } from '../services/ambientMusicService';

type SpeakerId = 'narrator' | 'father' | 'daughter' | 'doctor' | 'aabha';

interface DialogueLine {
  speaker: SpeakerId;
  speakerName: string;
  speakerEmoji: string;
  text: string;
  textHindi: string;
}

interface SceneConfig {
  id: number;
  startSec: number;
  endSec: number;
  sceneNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  bgGradient: string;
  visualAtmosphere: string;
  visualElements: {
    icon: string;
    label: string;
    desc: string;
  }[];
  activeCardProps: {
    title: string;
    subtitle: string;
    tag: string;
    iconEmoji: string;
  };
  dialogues: DialogueLine[];
}

const SPEAKER_PROFILES: Record<SpeakerId, { pitch: number; rate: number; label: string; color: string; bgColor: string }> = {
  father: {
    pitch: 0.82,
    rate: 0.90,
    label: '👴 Father (Papa)',
    color: 'text-amber-600 dark:text-amber-300',
    bgColor: 'bg-amber-500/20 border-amber-400'
  },
  daughter: {
    pitch: 1.25,
    rate: 1.05,
    label: '👩 Daughter (Beta)',
    color: 'text-pink-600 dark:text-pink-300',
    bgColor: 'bg-pink-500/20 border-pink-400'
  },
  doctor: {
    pitch: 1.05,
    rate: 1.02,
    label: '👨‍⚕️ Doctor',
    color: 'text-cyan-600 dark:text-cyan-300',
    bgColor: 'bg-cyan-500/20 border-cyan-400'
  },
  aabha: {
    pitch: 1.15,
    rate: 1.02,
    label: '🤖 AABHA AI Assistant',
    color: 'text-purple-600 dark:text-purple-300',
    bgColor: 'bg-purple-500/20 border-purple-400'
  },
  narrator: {
    pitch: 1.00,
    rate: 1.02,
    label: '🎙️ Voiceover Narrator',
    color: 'text-indigo-600 dark:text-indigo-300',
    bgColor: 'bg-indigo-500/20 border-indigo-400'
  }
};

const MASTER_SCENES: SceneConfig[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 25,
    sceneNumber: 'SCENE 1',
    title: 'THE PROBLEM: Missing Health History in Files',
    subtitle: 'Medical files, scattered prescriptions, and the struggle to find reports',
    badge: '0:00 – 0:25 • THE SCATTERED FILES',
    bgGradient: 'from-stone-900 via-amber-950/70 to-slate-950',
    visualAtmosphere: 'Dark, desaturated Indian living room with paper clutter',
    visualElements: [
      { icon: '📁', label: 'Purani Files Ka Dher', desc: 'Blood reports, X-rays aur prescriptions table par bikhre hain' },
      { icon: '🔍', label: 'Missing History', desc: 'Pichhli report dhundhne mein waqt barbaad' },
      { icon: '⌛', label: 'Unorganized Care', desc: 'Ek report ghar par, ek clinic par' }
    ],
    activeCardProps: {
      title: 'Scattered Physical Paper Records',
      subtitle: 'India mein hum health ka khayal rakhte hain, par history sambhal nahi paate.',
      tag: 'Problem Statement',
      iconEmoji: '📑'
    },
    dialogues: [
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerEmoji: '👴',
        text: 'Beta… woh meri pichhli blood report kahan rakhi thi? Dr. Verma ne maangi thi.',
        textHindi: 'बेटा… वो मेरी पिछली ब्लड रिपोर्ट कहाँ रखी थी? डॉक्टर साहब ने माँगी थी।'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerEmoji: '👩',
        text: 'Papa, pata nahi… shayad purani file mein hai. Ek second main dhundti hoon.',
        textHindi: 'पापा, पता नहीं… शायद पुरानी फाइल में है। एक सेकंड मैं ढूँढती हूँ।'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'In India, we care for our health… but often lose track of our health history. One report at home, one prescription with the doctor, and years of medical history lost among files.',
        textHindi: 'भारत में हम अपनी सेहत का ख्याल रखते हैं… लेकिन अक्सर अपनी हेल्थ की हिस्ट्री को संभाल नहीं पाते। एक रिपोर्ट घर पर… एक पर्चा डॉक्टर के पास… और पुरानी हिस्ट्री फाइलों के बीच खो जाती है।'
      }
    ]
  },
  {
    id: 2,
    startSec: 25,
    endSec: 55,
    sceneNumber: 'SCENE 2',
    title: 'THE CRITICAL MOMENT: Emergency Hospital Visit',
    subtitle: 'Late night medical crisis where missing health information costs critical minutes',
    badge: '0:25 – 0:55 • EMERGENCY CLINIC',
    bgGradient: 'from-rose-950 via-slate-950 to-indigo-950',
    visualAtmosphere: 'Urgent red & blue hospital lighting, ticking clock',
    visualElements: [
      { icon: '🚨', label: 'Late Night Crisis', desc: 'Achanak tabiyat kharab hona' },
      { icon: '🩺', label: 'Doctor Inquires', desc: 'Previous medication aur reports ki maang' },
      { icon: '⏱️', label: 'Ticking Clock', desc: 'Emergency mein information ka missing hona' }
    ],
    activeCardProps: {
      title: 'Information Crisis in Emergency',
      subtitle: 'Emergency mein problem sirf bimari nahi hoti — problem hoti hai information ka missing hona.',
      tag: 'Critical Impact',
      iconEmoji: '🚨'
    },
    dialogues: [
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerEmoji: '👩',
        text: 'Papa ko achanak bechaini ho rahi hai… Papa, chaliye abhi hospital chalte hain!',
        textHindi: 'पापा को अचानक बेचैनी हो रही है… पापा, चलिए अभी हॉस्पिटल चलते हैं!'
      },
      {
        speaker: 'doctor',
        speakerName: 'Doctor',
        speakerEmoji: '👨‍⚕️',
        text: 'Previous reports hain aapke paas? Pehle koi heart ya BP ki medication chal rahi hai kya?',
        textHindi: 'Previous reports हैं आपके पास? पहले कोई BP या शुगर की medication चल रही है क्या?'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerEmoji: '👩',
        text: 'Sir… kuch reports hain, lekin complete history nahi mil rahi. Purani file ghar par reh gayi.',
        textHindi: 'सर… कुछ रिपोर्ट्स हैं, लेकिन कम्प्लीट हिस्ट्री नहीं मिल रही। पुरानी फाइल घर पर रह गई।'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'In an emergency, the real danger is not just the illness… The real danger is missing critical information.',
        textHindi: 'इमरजेंसी में प्रॉब्लम सिर्फ बीमारी नहीं होती… प्रॉब्लम होती है — जानकारी का मिसिंग होना।'
      }
    ]
  },
  {
    id: 3,
    startSec: 55,
    endSec: 80,
    sceneNumber: 'SCENE 3',
    title: 'AABHA AI INTRODUCTION: Your Health in Your Phone',
    subtitle: 'The dark screen illuminates with an intelligent, organized health companion',
    badge: '0:55 – 1:20 • PRODUCT REVEAL',
    bgGradient: 'from-indigo-950 via-purple-950 to-cyan-950',
    visualAtmosphere: 'Futuristic blue & white illumination, illuminated phone screen',
    visualElements: [
      { icon: '✨', label: 'Illuminated Screen', desc: 'Dark screen illuminates with futuristic AABHA glow' },
      { icon: '📱', label: 'Organized Health', desc: 'All records beautifully structured in phone' },
      { icon: '🤖', label: 'Intelligent AI', desc: 'Your personal cognitive health companion' }
    ],
    activeCardProps: {
      title: 'Meet AABHA AI: Intelligent Health Companion',
      subtitle: 'Agar aapki health information phone mein organized, accessible aur intelligent way mein ho?',
      tag: 'The Solution',
      iconEmoji: '✨'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'Lekin sochiye… agar aapki health ki important information… aapke phone mein… organized, accessible aur intelligent way mein available ho?',
        textHindi: 'लेकिन सोचिए… अगर आपकी हेल्थ की इम्पोर्टेन्ट इन्फॉर्मेशन… आपके फोन में… ऑर्गनाइज़्ड, एक्सेसिबल और इंटेलिजेंट तरीके से मौजूद हो?'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'Meet AABHA AI. Your intelligent health companion. Ab health records sirf files mein nahi, aapke saath hain.',
        textHindi: 'मिलिए आभा एआई से। आपकी इंटेलिजेंट हेल्थ साथी। अब हेल्थ रिकॉर्ड्स सिर्फ फाइलों में नहीं, आपके साथ हैं।'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerEmoji: '🤖',
        text: 'Namaste! Main hoon AABHA AI. Aapke prescriptions, lab reports aur medical timeline ko samajhna ab behad aasan hai.',
        textHindi: 'नमस्ते! मैं हूँ आभा एआई। आपके प्रिस्क्रिप्शन्स, लैब रिपोर्ट्स और मेडिकल टाइमलाइन को समझना अब बेहद आसान है।'
      }
    ]
  },
  {
    id: 4,
    startSec: 80,
    endSec: 125,
    sceneNumber: 'SCENE 4',
    title: 'HOW IT WORKS: 3-Step Intelligent Health Journey',
    subtitle: '1. Clean Timeline • 2. AI Understands Health • 3. Ask Your Health AI',
    badge: '1:20 – 2:05 • 3-STEP ENGINE',
    bgGradient: 'from-teal-950 via-slate-900 to-indigo-950',
    visualAtmosphere: 'Live UI app recordings, interactive AI chat, timeline flow',
    visualElements: [
      { icon: '📅', label: '1. Digital Timeline', desc: 'Old report ➔ Digital record, Prescription ➔ Medicine info' },
      { icon: '🧠', label: '2. AI Explains Health', desc: 'Complex medical jargon translated to simple language' },
      { icon: '💬', label: '3. Ask Health AI', desc: '"Ye medicine kisliye hai?" ➔ Instant clear answers' }
    ],
    activeCardProps: {
      title: 'Simple Digital Health Experience',
      subtitle: 'Questions poochiye. Records ko samajhiye. Apni health journey ko better way mein track kijiye.',
      tag: 'Interactive Tech',
      iconEmoji: '⚡'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'AABHA AI transforms physical files into a clean health timeline. Old reports become digital records; prescriptions become live medicine reminders.',
        textHindi: 'आभा एआई आपकी हेल्थ इन्फॉर्मेशन को एक साफ़ टाइमलाइन में बदल देती है। पुरानी रिपोर्ट्स डिजिटल रिकॉर्ड बन जाती हैं।'
      },
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerEmoji: '👴',
        text: 'Aabha, meri recent blood report mein kya important hai? Aur ye Donepezil medicine kisliye hai?',
        textHindi: 'आभा, मेरी हालिया ब्लड रिपोर्ट में क्या खास है? और ये डोनेपेज़िल दवाई किसलिए है?'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerEmoji: '🤖',
        text: 'Arun ji, aapka BP aur sugar normal hai. Donepezil memory aur daily focus support ke liye hai, jo subah 8:30 baje leni hoti hai!',
        textHindi: 'अरुण जी, आपकी रिपोर्ट सामान्य है। डोनेपेज़िल आपकी याददाश्त और फोकस के लिए है, जो सुबह 8:30 बजे नाश्ते के बाद लेनी है!'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'Ask questions. Understand complex records in simple words. Empower your health journey with complete clarity.',
        textHindi: 'सवाल्स पूछिए। रिपोर्ट्स को सरल भाषा में समझिए। अपनी सेहत के सफर को बेहतर तरीके से ट्रैक कीजिए।'
      }
    ]
  },
  {
    id: 5,
    startSec: 125,
    endSec: 150,
    sceneNumber: 'SCENE 5',
    title: 'THE DOCTOR EXPERIENCE: Contextual Consultations',
    subtitle: 'Doctors get instant historical context instead of starting from zero',
    badge: '2:05 – 2:30 • CLINIC CONSULTATION',
    bgGradient: 'from-cyan-950 via-slate-900 to-purple-950',
    visualAtmosphere: 'Professional hospital consultation room, doctor smiling at phone summary',
    visualElements: [
      { icon: '🩺', label: 'Instant Context', desc: 'Pichhle 6 mahine ka complete timeline ek tap mein' },
      { icon: '📈', label: '4-Pillar Radar', desc: 'Memory, Attention, Reaction Speed & Consistency' },
      { icon: '🤝', label: 'Better Decisions', desc: 'No guesswork; accurate diagnostics & treatment' }
    ],
    activeCardProps: {
      title: 'Empowering Doctors with Context',
      subtitle: 'Jab information organized hoti hai, toh conversation sirf "aaj kya hua?" se shuru nahi hoti.',
      tag: 'Clinical Value',
      iconEmoji: '🩺'
    },
    dialogues: [
      {
        speaker: 'doctor',
        speakerName: 'Doctor',
        speakerEmoji: '👨‍⚕️',
        text: 'Achha! Aapke phone mein pichhle 6 mahine ki complete history, dosage aur cognitive trend ek jagah hai! Ab mujhe complete context samajh aa raha hai.',
        textHindi: 'अच्छा! आपके फोन में पिछले 6 महीने की कम्प्लीट हिस्ट्री और टाइमलाइन एक जगह है! अब मुझे आपकी पूरी स्थिति समझ आ रही है।'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'When health information is structured, consultations do not start with "what happened today?". Doctors gain instant context for faster, more accurate care.',
        textHindi: 'जब इन्फॉर्मेशन ऑर्गनाइज़्ड होती है… तो बातचीत सिर्फ "आज क्या हुआ?" से शुरू नहीं होती। डॉक्टर के पास आपकी पूरी हेल्थ स्टोरी समझने का बेहतर कॉन्टेक्स्ट होता है।'
      }
    ]
  },
  {
    id: 6,
    startSec: 150,
    endSec: 170,
    sceneNumber: 'SCENE 6',
    title: 'EMOTIONAL PAYOFF: Peace of Mind for Families',
    subtitle: 'No more lost files — your health story stays with you forever',
    badge: '2:30 – 2:50 • FAMILY RELIEF',
    bgGradient: 'from-amber-950 via-purple-950 to-slate-950',
    visualAtmosphere: 'Warm golden hour home lighting, relaxed happy father & daughter',
    visualElements: [
      { icon: '🏡', label: 'Peace of Mind', desc: 'Ghar par relaxed baithkar muskurahat' },
      { icon: '❤️', label: 'Dignified Care', desc: 'Files dhundhne ki chinta khatam' },
      { icon: '📱', label: 'Health in Pocket', desc: 'Aapki health story aapke saath' }
    ],
    activeCardProps: {
      title: 'Lifelong Health Dignity',
      subtitle: 'Ab woh purani report dhundhne ki zarurat nahi padegi. Ab aapki health story aapke saath rahegi.',
      tag: 'Emotional Payoff',
      iconEmoji: '❤️'
    },
    dialogues: [
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerEmoji: '👴',
        text: 'Toh ab woh purani file aur purani report dhundhne ki zarurat nahi padegi beta?',
        textHindi: 'तो अब वो पुरानी फाइल और पुरानी रिपोर्ट ढूँढने की ज़रूरत नहीं पड़ेगी बेटा?'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerEmoji: '👩',
        text: 'Nahi Papa! Ab aapki poori health story… hamesha aapke phone mein, aapke saath rahegi!',
        textHindi: 'नहीं पापा! अब आपकी पूरी हेल्थ स्टोरी… हमेशा आपके फोन में, आपके साथ रहेगी!'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'No more frantic searches for lost prescriptions. Just calm, empowered, independent living.',
        textHindi: 'फाइलों के खोने का डर हमेशा के लिए खत्म। सिर्फ सुकून, आजादी और आत्मनिर्भर जीवन।'
      }
    ]
  },
  {
    id: 7,
    startSec: 170,
    endSec: 180,
    sceneNumber: 'SCENE 7',
    title: 'FINAL BRAND MOMENT: Your Health. Your Story. Your AI.',
    subtitle: 'Because your health story deserves to be remembered • SIH26003',
    badge: '2:50 – 3:00 • GRAND FINALE',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    visualAtmosphere: 'Cinematic glowing gold AABHA AI crest & official link banner',
    visualElements: [
      { icon: '🏆', label: 'SIH26003 Gold', desc: 'Pan-India AI Health Innovation' },
      { icon: '🌐', label: 'Live Prototype', desc: 'aabha-ai.vercel.app/patient' },
      { icon: '🇮🇳', label: 'For All Generations', desc: 'Kids, Adults, Seniors & Doctors' }
    ],
    activeCardProps: {
      title: 'AABHA AI — Your Health. Your Story. Your AI.',
      subtitle: 'Health sirf ek report nahi hai, health ek journey hai. Usse organize karna — ye hai AABHA AI.',
      tag: 'Final Brand Vision',
      iconEmoji: '🏆'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerEmoji: '🎙️',
        text: 'Health is not just a single report. Health is a lifelong journey. To understand it… to organize it… and to empower it… This is AABHA AI.',
        textHindi: 'हेल्थ सिर्फ एक रिपोर्ट नहीं है। हेल्थ एक सफर है। उस सफर को समझना… उसे ऑर्गनाइज़ करना… और उस पर भरोसा पाना… ये है आभा एआई।'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerEmoji: '🤖',
        text: 'AABHA AI — Because your health story deserves to be remembered. Experience now at aabha-ai.vercel.app!',
        textHindi: 'आभा एआई — क्योंकि आपकी सेहत की कहानी हमेशा याद रखी जानी चाहिए। अभी अनुभव कीजिए!'
      }
    ]
  }
];

interface OneMinuteDemoExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneMinuteDemoExperience: React.FC<OneMinuteDemoExperienceProps> = ({
  isOpen,
  onClose
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceoverOn, setIsVoiceoverOn] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'EN' | 'HI'>('HI'); // Default Hinglish / Hindi
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerId>('narrator');

  const totalSeconds = 180; // 3 Minutes (0:00 to 3:00)
  const timerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(true);
  const isVoiceoverOnRef = useRef<boolean>(true);
  const voiceLangRef = useRef<'EN' | 'HI'>('HI');
  const stageDialogueIdxRef = useRef<number>(0);
  const currentStageIdRef = useRef<number>(1);

  // Sync ref values
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isVoiceoverOnRef.current = isVoiceoverOn;
    voiceLangRef.current = voiceLang;
  }, [isPlaying, isVoiceoverOn, voiceLang]);

  // Chrome speech synthesis heartbeat to prevent browser speech timeout bug
  useEffect(() => {
    heartbeatRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 8000);

    return () => clearInterval(heartbeatRef.current);
  }, []);

  // Stop Speech helper
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  };

  // Play next continuous dialogue with character voice tuning
  const playCharacterDialogue = (stage: SceneConfig, dialogueIndex: number) => {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      !isVoiceoverOnRef.current ||
      !isPlayingRef.current
    ) {
      return;
    }

    const dialogues = stage.dialogues;
    const safeIdx = dialogueIndex % dialogues.length;
    const currentLine = dialogues[safeIdx];
    const speakerProfile = SPEAKER_PROFILES[currentLine.speaker] || SPEAKER_PROFILES.narrator;
    const textToSpeak = voiceLangRef.current === 'HI' ? currentLine.textHindi : currentLine.text;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      utterance.pitch = speakerProfile.pitch;
      utterance.rate = speakerProfile.rate;
      utterance.lang = voiceLangRef.current === 'HI' ? 'hi-IN' : 'en-US';

      // Pick matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (currentLine.speaker === 'daughter') {
        const femaleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Jenny'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else if (currentLine.speaker === 'father') {
        const maleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George'))
        );
        if (maleVoice) utterance.voice = maleVoice;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setCurrentDialogueIdx(safeIdx);
        setActiveSpeaker(currentLine.speaker);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (isPlayingRef.current && isVoiceoverOnRef.current) {
          const nextIdx = safeIdx + 1;
          stageDialogueIdxRef.current = nextIdx;
          setTimeout(() => {
            if (isPlayingRef.current && isVoiceoverOnRef.current) {
              const currentS =
                MASTER_SCENES.find(s => s.id === currentStageIdRef.current) || stage;
              playCharacterDialogue(currentS, nextIdx);
            }
          }, 120);
        }
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      isSpeakingRef.current = false;
    }
  };

  // Lifecycle & Ambient Music setup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSeconds(0);
      setIsPlaying(true);
      currentStageIdRef.current = 1;
      stageDialogueIdxRef.current = 0;

      if (isMusicOn) {
        ambientMusic.start(0.06);
      }

      playCharacterDialogue(MASTER_SCENES[0], 0);
    } else {
      document.body.style.overflow = '';
      stopSpeech();
      ambientMusic.stop();
    }
    return () => {
      document.body.style.overflow = '';
      stopSpeech();
      ambientMusic.stop();
    };
  }, [isOpen]);

  // 180-Second Timer with Automatic Playback
  useEffect(() => {
    if (isOpen && isPlaying) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, isPlaying]);

  // Current stage tracker based on seconds
  const currentScene =
    MASTER_SCENES.find(s => seconds >= s.startSec && seconds < s.endSec) ||
    MASTER_SCENES[MASTER_SCENES.length - 1];

  // Trigger continuous speech on stage transition
  useEffect(() => {
    if (isOpen && isPlaying && isVoiceoverOn && currentScene.id !== currentStageIdRef.current) {
      currentStageIdRef.current = currentScene.id;
      stageDialogueIdxRef.current = 0;
      playCharacterDialogue(currentScene, 0);
    }
  }, [currentScene.id, isOpen, isPlaying, isVoiceoverOn, voiceLang]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else if (isVoiceoverOn) {
          playCharacterDialogue(currentScene, stageDialogueIdxRef.current);
        }
      }
    }
  };

  const handleRestart = () => {
    stopSpeech();
    setSeconds(0);
    currentStageIdRef.current = 1;
    stageDialogueIdxRef.current = 0;
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (isMusicOn) {
      ambientMusic.start(0.06);
    }
    playCharacterDialogue(MASTER_SCENES[0], 0);
  };

  const handleJumpToScene = (scene: SceneConfig) => {
    stopSpeech();
    setSeconds(scene.startSec);
    currentStageIdRef.current = scene.id;
    stageDialogueIdxRef.current = 0;
    playCharacterDialogue(scene, 0);
  };

  const handleToggleVoiceover = () => {
    if (isVoiceoverOn) {
      stopSpeech();
      setIsVoiceoverOn(false);
      isVoiceoverOnRef.current = false;
    } else {
      setIsVoiceoverOn(true);
      isVoiceoverOnRef.current = true;
      playCharacterDialogue(currentScene, stageDialogueIdxRef.current);
    }
  };

  const handleToggleMusic = () => {
    if (isMusicOn) {
      ambientMusic.stop();
      setIsMusicOn(false);
    } else {
      ambientMusic.start(0.06);
      setIsMusicOn(true);
    }
  };

  const handleToggleLang = () => {
    stopSpeech();
    const nextLang = voiceLang === 'EN' ? 'HI' : 'EN';
    setVoiceLang(nextLang);
    voiceLangRef.current = nextLang;
    playCharacterDialogue(currentScene, 0);
  };

  const handleClose = () => {
    stopSpeech();
    ambientMusic.stop();
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentDialogues = currentScene.dialogues;
  const activeLine = currentDialogues[currentDialogueIdx % currentDialogues.length] || currentDialogues[0];
  const activeSpeakerProfile = SPEAKER_PROFILES[activeLine.speaker] || SPEAKER_PROFILES.narrator;
  const activeSubtitle = voiceLang === 'HI' ? activeLine.textHindi : activeLine.text;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/92 backdrop-blur-2xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-6xl bg-[var(--bg-surface)] rounded-[24px] sm:rounded-[36px] border border-purple-500/30 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP CINEMATIC HEADER BAR ────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm">
                🎬
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-purple-300 via-teal-300 to-amber-200 bg-clip-text text-transparent">
                  AABHA AI • OFFICIAL CINEMATIC FILM
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  Full 3-Minute Story
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium hidden sm:block">
                “Ab Health Records Sirf Files Mein Nahi, Aapke Saath Hain”
              </div>
            </div>
          </div>

          {/* Controls: Voiceover + Music + Lang + Timer + Play/Pause + Restart + Close */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Ambient Background Music Toggle */}
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                isMusicOn
                  ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                  : 'bg-white/10 border-white/15 text-slate-400'
              }`}
              title={isMusicOn ? 'Background Music ON' : 'Background Music Muted'}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicOn ? 'text-purple-400 animate-bounce' : ''}`} />
              <span className="hidden lg:inline text-[11px]">{isMusicOn ? 'BGM ON' : 'BGM OFF'}</span>
            </button>

            {/* Audio Voiceover Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoiceover}
              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                isVoiceoverOn
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 border-white/15 text-slate-400'
              }`}
              title={isVoiceoverOn ? 'Characters Speaking Aloud' : 'Voiceover Muted'}
            >
              {isVoiceoverOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline text-[11px]">{isVoiceoverOn ? 'Voices ON' : 'Muted'}</span>
            </button>

            {/* Language Switcher (Hinglish/HI vs EN) */}
            <button
              type="button"
              onClick={handleToggleLang}
              className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-white transition cursor-pointer border border-white/15"
              title="Switch Language"
            >
              {voiceLang === 'HI' ? '🇮🇳 Hinglish' : '🇺🇸 English'}
            </button>

            {/* Countdown Timer */}
            <div className="px-2 sm:px-2.5 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs sm:text-sm font-black text-emerald-400">
              {formatTime(seconds)} / 03:00
            </div>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title={isPlaying ? 'Pause Movie' : 'Resume Movie'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title="Restart 3-Min Film"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer border border-rose-500/30 ml-0.5"
              title="Exit Movie"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ─── TIMELINE PROGRESS BAR & 7 MASTER SCENES STEPPER ─────────────── */}
        <div className="bg-[var(--bg-surface-secondary)] px-3 sm:px-8 py-2 border-b border-[var(--border)] space-y-1.5 shrink-0">
          {/* Continuous Timeline Line */}
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${(seconds / totalSeconds) * 100}%` }}
            />
          </div>

          {/* Stepper Pills for all 7 Scenes */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {MASTER_SCENES.map(s => {
              const isCurrent = s.id === currentScene.id;
              const isPassed = seconds >= s.endSec;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleJumpToScene(s)}
                  className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-purple-600 text-white font-black border-purple-500 shadow-md scale-105'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-purple-400'
                  }`}
                >
                  <span>{s.sceneNumber}</span>
                  <span className="hidden md:inline">• {s.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── LIVE DIALOGUE & CINEMATIC CAPTION TICKER ────────────────────── */}
        <div className="px-3.5 sm:px-8 py-2.5 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-teal-500/15 border-b border-purple-400/20 flex items-center justify-between gap-3 shrink-0 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            {/* Active Character Speaking Tag */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 shrink-0 border shadow-xs ${activeSpeakerProfile.bgColor} ${activeSpeakerProfile.color}`}>
              <Radio className="w-3.5 h-3.5 animate-pulse text-current" />
              <span>{activeLine.speakerEmoji} {activeLine.speakerName}:</span>
            </span>

            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] italic leading-relaxed animate-fade-in line-clamp-1">
              "{activeSubtitle}"
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">
            <span>{currentScene.badge.split('•')[0]}</span>
          </div>
        </div>

        {/* ─── DYNAMIC CINEMATIC STAGE & APP SCREENPLAY ────────────────────── */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
          {/* 🎬 CINEMATIC SCENE SPOTLIGHT BOX ──────────────────────────────── */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-br ${currentScene.bgGradient} border border-white/15 text-white shadow-2xl relative overflow-hidden transition-all duration-700 space-y-4`}>
            {/* Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <div className="space-y-0.5">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-purple-200 backdrop-blur-md">
                  {currentScene.sceneNumber} • {currentScene.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {currentScene.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 font-medium">
                  {currentScene.subtitle}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Visual Setting</span>
                <span className="text-xs font-bold text-teal-300">{currentScene.visualAtmosphere}</span>
              </div>
            </div>

            {/* 3 Visual Element Cards for the Scene */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 pt-1">
              {currentScene.visualElements.map((elem, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{elem.icon}</span>
                    <h4 className="text-xs font-black text-white">{elem.label}</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {elem.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Speaking Character Dialogue Highlight */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/40 backdrop-blur-md flex items-center justify-between gap-3 text-xs relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-lg shrink-0 shadow-md animate-bounce">
                  {activeLine.speakerEmoji}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-purple-300">Live Dialogue Line</span>
                  <p className="text-xs font-bold text-white italic">
                    "{activeSubtitle}"
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  {currentScene.activeCardProps.tag}
                </span>
              </div>
            </div>
          </div>

          {/* ─── LIVE APP UI REPRODUCTIONS MATCHING SCREENPLAY ──────────────── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  Live AABHA AI Screenplay Flow (Scene {currentScene.id}):
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                Sec {currentScene.startSec}s – {currentScene.endSec}s
              </span>
            </div>

            {/* SCENE 1 UI: Paper Pile ➔ Scattered Files */}
            {currentScene.id === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="font-black text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4" />
                    <span>Physical Paper Pile</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Old prescriptions, handwritten doctor notes & hospital discharge cards lost in folders.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="font-black text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing History Risk</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Doctors cannot cross-verify drug interactions or past allergies in time.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                  <div className="font-black text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>The Solution</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Transforming scattered physical documents into one clean, intelligent digital timeline.
                  </p>
                </div>
              </div>
            )}

            {/* SCENE 2 UI: Hospital Emergency & Missing Information */}
            {currentScene.id === 2 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl shrink-0">
                    🚨
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-600 uppercase">Emergency Room Consultation</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">11:45 PM Night Crisis</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Doctor asks: <em>"Previous reports hain? Koi medication chal rahi hai?"</em> Complete history missing.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase shrink-0">
                  Critical Info Needed
                </span>
              </div>
            )}

            {/* SCENE 3 UI: AABHA AI Glow Reveal */}
            {currentScene.id === 3 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-400/40 text-white flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Abha3DOrb size="sm" state="SPEAKING" interactive={false} />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300">Intelligent Health Companion</span>
                    <h4 className="text-sm font-black text-white">
                      Meet AABHA AI — Your Health. Your Story. Your AI.
                    </h4>
                    <p className="text-[11px] text-purple-200">
                      All health information organized, accessible, and intelligent in your smartphone.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase shrink-0">
                  Live & Active
                </span>
              </div>
            )}

            {/* SCENE 4 UI: 3-Step Interactive Engine */}
            {currentScene.id === 4 && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-purple-600 dark:text-purple-400">1. Timeline View</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Old Report ➔ Clean Digital Event</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-teal-600 dark:text-teal-400">2. AI Explains Terms</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Jargon ➔ Simple Hindi / English</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-cyan-600 dark:text-cyan-400">3. Ask Your Health AI</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">"Ye medicine kisliye hai?" ➔ Answers</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-400/20 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                  <span>ℹ️ AI information ke liye hai. Medical decisions ke liye healthcare professional se consult karein.</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">Non-Diagnostic Disclaimer ✓</span>
                </div>
              </div>
            )}

            {/* SCENE 5 UI: The Doctor Consultation Experience */}
            {currentScene.id === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Memory Index</div>
                  <div className="text-base font-black text-emerald-500">82%</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Stable History</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Medication Adherence</div>
                  <div className="text-base font-black text-cyan-500">100%</div>
                  <div className="text-[9px] text-cyan-600 font-bold">3 of 3 Confirmed</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Reaction Latency</div>
                  <div className="text-base font-black text-purple-500">1.8s</div>
                  <div className="text-[9px] text-purple-600 font-bold">Normal Reflexes</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Doctor Decision Time</div>
                  <div className="text-base font-black text-amber-500">&lt; 30 sec</div>
                  <div className="text-[9px] text-amber-600 font-bold">Instant Context</div>
                </div>
              </div>
            )}

            {/* SCENE 6 UI: Emotional Payoff */}
            {currentScene.id === 6 && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <div>
                    <h5 className="font-black text-[var(--text-primary)]">
                      "Ab aapki health story… hamesha aapke saath rahegi."
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Family peace of mind with zero lost reports or forgotten dosages.
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  Peace of Mind 100% ✓
                </span>
              </div>
            )}

            {/* SCENE 7 UI: Final Brand Moment & CTA */}
            {currentScene.id === 7 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                    Smart India Hackathon • SIH26003
                  </span>
                  <h4 className="text-sm sm:text-base font-black">
                    AABHA AI — Your Health. Your Story. Your AI.
                  </h4>
                  <p className="text-[11px] text-purple-200 font-mono">
                    Website: aabha-ai.vercel.app/patient
                  </p>
                </div>

                <a
                  href="/patient"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition shadow-lg shrink-0 flex items-center gap-1.5"
                >
                  <span>Experience AABHA AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Official Screenplay • 7 Cinematic Scenes • SIH26003</span>
            <span className="sm:hidden">AABHA AI Film</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              ↻ Restart Film
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              Exit Film
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;
