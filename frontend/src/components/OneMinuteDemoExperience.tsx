import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  Mic,
  Brain,
  ShieldAlert,
  Wifi,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Heart,
  Users,
  Smile,
  Home,
  Coffee,
  Smartphone,
  Eye,
  Sun,
  MessageCircle,
  Zap,
  Check,
  Star,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';
import { ambientMusic } from '../services/ambientMusicService';

interface StageConfig {
  id: number;
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  storyChapter: string;
  targetAudience: string;
  cartoonScene: {
    bgGradient: string;
    settingLabel: string;
    characterA: {
      name: string;
      role: string;
      emoji: string;
      actionText: string;
      dialogue: string;
      dialogueType: 'thought' | 'speech';
    };
    characterB?: {
      name: string;
      role: string;
      emoji: string;
      actionText: string;
      dialogue: string;
      dialogueType: 'thought' | 'speech';
    };
    companionAction: string;
    keyPropEmoji: string;
    keyPropLabel: string;
    outcomePill: string;
  };
  narrationSentences: string[];
  narrationSentencesHindi: string[];
}

const STAGES: StageConfig[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 22,
    title: 'Chapter 1: One AI Companion for the Entire Family',
    subtitle: 'From kids & students, to busy working adults, to beloved grandparents',
    badge: 'SCENE 01 • FOR ALL GENERATIONS',
    icon: '👨‍👩‍👧‍👦',
    storyChapter: 'Scene 1: Universal Family AI Care',
    targetAudience: '👧 Kids (5+) • 💼 Adults (18-60) • 👴 Seniors (60+)',
    cartoonScene: {
      bgGradient: 'from-amber-100 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900',
      settingLabel: '🏡 The Das Household • 3 Generations Living Together',
      characterA: {
        name: 'Dadaji (Arun, 72) & Priya (9)',
        role: 'Grandfather & Granddaughter',
        emoji: '👴👧',
        actionText: 'Planning their morning routine & brain game session',
        dialogue: 'Aabha sirf mere liye nahi, meri poti Priya aur beti Anita ke liye bhi hai! ❤️',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Dr. Anita (Working Mom, 42)',
        role: 'Busy Doctor & Caregiver',
        emoji: '👩‍⚕️',
        actionText: 'Managing work-life balance and family health schedules',
        dialogue: 'Hum sab Aabha ka use karte hain — study, routine aur health sab ek jagah! ✨',
        dialogueType: 'speech'
      },
      companionAction: 'AABHA Orb floats between generations with smiling glowing eyes ✨',
      keyPropEmoji: '🌟',
      keyPropLabel: 'All-in-One Family Hub',
      outcomePill: 'Empowering Minds from Age 5 to 95'
    },
    narrationSentences: [
      'Welcome to Aabha AI — an intelligent cognitive and daily-life companion built for everyone.',
      'Aabha AI is not designed solely for seniors. It is a universal cognitive ecosystem for all three generations.',
      'From students like nine-year-old Priya sharpening their focus and memory, to working professionals like Doctor Anita organizing daily productivity, to seniors like Dadaji maintaining independent health routines.',
      'Aabha AI brings the entire family together under one simple, empathetic, and intelligent platform.'
    ],
    narrationSentencesHindi: [
      'आभा एआई में आपका स्वागत है — जो सिर्फ बुजुर्गों के लिए ही नहीं, बल्कि हर उम्र के व्यक्ति के लिए एक संपूर्ण कॉग्निटिव साथी है।',
      'यह तीन पीढ़ियों का एक साझा डिजिटल संबल है।',
      'नन्हीं प्रिया अपनी एकाग्रता और याददाश्त बढ़ाती है, डॉक्टर अनिता अपने व्यस्त दिन का प्रबंधन करती हैं, और दादाजी अपनी सेहत व दवाइयों का ध्यान रखते हैं।',
      'आभा एआई पूरे परिवार के मानसिक स्वास्थ्य और दिनचर्या को एक साथ जोड़ती है।'
    ]
  },
  {
    id: 2,
    startSec: 22,
    endSec: 45,
    title: 'Chapter 2: Daily Routines & Habit Tracking for All Ages',
    subtitle: 'Medication for seniors, hydration for busy adults, study habits for kids',
    badge: 'SCENE 02 • UNIVERSAL ROUTINES',
    icon: '📅',
    storyChapter: 'Scene 2: Multi-User Habit Dashboard',
    targetAudience: 'Medication Alarms • Hydration Goals • Task Management',
    cartoonScene: {
      bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900',
      settingLabel: '☕ Morning Routine Station • 08:30 AM',
      characterA: {
        name: 'Dadaji & Priya',
        role: 'Routine Partners',
        emoji: '👴👧',
        actionText: 'Dadaji checks morning pill, Priya marks her morning milk & study goal',
        dialogue: 'Maine apni dawai le li aur Priya ne apna study time table check kiya! 🥛💊',
        dialogueType: 'speech'
      },
      companionAction: 'Donepezil Checked ✓ | Water 2/6 Logged ✓ | Math Study Scheduled ✓',
      keyPropEmoji: '📱',
      keyPropLabel: 'Adaptive Multi-User Dashboard',
      outcomePill: '100% Habit Adherence for Everyone'
    },
    narrationSentences: [
      'Every family member has unique daily goals.',
      'While Dadaji logs his morning Donepezil medication and warm water with large 1-tap touch buttons, Priya checks off her school study schedule and morning milk.',
      'Anita tracks her office hydration targets and parent health updates in real-time.',
      'The interface adapts automatically: high-contrast for seniors, engaging colors for children, and clean productivity metrics for working adults.'
    ],
    narrationSentencesHindi: [
      'परिवार के हर सदस्य की अपनी ज़रूरतें होती हैं।',
      'जहाँ दादाजी बड़े बटनों से अपनी डोनेपेज़िल दवाई टिक करते हैं, वहीं प्रिया अपने स्कूल और पढ़ाई का शेड्यूल देखती है।',
      'डॉक्टर अनिता अपने पानी के लक्ष्य और क्लिनिक के समय का ध्यान रखती हैं।',
      'यह इंटरफेस हर उम्र के अनुसार खुद को ढाल लेता है।'
    ]
  },
  {
    id: 3,
    startSec: 45,
    endSec: 75,
    title: 'Chapter 3: Conversational Voice Companion for All Queries',
    subtitle: 'From student brain riddles & schedules to elder reminders in 5 regional languages',
    badge: 'SCENE 03 • MULTI-USER VOICE',
    icon: '🎤',
    storyChapter: 'Scene 3: Voice Dialogue for Every Generation',
    targetAudience: 'Hindi • English • Bengali • Marathi • Assamese',
    cartoonScene: {
      bgGradient: 'from-purple-100 via-indigo-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900',
      settingLabel: '🪴 Balcony Lounge • 09:00 AM',
      characterA: {
        name: 'Priya & Dadaji',
        role: 'Voice Users',
        emoji: '👧👴',
        actionText: 'Priya asks a riddle, Dadaji asks for his afternoon schedule',
        dialogue: 'Priya: "Aabha, tell me a brain puzzle!" | Dadaji: "Aabha, mera routine kya hai?" 🗣️',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Aabha AI (Voice Companion)',
        role: 'Deterministic AI Assistant',
        emoji: '🤖',
        actionText: 'Intelligently answering both student puzzle and elder health query',
        dialogue: 'Priya ke liye puzzle: What has hands but cannot clap? A clock! Aur Arun ji, lunch 1:00 PM par hai! ✨',
        dialogueType: 'speech'
      },
      companionAction: 'Zero medical hallucination with contextual multi-user intent routing',
      keyPropEmoji: '🎙️',
      keyPropLabel: 'Voice Waveform Radiator',
      outcomePill: 'Multi-Lingual Voice for Ages 5 to 95'
    },
    narrationSentences: [
      'Aabha AI\'s voice companion adapts its conversational personality to whoever is speaking.',
      'When young Priya asks for an educational brain riddle or vocabulary quiz, Aabha engages her with cheerful enthusiasm.',
      'When Dadaji asks for his medication schedule, Aabha replies with calm clarity, retrieving exact records from local storage with zero hallucination.',
      'Multi-lingual support across five regional Indian languages makes conversational care feel natural for everyone in the home.'
    ],
    narrationSentencesHindi: [
      'आभा वॉइस असिस्टेंट बात करने वाले की उम्र के अनुसार अपना स्वभाव बदल लेती है।',
      'जब नन्हीं प्रिया दिमागी पहेलियाँ या क्विज़ पूछती है, तो आभा उत्साह से जवाब देती है।',
      'और जब दादाजी दवाइयों का समय पूछते हैं, तो आभा शांत और स्पष्ट आवाज़ में सही जानकारी देती है।',
      'हिंदी, अंग्रेजी, मराठी, बंगाली और असमिया में यह हर किसी के लिए सहज और आत्मीय है।'
    ]
  },
  {
    id: 4,
    startSec: 75,
    endSec: 110,
    title: 'Chapter 4: Brain Training & Cognitive Games for All Minds',
    subtitle: '6 scientifically proven cognitive exercises for children, students, and seniors',
    badge: 'SCENE 04 • BRAIN GYM FOR ALL',
    icon: '🧠',
    storyChapter: 'Scene 4: Cognitive Training for All Ages',
    targetAudience: 'Focus • Spatial Memory • Reaction Speed • Logic',
    cartoonScene: {
      bgGradient: 'from-amber-50 via-yellow-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900',
      settingLabel: '🎨 Cognitive Playroom • 03:00 PM',
      characterA: {
        name: 'Priya & Dadaji',
        role: 'Brain Game Duo',
        emoji: '👧👴',
        actionText: 'Playing Memory Match and Reaction Speed games together',
        dialogue: 'Dadu ki accuracy 85% aur mera reaction speed 1.2s! Hum dono master ban gaye! 🎮',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Dr. Anita',
        role: 'Cheering Mom',
        emoji: '👩‍⚕️',
        actionText: 'Watching kids and elders sharpen their minds through play',
        dialogue: 'Games designed for all ages — no clinical boring tests, just pure brain health! 🎉',
        dialogueType: 'speech'
      },
      companionAction: '6 Cognitive Games: Memory Match, Stroop Focus, Routine Ordering & Reflex Speed',
      keyPropEmoji: '🎯',
      keyPropLabel: 'Cognitive Science Grid',
      outcomePill: 'Memory: 85% Accuracy • Speed: 1.8s'
    },
    narrationSentences: [
      'Cognitive stimulation is vital at every stage of life.',
      'Children need to develop spatial memory and concentration for school.',
      'Working adults need to reduce cognitive fatigue and stress.',
      'Seniors need to preserve neuroplasticity and memory recall.',
      'Aabha AI provides six gamified exercises — from Memory Match and Daily Routine Ordering to Color Stroop Focus — turning brain exercise into a fun family competition.'
    ],
    narrationSentencesHindi: [
      'मस्तिष्क का व्यायाम हर उम्र के लिए बेहद ज़रूरी है।',
      'बच्चों को पढ़ाई के लिए एकाग्रता चाहिए, युवाओं को तनाव से मुक्ति, और बुजुर्गों को मजबूत याददाश्त।',
      'आभा एआई 6 वैज्ञानिक गेम्स प्रदान करती है—मेमोरी मैच, कलर स्ट्रोप और रूटीन ऑर्डरिंग।',
      'यह उबाऊ टेस्ट के बजाय एक मजेदार पारिवारिक खेल बन जाता है।'
    ]
  },
  {
    id: 5,
    startSec: 110,
    endSec: 135,
    title: 'Chapter 5: Adaptive AI Engine Personalizing Every Profile',
    subtitle: 'Speed challenges for adults, learning curves for kids, gentle pacing for elders',
    badge: 'SCENE 05 • ADAPTIVE AI ENGINE',
    icon: '⚡',
    storyChapter: 'Scene 5: Multi-Tier Adaptive Intelligence',
    targetAudience: 'Automatic Pacing & Difficulty Calibration',
    cartoonScene: {
      bgGradient: 'from-cyan-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900',
      settingLabel: '⚡ Aabha Adaptive Neural Calibration Lab',
      characterA: {
        name: 'Dadaji & Priya',
        role: 'Level Up Champions',
        emoji: '👴👧',
        actionText: 'Both unlock their personalized adaptive difficulty stages',
        dialogue: 'Priya ko hard math patterns mile, mujhe 4x4 card grid! Sabke liye alag challenge! ⭐',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Adaptive AI Brain',
        role: 'Smart Calibration Engine',
        emoji: '🧠',
        actionText: 'Dynamically tailoring cognitive tasks based on individual age & latency',
        dialogue: 'Profile: Priya (Kid ➔ Speed Boost) | Profile: Arun (Senior ➔ Memory Focus) 🚀',
        dialogueType: 'speech'
      },
      companionAction: 'Calibrates pacing based on user age bracket and real-time accuracy',
      keyPropEmoji: '⚡',
      keyPropLabel: 'Dynamic AI Difficulty Meter',
      outcomePill: 'Personalized Neuro-Pacing for Everyone'
    },
    narrationSentences: [
      'Our Adaptive AI Engine is profile-aware.',
      'It dynamically calibrates the challenge based on the active user profile.',
      'For children like Priya, it increases pace to train rapid reflex decisions.',
      'For elders like Dadaji, it gently scales from Level 2 to Level 3, introducing distractor cards while preserving psychological comfort and confidence.',
      'This guarantees personalized mental stimulation without fatigue or anxiety.'
    ],
    narrationSentencesHindi: [
      'हमारा एडेप्टिव एआई इंजन हर प्रोफाइल को पहचानता है।',
      'बच्चों के लिए यह रिफ्लेक्स और स्पीड बढ़ाता है, और बुजुर्गों के लिए सहजता से लेवल 2 से लेवल 3 में अपग्रेड करता है।',
      'यह सुनिश्चित करता है कि दिमाग को सही चुनौती मिले और कोई तनाव या निराशा न हो।'
    ]
  },
  {
    id: 6,
    startSec: 135,
    endSec: 155,
    title: 'Chapter 6: Family & Caregiver 4-Pillar Analytics',
    subtitle: 'Unified dashboard to monitor cognitive health, habits, and alerts',
    badge: 'SCENE 06 • CAREGIVER & CLINIC',
    icon: '📊',
    storyChapter: 'Scene 6: Holistic Family Health Radar',
    targetAudience: 'Memory • Attention • Speed • Consistency',
    cartoonScene: {
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900',
      settingLabel: '🏥 Hospital Clinic Desk & Family Phone View',
      characterA: {
        name: 'Dr. Anita Verma',
        role: 'Doctor & Family Caregiver',
        emoji: '👩‍⚕️',
        actionText: 'Reviewing 4-pillar analytics for Dadaji and study streak for Priya',
        dialogue: 'Ek hi app se father ki health aur beti ki study habits dono monitor ho jati hain! 💚',
        dialogueType: 'thought'
      },
      companionAction: '4-Pillars: Memory 82%, Attention 76%, Speed 1.8s, Consistency 84% 🔥',
      keyPropEmoji: '🩺',
      keyPropLabel: 'Family Health Analytics Phone',
      outcomePill: 'Complete Family Transparency & Peace of Mind'
    },
    narrationSentences: [
      'From her clinic desk, Doctor Anita accesses the comprehensive family caregiver dashboard.',
      'She monitors Dadaji\'s four non-diagnostic cognitive indicators: Memory at eighty-two percent, Attention at seventy-six percent, and confirmed medication routines.',
      'At the same time, she checks Priya\'s focus streaks and brain game scores.',
      'Doctors and caregivers receive transparent summaries and priority alerts, bridging families even across busy workdays.'
    ],
    narrationSentencesHindi: [
      'अपने क्लिनिक से डॉक्टर अनिता पूरे परिवार का हेल्थ और एक्टिविटी डैशबोर्ड देखती हैं।',
      'वे पिता के 4 मुख्य स्तंभ—मेमोरी 82%, अटेंशन 76%, और समय पर दवाइयों की पुष्टि देखती हैं।',
      'साथ ही वे प्रिया के स्टडी और गेमिंग स्कोर पर भी नज़र रखती हैं।',
      'यह तकनीक कामकाजी लोगों और डॉक्टरों को पूरे परिवार का भरोसा देती है।'
    ]
  },
  {
    id: 7,
    startSec: 155,
    endSec: 170,
    title: 'Chapter 7: 100% Offline Vault for School, Park & Travel',
    subtitle: 'Works completely offline in villages, parks, buses, and remote areas',
    badge: 'SCENE 07 • OFFLINE ANYWHERE',
    icon: '📡',
    storyChapter: 'Scene 7: Offline-First Everywhere',
    targetAudience: 'Local SQLite/IndexedDB • Auto Cloud Sync',
    cartoonScene: {
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900',
      settingLabel: '🌳 Park Walk & Travel • Zero Internet Connectivity',
      characterA: {
        name: 'Dadaji & Priya',
        role: 'Outdoor Walkers',
        emoji: '👴👧',
        actionText: 'Walking outdoors with zero mobile signal; Aabha continues working',
        dialogue: 'Priya ne bus me game khela, maine park me reminder suna — bina internet ke bhi 100% chalta hai! 🔔',
        dialogueType: 'speech'
      },
      companionAction: 'Cloud shows ☁️❌ Offline Mode ➔ Home Wi-Fi Reconnect ➔ 🟢 100% Auto-Synced!',
      keyPropEmoji: '🌲',
      keyPropLabel: 'Offline Local Encrypted Vault',
      outcomePill: 'Zero Data Loss in Towns & Villages'
    },
    narrationSentences: [
      'Whether Priya is on the school bus, Dadaji is in a connectivity dead-zone at the park, or the family is traveling to their ancestral village, Aabha AI operates flawlessly.',
      'Our offline-first architecture runs completely within local device storage.',
      'Games, hydration logs, and audio reminders function without internet, and sync securely with the cloud the moment Wi-Fi reconnects.',
      'Zero data loss guarantees reliability anywhere across India.'
    ],
    narrationSentencesHindi: [
      'चाहे प्रिया स्कूल बस में हो, दादाजी पार्क में हों, या पूरा परिवार गाँव की यात्रा पर हो—आभा एआई बिना इंटरनेट के भी पूरी तरह काम करती है।',
      'सारे गेम्स, पानी के अलार्म और चेक-ऑफ फोन के अंदर सुरक्षित रहते हैं और इंटरनेट मिलते ही अपने आप सिंक हो जाते हैं।',
      'यह भारत के हर गाँव और दूरदराज के क्षेत्र में भी 100% विश्वसनीयता देती है।'
    ]
  },
  {
    id: 8,
    startSec: 170,
    endSec: 180,
    title: 'Chapter 8: AABHA AI — Built for Every Mind in India',
    subtitle: 'Empowering children, busy professionals, and seniors under SIH26003',
    badge: 'SCENE 08 • VISION FOR INDIA',
    icon: '🏆',
    storyChapter: 'Scene 8: Pan-India Universal Vision',
    targetAudience: 'SIH26003 • Universal Cognitive Health',
    cartoonScene: {
      bgGradient: 'from-purple-100 via-pink-50 to-amber-100 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900',
      settingLabel: '🍽️ The Reunited Family Celebration',
      characterA: {
        name: 'The Entire Family & Aabha',
        role: '3 Generations of Empowered Minds',
        emoji: '👨‍👩‍👧‍👦🤖',
        actionText: 'Celebrating mental clarity, joyful bonding, and independent living',
        dialogue: 'AABHA AI: Har umar ke liye, har dimag ke liye, har parivaar ke liye! 🇮🇳🏆',
        dialogueType: 'speech'
      },
      companionAction: 'SIH26003 Trophy 🏆 with 5 Regional Indian Languages & 6 Cognitive Games',
      keyPropEmoji: '🏆',
      keyPropLabel: 'SIH 26003 Gold Trophy',
      outcomePill: 'Ready for Pan-India Deployment 🇮🇳'
    },
    narrationSentences: [
      'Aabha AI is the universal cognitive companion for every Indian household.',
      'Empowering children to build sharp focus, helping working professionals stay organized, and supporting seniors with memory independence and dignified care.',
      'With six cognitive games, five regional languages, offline capability, and transparent AI analytics, Aabha AI is ready for nationwide deployment.',
      'Thank you for experiencing Aabha AI for Smart India Hackathon problem statement SIH twenty-six thousand three!'
    ],
    narrationSentencesHindi: [
      'आभा एआई हर भारतीय परिवार के हर सदस्य के लिए बनी है।',
      'बच्चों के तेज दिमाग के लिए, युवाओं के व्यस्त जीवन के लिए, और बुजुर्गों की गरिमा व याददाश्त के लिए।',
      '6 कॉग्निटिव गेम्स, 5 भारतीय भाषाओं और 100% ऑफलाइन तकनीक के साथ हम पूरे भारत की सेवा के लिए तैयार हैं।',
      'स्मार्ट इंडिया हैकाथॉन SIH26003 के इस विशेष प्रदर्शन को देखने के लिए आपका हार्दिक धन्यवाद!'
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
  const [voiceLang, setVoiceLang] = useState<'EN' | 'HI'>('EN');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);

  const totalSeconds = 180; // 3 Minutes
  const timerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(true);
  const isVoiceoverOnRef = useRef<boolean>(true);
  const voiceLangRef = useRef<'EN' | 'HI'>('EN');
  const stageSentenceIdxRef = useRef<number>(0);
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

  // Stop Speech synthesis helper
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  };

  // Play next continuous sentence in current stage
  const playContinuousSentence = (stage: StageConfig, sentenceIndex: number) => {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      !isVoiceoverOnRef.current ||
      !isPlayingRef.current
    ) {
      return;
    }

    const sentences =
      voiceLangRef.current === 'HI'
        ? stage.narrationSentencesHindi
        : stage.narrationSentences;

    const safeIdx = sentenceIndex % sentences.length;
    const textToSpeak = sentences[safeIdx];

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = voiceLangRef.current === 'HI' ? 'hi-IN' : 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v =>
        voiceLangRef.current === 'HI'
          ? v.lang.includes('hi')
          : v.lang.includes('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('David'))
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setCurrentSentenceIdx(safeIdx);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (isPlayingRef.current && isVoiceoverOnRef.current) {
          const nextIdx = safeIdx + 1;
          stageSentenceIdxRef.current = nextIdx;
          setTimeout(() => {
            if (isPlayingRef.current && isVoiceoverOnRef.current) {
              const currentS =
                STAGES.find(s => s.id === currentStageIdRef.current) || stage;
              playContinuousSentence(currentS, nextIdx);
            }
          }, 80);
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

  // Lifecycle & Music setup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSeconds(0);
      setIsPlaying(true);
      currentStageIdRef.current = 1;
      stageSentenceIdxRef.current = 0;

      if (isMusicOn) {
        ambientMusic.start(0.06);
      }

      playContinuousSentence(STAGES[0], 0);
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
  const currentStage =
    STAGES.find(s => seconds >= s.startSec && seconds < s.endSec) ||
    STAGES[STAGES.length - 1];

  // Trigger continuous speech on stage transition
  useEffect(() => {
    if (isOpen && isPlaying && isVoiceoverOn && currentStage.id !== currentStageIdRef.current) {
      currentStageIdRef.current = currentStage.id;
      stageSentenceIdxRef.current = 0;
      playContinuousSentence(currentStage, 0);
    }
  }, [currentStage.id, isOpen, isPlaying, isVoiceoverOn, voiceLang]);

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
          playContinuousSentence(currentStage, stageSentenceIdxRef.current);
        }
      }
    }
  };

  const handleRestart = () => {
    stopSpeech();
    setSeconds(0);
    currentStageIdRef.current = 1;
    stageSentenceIdxRef.current = 0;
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (isMusicOn) {
      ambientMusic.start(0.06);
    }
    playContinuousSentence(STAGES[0], 0);
  };

  const handleJumpToStage = (stage: StageConfig) => {
    stopSpeech();
    setSeconds(stage.startSec);
    currentStageIdRef.current = stage.id;
    stageSentenceIdxRef.current = 0;
    playContinuousSentence(stage, 0);
  };

  const handleToggleVoiceover = () => {
    if (isVoiceoverOn) {
      stopSpeech();
      setIsVoiceoverOn(false);
      isVoiceoverOnRef.current = false;
    } else {
      setIsVoiceoverOn(true);
      isVoiceoverOnRef.current = true;
      playContinuousSentence(currentStage, stageSentenceIdxRef.current);
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
    playContinuousSentence(currentStage, 0);
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

  const currentSentences =
    voiceLang === 'HI'
      ? currentStage.narrationSentencesHindi
      : currentStage.narrationSentences;
  const activeSubtitle =
    currentSentences[currentSentenceIdx % currentSentences.length] ||
    currentSentences[0];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-6xl bg-[var(--bg-surface)] rounded-[24px] sm:rounded-[36px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP PRESENTATION BAR ────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-purple-500 to-amber-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm">
                👨‍👩‍👧‍👦
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                  AABHA AI • FOR ALL GENERATIONS
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Universal Cognitive App
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                One Platform for Kids, Students, Busy Adults, Doctors & Seniors
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
              title={isVoiceoverOn ? 'Continuous Voiceover Speaking' : 'Voiceover Muted'}
            >
              {isVoiceoverOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline text-[11px]">{isVoiceoverOn ? 'Voice ON' : 'Muted'}</span>
            </button>

            {/* Narration Language Switch (EN / HI) */}
            <button
              type="button"
              onClick={handleToggleLang}
              className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-white transition cursor-pointer border border-white/15"
              title="Switch Voiceover Language"
            >
              {voiceLang === 'EN' ? '🇺🇸 EN' : '🇮🇳 हिं'}
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
              title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title="Restart Story"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer border border-rose-500/30 ml-0.5"
              title="Exit Story"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ─── PROGRESS BAR & CHAPTER STEPPER ──────────────────────────────── */}
        <div className="bg-[var(--bg-surface-secondary)] px-3 sm:px-8 py-2 border-b border-[var(--border)] space-y-1.5 shrink-0">
          {/* Continuous Progress Line */}
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-purple-600 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${(seconds / totalSeconds) * 100}%` }}
            />
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {STAGES.map(s => {
              const isCurrent = s.id === currentStage.id;
              const isPassed = seconds >= s.endSec;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleJumpToStage(s)}
                  className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm scale-105'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-400'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="hidden md:inline">{s.storyChapter.split(':')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── LIVE VOICE NARRATION CONTINUOUS SUBTITLE TICKER ─────────────── */}
        <div className="px-3.5 sm:px-8 py-2 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-teal-500/15 border-b border-amber-400/20 flex items-center gap-2.5 shrink-0 shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-amber-500" />
            <span className="hidden sm:inline">Universal Story Narrator:</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] italic leading-relaxed animate-fade-in line-clamp-2">
            "{activeSubtitle}"
          </p>
        </div>

        {/* ─── DYNAMIC CARTOON THEATER & INTERACTIVE STORY STAGE ───────────── */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4">
          {/* 🎭 THE MAIN ANIMATED CARTOON STORYBOARD STAGE ──────────────────── */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-br ${currentStage.cartoonScene.bgGradient} border-2 border-amber-400/40 shadow-xl relative overflow-hidden transition-all duration-700 space-y-4`}>
            {/* Top Stage Header: Setting & Target Audience Label */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-sm flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>{currentStage.cartoonScene.settingLabel}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">
                  {currentStage.targetAudience}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-600 text-white shadow-md">
                  {currentStage.badge}
                </span>
              </div>
            </div>

            {/* ─── ANIMATED CARTOON CHARACTERS & COMIC SPEECH BUBBLES ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10 pt-2">
              {/* Character A Card */}
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-400/40 shadow-lg space-y-2.5 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-3xl shadow-md border-2 border-white animate-bounce shrink-0">
                    {currentStage.cartoonScene.characterA.emoji}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {currentStage.cartoonScene.characterA.name}
                    </h4>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {currentStage.cartoonScene.characterA.role}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {currentStage.cartoonScene.characterA.actionText}
                </div>

                {/* Comic Speech / Thought Bubble */}
                <div className={`p-3 rounded-2xl text-xs font-bold leading-relaxed relative ${
                  currentStage.cartoonScene.characterA.dialogueType === 'thought'
                    ? 'bg-amber-100 dark:bg-amber-950/60 border border-dashed border-amber-400 text-amber-900 dark:text-amber-200'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">
                      {currentStage.cartoonScene.characterA.dialogueType === 'thought' ? '💭' : '💬'}
                    </span>
                    <p className="italic">"{currentStage.cartoonScene.characterA.dialogue}"</p>
                  </div>
                </div>
              </div>

              {/* Character B or AI Companion Stage Card */}
              {currentStage.cartoonScene.characterB ? (
                <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-purple-400/40 shadow-lg space-y-2.5 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-3xl shadow-md border-2 border-white animate-pulse shrink-0">
                      {currentStage.cartoonScene.characterB.emoji}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {currentStage.cartoonScene.characterB.name}
                      </h4>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {currentStage.cartoonScene.characterB.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {currentStage.cartoonScene.characterB.actionText}
                  </div>

                  {/* Comic Speech / Thought Bubble */}
                  <div className={`p-3 rounded-2xl text-xs font-bold leading-relaxed relative ${
                    currentStage.cartoonScene.characterB.dialogueType === 'thought'
                      ? 'bg-purple-100 dark:bg-purple-950/60 border border-dashed border-purple-400 text-purple-900 dark:text-purple-200'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">
                        {currentStage.cartoonScene.characterB.dialogueType === 'thought' ? '💭' : '💬'}
                      </span>
                      <p className="italic">"{currentStage.cartoonScene.characterB.dialogue}"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900/80 border border-purple-400/40 text-white shadow-lg flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <Abha3DOrb size="md" state="SPEAKING" interactive={false} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                      AABHA AI Universal Companion
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {currentStage.cartoonScene.companionAction}
                    </h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 border border-emerald-400/50 text-emerald-300">
                      {currentStage.cartoonScene.outcomePill}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Cartoon Props & Impact Ribbon */}
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-950/60 backdrop-blur-md border border-amber-400/30 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10 font-bold">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentStage.cartoonScene.keyPropEmoji}</span>
                <span className="text-slate-800 dark:text-slate-200">Key Feature: {currentStage.cartoonScene.keyPropLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-amber-500">✨ Universal Benefit:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{currentStage.cartoonScene.outcomePill}</span>
              </div>
            </div>
          </div>

          {/* ─── LIVE INTERACTIVE APP PROOF CONTAINER (BELOW CARTOON STAGE) ─ */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  Live System Action for Chapter {currentStage.id}:
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                {currentStage.startSec}s – {currentStage.endSec}s
              </span>
            </div>

            {/* Stage-Specific App Previews for ALL Generations */}
            {currentStage.id === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👧</div>
                  <div className="font-bold mt-1">Kids & Students (5-18)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Focus, Memory Games & Habits</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">💼</div>
                  <div className="font-bold mt-1">Busy Adults (18-60)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Routines, Wellness & Family Care</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👵</div>
                  <div className="font-bold mt-1">Seniors (60+)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Memory Care & Independence</div>
                </div>
              </div>
            )}

            {currentStage.id === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-lg">🚨</span>
                  <div className="font-black text-rose-500">SOS 1-Tap</div>
                  <div className="text-[9px] text-[var(--text-muted)]">Senior Safety</div>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <span className="text-lg">💊</span>
                  <div className="font-black text-teal-500">Medication ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">Donepezil 5mg</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-lg">💧</span>
                  <div className="font-black text-blue-500">Hydration 2/6 ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">For Whole Family</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-lg">📚</span>
                  <div className="font-black text-indigo-500">Study & Tasks ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">Daily Goals</div>
                </div>
              </div>
            )}

            {currentStage.id === 3 && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗣️</span>
                  <span>"Aabha, tell me a brain puzzle / What is my schedule today?"</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold">
                  Zero Hallucination ✓
                </span>
              </div>
            )}

            {currentStage.id === 4 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎴</span>
                  <span>6 Cognitive Games: Memory Match, Color Stroop, Routine Ordering</span>
                </div>
                <span className="font-mono font-bold text-emerald-500">Fun for All Ages • Brain Fitness</span>
              </div>
            )}

            {currentStage.id === 5 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>Profile-Aware Adaptive Pacing: Kids (Speed) • Adults (Focus) • Seniors (Recall)</span>
                </div>
                <span className="font-black text-emerald-600">🚀 LEVEL 3 UNLOCKED</span>
              </div>
            )}

            {currentStage.id === 6 && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Memory</div>
                  <div className="font-black text-emerald-500">82%</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Attention</div>
                  <div className="font-black text-cyan-500">76%</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Speed</div>
                  <div className="font-black text-purple-500">1.8s</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Streak</div>
                  <div className="font-black text-amber-500">5 Days 🔥</div>
                </div>
              </div>
            )}

            {currentStage.id === 7 && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-rose-500" />
                  <span>Works in School Bus, Park, Remote Village & Travel (0 Internet Needed)</span>
                </div>
                <span className="text-emerald-500 font-bold">Auto-Syncs on Wi-Fi ✓</span>
              </div>
            )}

            {currentStage.id === 8 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-between gap-1">
                <span>🏆 SIH26003: Cognitive Care & Empowerment for Every Age in India</span>
                <span className="text-amber-300">Ready for Pan-India Deployment 🇮🇳</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Universal Cognitive App • Kids, Adults & Seniors • SIH26003</span>
            <span className="sm:hidden">For All Generations</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              ↻ Restart Story
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              Exit Story Mode
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;
