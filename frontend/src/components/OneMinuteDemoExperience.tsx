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
  Smartphone
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
  humanScene: {
    character: string;
    setting: string;
    action: string;
    quote: string;
    avatar: string;
    metric: string;
  };
  narrationSentences: string[];
  narrationSentencesHindi: string[];
}

const STAGES: StageConfig[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 22,
    title: 'Real Life: Meet Mr. Arun Das & Family',
    subtitle: '72-year-old retired teacher living in New Delhi with daughter Dr. Anita',
    badge: '01. HOME LIFE & CHALLENGE',
    icon: '👵',
    humanScene: {
      character: 'Mr. Arun Das (Age 72) & Daughter Anita',
      setting: 'Morning Living Room, New Delhi',
      action: 'Experiencing mild memory lapses with daily medicines and schedules',
      quote: '"I want to stay independent, but sometimes I forget if I took my morning medicine or drank enough water."',
      avatar: '👴',
      metric: 'Independence preserved with zero anxiety'
    },
    narrationSentences: [
      'Welcome to Aabha AI, an intelligent daily life companion for elderly care.',
      'Across millions of Indian homes, elders like seventy-two-year-old Arun Das wish to live with dignity and independence.',
      'However, mild cognitive difficulties often make managing daily medications, hydration, and appointments stressful for both patients and their working caregivers.',
      'Aabha AI was built to solve this exact challenge, turning everyday routines into gentle, guided interactions.'
    ],
    narrationSentencesHindi: [
      'आभा एआई में आपका स्वागत है, जो बुजुर्गों के लिए एक समझदार और स्नेही साथी है।',
      'भारत के करोड़ों परिवारों में 72 वर्षीय अरुण दास जैसे वरिष्ठ नागरिक गरिमा और स्वतंत्रता के साथ जीना चाहते हैं।',
      'लेकिन उम्र के साथ दिनचर्या और दवाइयों का समय याद रखना कठिन हो जाता है।',
      'आभा एआई इसी चुनौती का समाधान करती है, ताकि बुजुर्ग स्वावलंबी रहें और परिवार निश्चिंत।'
    ]
  },
  {
    id: 2,
    startSec: 22,
    endSec: 45,
    title: 'Accessible Patient Dashboard in Action',
    subtitle: 'Arun effortlessly checks off his morning routine with high-contrast 1-tap buttons',
    badge: '02. ELDERLY-FRIENDLY DASHBOARD',
    icon: '☕',
    humanScene: {
      character: 'Arun sitting comfortably on sofa with tablet',
      setting: 'Breakfast Table (08:30 AM)',
      action: '1-Tap checkoff for Donepezil 5mg with a full glass of warm water',
      quote: '"The big buttons and clear text make it so simple. I don\'t even need my reading glasses."',
      avatar: '💊',
      metric: 'Adherence: 100% Morning Dose Taken'
    },
    narrationSentences: [
      'Here is the accessible elderly-friendly patient dashboard in daily action.',
      'Designed with large high-contrast touch targets, Arun effortlessly logs his morning Donepezil medication.',
      'With a single tap, he marks his water intake and checks off his morning routine without needing help from anyone.',
      'The interface removes all clutter, featuring soft pastel accents, clear icons, and prominent emergency assistance controls always in reach.'
    ],
    narrationSentencesHindi: [
      'यह है आभा एआई का सरल और स्पष्ट एल्डरली-फ्रेंडली डैशबोर्ड।',
      'बड़े अक्षरों और हाई-कॉन्ट्रास्ट बटनों के साथ अरुण जी सुबह की डोनेपेज़िल दवाई को सिर्फ एक टैप में टिक करते हैं।',
      'पानी का गिलास लॉग करना और दिन की शुरुआत करना बेहद आसान है, जिसके लिए किसी पर निर्भर नहीं रहना पड़ता।',
      'यह इंटरफेस बुजुर्गों की आँखों और उंगलियों के लिए बेहद सहज और आरामदायक बनाया गया है।'
    ]
  },
  {
    id: 3,
    startSec: 45,
    endSec: 75,
    title: 'Natural Voice Companion at Breakfast',
    subtitle: 'Conversational assistant with zero hallucinations using real local database',
    badge: '03. ZERO-HALLUCINATION VOICE',
    icon: '🎤',
    humanScene: {
      character: 'Arun conversing naturally while sipping morning tea',
      setting: 'Tea Time in Balcony (09:00 AM)',
      action: 'Voice query in Hindi: "Aabha, mera aaj ka kya program hai?"',
      quote: '"Aabha talks to me warmly like a family member, reminding me of lunch and my evening walk."',
      avatar: '🤖',
      metric: 'Latency: 0.3s Speech Intent Resolution'
    },
    narrationSentences: [
      'While having his morning tea, Arun speaks naturally to his AI companion.',
      'He simply asks: "Aabha, what is my schedule today?" in his preferred regional language.',
      'Aabha AI immediately resolves his voice intent using a local deterministic database with zero medical hallucination.',
      'She gently tells him about his lunch time, afternoon Memantine dosage, and scheduled evening park walk.',
      'The voice assistant supports Hindi, English, Bengali, Assamese, and Marathi seamlessly.'
    ],
    narrationSentencesHindi: [
      'सुबह की चाय पीते हुए अरुण जी सहजता से अपनी मातृभाषा में आभा से बात करते हैं।',
      'वे पूछते हैं: "आभा, मेरा आज का क्या कार्यक्रम है?"',
      'आभा वॉइस असिस्टेंट बिना किसी भ्रम के असली डेटाबेस से सटीक जानकारी निकाल कर बताती है।',
      'आभा उन्हें दोपहर के भोजन, दवाई और शाम की सैर का समय बेहद विनम्रता से याद दिलाती है।',
      'यह वॉइस असिस्टेंट हिंदी, अंग्रेजी, मराठी, बंगाली और असमिया में सहज संवाद करता है।'
    ]
  },
  {
    id: 4,
    startSec: 75,
    endSec: 110,
    title: 'Cognitive Gaming with Grandchildren',
    subtitle: 'Memory Match & Routine Ordering exercises turning brain training into joyful bonding',
    badge: '04. COGNITIVE MEMORY EXERCISES',
    icon: '🎴',
    humanScene: {
      character: 'Arun playing Memory Match with his 9-year-old granddaughter',
      setting: 'Afternoon Leisure Time (03:00 PM)',
      action: 'Matching familiar cards & ordering chronological routines',
      quote: '"My granddaughter cheers every time I find a matching pair! It feels like fun, not medical therapy."',
      avatar: '🎯',
      metric: 'Visual Recall Score: 85% Accuracy'
    },
    narrationSentences: [
      'In the afternoon, Arun enjoys playing cognitive memory exercises alongside his nine-year-old granddaughter.',
      'They play Memory Match and Daily Routine Ordering together, turning cognitive stimulation into family bonding.',
      'While it feels just like an enjoyable game, Aabha AI continuously tracks visual recall, card accuracy, and reaction speed.',
      'The system records an impressive eighty-five percent accuracy with an average tap response latency of one point eight seconds.',
      'This positive reinforcement builds mental sharpness and emotional confidence without clinical fatigue.'
    ],
    narrationSentencesHindi: [
      'दोपहर के समय अरुण जी अपनी पोती के साथ मनोरंजक मेमोरी गेम्स खेलते हैं।',
      'मेमोरी मैच और दिनचर्या क्रमबद्धता जैसे खेलों से परिवार में खुशियों का माहौल बनता है।',
      'खेलते हुए आभा एआई उनकी याददाश्त, कार्ड मिलान सटीकता और रिफ्लेक्स गति को बैकग्राउंड में मापती है।',
      'सिस्टम 85 प्रतिशत एक्यूरेसी और मात्र 1.8 सेकंड की प्रतिक्रिया गति दर्ज करता है।',
      'यह खेल बुजुर्गों के मस्तिष्क को सक्रिय और ऊर्जावान बनाए रखने में मदद करते हैं।'
    ]
  },
  {
    id: 5,
    startSec: 110,
    endSec: 135,
    title: 'Adaptive AI Engine Adjusting Difficulty',
    subtitle: 'Performance evaluated in real time: >85% score dynamically unlocks Level 3',
    badge: '05. ADAPTIVE AI ENGINE',
    icon: '🧠',
    humanScene: {
      character: 'Adaptive AI System Engine',
      setting: 'Real-Time Neural Calibration Engine',
      action: 'Automatically scaling card grid from 3×2 to 4×4 with distractor cards',
      quote: '"Great job Arun! You completed Level 2 with 85% accuracy. Let\'s try Level 3 next."',
      avatar: '⚡',
      metric: 'Difficulty: Level 2 ➔ Level 3 (Adaptive)'
    },
    narrationSentences: [
      'Now observe our Adaptive AI Engine working quietly behind the scenes.',
      'Because Arun achieved a consistent eighty-five percent composite score, the algorithm dynamically scales the difficulty to Level 3.',
      'It expands the card grid to four by four and introduces subtle distractor elements to gently exercise his focus.',
      'The personalization engine automatically queues his next tailored exercise: Daily Routine Chronological Ordering.',
      'This adaptive pacing ensures the exercises are never too easy and never frustratingly hard.'
    ],
    narrationSentencesHindi: [
      'अब देखिए आभा का एडेप्टिव एआई इंजन कैसे खुद को ढालता है।',
      'अरुण जी के 85 प्रतिशत उत्कृष्ट प्रदर्शन को देखकर सिस्टम डिफिकल्टी को लेवल 2 से लेवल 3 में अपग्रेड कर देता है।',
      'कार्ड ग्रिड को बड़ा किया जाता है और नए दिलचस्प पैटर्न जोड़े जाते हैं ताकि एकाग्रता मजबूत हो।',
      'पर्सनलाइज़ेशन इंजन उनके लिए अगला अनुकूलित व्यायाम स्वतः तैयार कर देता है।',
      'यह निरंतर संतुलन सुनिश्चित करता है कि दिमाग को सही चुनौती मिले और कोई तनाव न हो।'
    ]
  },
  {
    id: 6,
    startSec: 135,
    endSec: 155,
    title: 'Caregiver Remote Monitoring & Peace of Mind',
    subtitle: 'Dr. Anita checking 4-pillar analytics and smart alerts from her clinic',
    badge: '06. CAREGIVER 4-PILLAR PORTAL',
    icon: '📊',
    humanScene: {
      character: 'Dr. Anita Verma (Daughter & Caregiver)',
      setting: 'Hospital Clinic Office (04:30 PM)',
      action: 'Reviewing 4-pillar scores: Memory 82%, Attention 76%, Speed 1.8s, Consistency 84%',
      quote: '"Even while busy seeing patients at the clinic, I know father is taking his medicines and staying mentally sharp."',
      avatar: '👩‍⚕️',
      metric: 'Caregiver Status: All 3 Alarms Confirmed'
    },
    narrationSentences: [
      'Meanwhile, his daughter Dr. Anita checks the Caregiver Portal on her smartphone from the hospital clinic.',
      'She reviews the four non-medical cognitive health pillars: Memory Score at eighty-two percent, Attention at seventy-six percent, Reaction Latency at one point eight seconds, and a strong five-day Consistency streak.',
      'Smart proactive threshold alerts reassure her that all scheduled medications were confirmed on time.',
      'This provides complete remote transparency and reassurance to families across cities.'
    ],
    narrationSentencesHindi: [
      'इसी बीच, अस्पताल में काम करते हुए बेटी डॉक्टर अनिता अपने मोबाइल पर केयरगिवर पोर्टल देखती हैं।',
      'वे 4 मुख्य स्तंभों का विश्लेषण देखती हैं: मेमोरी 82%, अटेंशन 76%, रिस्पॉन्स 1.8 सेकंड और 5 दिन की शानदार स्ट्रीक।',
      'स्मार्ट अलर्ट्स यह पुष्टि करते हैं कि सभी दवाइयाँ समय पर ले ली गई हैं।',
      'यह तकनीक कामकाजी परिवारों को मीलों दूर रहकर भी पूरी मानसिक शांति प्रदान करती है।'
    ]
  },
  {
    id: 7,
    startSec: 155,
    endSec: 170,
    title: 'Real-World Offline Reliability in the Park',
    subtitle: 'Internet drops during evening walk; local vault records data & auto-syncs on return',
    badge: '07. OFFLINE-FIRST ARCHITECTURE',
    icon: '🌳',
    humanScene: {
      character: 'Arun on Evening Garden Walk',
      setting: 'Community Park (05:30 PM - Zero Internet)',
      action: 'Local IndexedDB offline vault caches routine checkoffs & audio alerts',
      quote: '"No internet in the park? No problem. Aabha still rings on time and records everything."',
      avatar: '📡',
      metric: 'Sync State: 🔴 Offline Vault ➔ 🟢 Auto-Synced'
    },
    narrationSentences: [
      'During his evening walk in the community park, cellular connectivity drops to zero bars.',
      'Aabha AI offline-first architecture ensures that hydration checkoffs, local chime reminders, and games operate uninterrupted.',
      'All interaction logs are safely cached in the encrypted local vault, and sync seamlessly the instant Arun connects to home Wi-Fi.',
      'Zero data loss guarantees reliability in Indian towns, villages, and during travel.'
    ],
    narrationSentencesHindi: [
      'शाम को पार्क में सैर करते समय मोबाइल नेटवर्क पूरी तरह चला जाता है।',
      'लेकिन आभा एआई का ऑफलाइन-फर्स्ट वॉल्ट बिना इंटरनेट के भी सभी अलार्म और चेक-ऑफ चालू रखता है।',
      'सारा डेटा फोन में सुरक्षित रहता है और घर आकर वाई-फाई मिलते ही अपने आप क्लाउड पर सिंक हो जाता है।',
      'यह भारत के दूरदराज इलाकों और यात्रा के दौरान भी 100 प्रतिशत विश्वसनीयता देता है।'
    ]
  },
  {
    id: 8,
    startSec: 170,
    endSec: 180,
    title: 'AABHA AI — SIH26003 Product Vision',
    subtitle: 'Supporting memory. Empowering independence. Connecting caregivers across India.',
    badge: '08. IMPACT & CONCLUSION',
    icon: '🏆',
    humanScene: {
      character: 'The Entire Indian Family Reunited',
      setting: 'Evening Dinner Table, Happy & Connected',
      action: 'A caring voice for every memory across 5 regional languages',
      quote: '"Aabha AI gives my father his confidence back, and gives our family peace of mind."',
      avatar: '🇮🇳',
      metric: 'SIH26003: Ready for Pan-India Deployment'
    },
    narrationSentences: [
      'Aabha AI transforms elderly care: supporting memory, empowering independence, and connecting caregivers.',
      'With six cognitive games, five regional Indian languages, offline reliability, and adaptive analytics, we are ready for nationwide deployment.',
      'Thank you for experiencing Aabha AI for Smart India Hackathon problem statement SIH twenty-six thousand three.'
    ],
    narrationSentencesHindi: [
      'आभा एआई बुजुर्गों की देखभाल में एक नई क्रांति है: यादों का संबल, स्वतंत्रता का संबल और परिवारों का विश्वास।',
      '6 कॉग्निटिव गेम्स, 5 भारतीय भाषाओं और 100% ऑफलाइन तकनीक के साथ हम पूरे भारत में सेवा के लिए तैयार हैं।',
      'स्मार्ट इंडिया हैकाथॉन SIH26003 के इस जीवंत प्रदर्शन को देखने के लिए आपका बहुत-बहुत धन्यवाद।'
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
        // Continuously play the next sentence immediately!
        if (isPlayingRef.current && isVoiceoverOnRef.current) {
          const nextIdx = safeIdx + 1;
          stageSentenceIdxRef.current = nextIdx;
          // Loop seamlessly within stage sentences
          setTimeout(() => {
            if (isPlayingRef.current && isVoiceoverOnRef.current) {
              const currentS =
                STAGES.find(s => s.id === currentStageIdRef.current) || stage;
              playContinuousSentence(currentS, nextIdx);
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
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-5xl bg-[var(--bg-surface)] rounded-[28px] sm:rounded-[36px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP PRESENTATION BAR ────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 py-3 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm">
                ✨
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
                  AABHA AI • 3-MIN CONTINUOUS SHOWCASE
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  Continuous Speech Narration
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Uninterrupted Voiceover with Ambient Wellness Background Music
              </div>
            </div>
          </div>

          {/* Controls: Voiceover + Music + Lang + Timer + Play/Pause + Restart + Close */}
          <div className="flex items-center gap-1 sm:gap-2">
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
            <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs sm:text-sm font-black text-emerald-400">
              {formatTime(seconds)} / 03:00
            </div>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title="Restart 3-Minute Showcase"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer border border-rose-500/30 ml-1"
              title="Exit Showcase"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── PROGRESS BAR & STAGE STEPPER ────────────────────────────────── */}
        <div className="bg-[var(--bg-surface-secondary)] px-4 sm:px-8 py-2 border-b border-[var(--border)] space-y-1.5 shrink-0">
          {/* Continuous Progress Line */}
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 h-full transition-all duration-300"
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
                  className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm scale-105'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-purple-400'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="hidden md:inline">{s.badge.split('.')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── LIVE VOICE NARRATION CONTINUOUS SUBTITLE TICKER ─────────────── */}
        <div className="px-4 sm:px-8 py-2.5 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-teal-500/15 border-b border-purple-400/20 flex items-center gap-3 shrink-0 shadow-inner">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-black shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Speaking Now:</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] italic leading-relaxed animate-fade-in line-clamp-2">
            "{activeSubtitle}"
          </p>
        </div>

        {/* ─── DYNAMIC STAGE CONTENT CONTAINER (REAL-LIFE STORIES) ─────────── */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* Real-Life Human Scenario Spotlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-400/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-md flex items-center justify-center text-3xl shrink-0 animate-bounce">
                {currentStage.humanScene.avatar}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {currentStage.humanScene.character}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    📍 {currentStage.humanScene.setting}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {currentStage.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium italic">
                  {currentStage.humanScene.quote}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-right self-stretch md:self-center shrink-0">
              <div className="text-[10px] uppercase font-black text-[var(--text-muted)]">Live Impact Metric</div>
              <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {currentStage.humanScene.metric}
              </div>
            </div>
          </div>

          {/* ─── STAGE 1: Real Life & The Aging Challenge ──────────────────── */}
          {currentStage.id === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center text-base">
                  👵
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Mild Memory Challenges</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Forgetting morning dosages, hydration targets, and doctor appointments causes hesitation and stress.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 flex items-center justify-center text-base">
                  👩‍⚕️
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Caregiver Anxiety</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Working daughters and sons worry constantly while at work about whether parents took critical medicines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-base">
                  ✨
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">The AABHA Solution</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  An AI companion providing dignified independence, zero hallucination voice care, and real-time remote peace of mind.
                </p>
              </div>
            </div>
          )}

          {/* ─── STAGE 2: Accessible Morning Dashboard in Action ──────────── */}
          {currentStage.id === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-rose-500/30 text-center">
                  <span className="text-2xl">🚨</span>
                  <div className="text-xs font-black mt-1">Emergency SOS</div>
                  <div className="text-[10px] text-rose-500 font-bold">1-Tap GPS Dispatch</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-teal-500/30 text-center">
                  <span className="text-2xl">💊</span>
                  <div className="text-xs font-black mt-1">Donepezil 5mg</div>
                  <div className="text-[10px] text-teal-500 font-bold">Taken at 08:30 AM ✓</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-blue-500/30 text-center">
                  <span className="text-2xl">💧</span>
                  <div className="text-xs font-black mt-1">Hydration (1/6)</div>
                  <div className="text-[10px] text-blue-500 font-bold">Warm water logged ✓</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-indigo-500/30 text-center">
                  <span className="text-2xl">📅</span>
                  <div className="text-xs font-black mt-1">Daily Routine</div>
                  <div className="text-[10px] text-indigo-500 font-bold">5 Tasks Scheduled</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 3: Natural Voice Companion at Breakfast ─────────────── */}
          {currentStage.id === 3 && (
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Abha3DOrb size="sm" state="SPEAKING" interactive={false} />
                  <span className="text-sm font-black">Conversational Dialogue (Hindi / English / 5 Languages)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-600 dark:text-purple-300">
                  Zero Hallucination
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-purple-600 text-white max-w-sm ml-auto text-right font-bold">
                  🗣️ "Aabha, mera aaj ka kya program hai?"
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] max-w-md text-left font-medium leading-relaxed shadow-sm">
                  🤖 "Namaste Arun ji! Aapne subah ka Donepezil le liya hai. Agla program 01:00 PM par lunch aur Memantine dose hai, aur shaam 05:00 PM par park walk!"
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 4: Cognitive Gaming with Grandchildren ──────────────── */}
          {currentStage.id === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎴</span>
                  <div>
                    <div className="text-xs sm:text-sm font-black">Memory Match: Animal & Nature Pair Recall</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Granddaughter cheering each successful match</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-500">Accuracy: 85%</div>
                  <div className="text-[10px] text-purple-500 font-mono">Reaction Latency: 1.8s</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
                {[
                  { icon: '🍎', flipped: true, matched: true },
                  { icon: '🍎', flipped: true, matched: true },
                  { icon: '🌸', flipped: true, matched: false },
                  { icon: '❓', flipped: false, matched: false },
                  { icon: '🔔', flipped: true, matched: true },
                  { icon: '🔔', flipped: true, matched: true },
                  { icon: '🕊️', flipped: false, matched: false },
                  { icon: '🌸', flipped: true, matched: false }
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`h-14 sm:h-16 rounded-xl border flex items-center justify-center text-xl sm:text-2xl font-black transition-all ${
                      c.matched
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-600 scale-105 shadow-sm'
                        : c.flipped
                        ? 'bg-purple-500/20 border-purple-400 text-purple-600'
                        : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {c.flipped ? c.icon : '✨'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STAGE 5: Adaptive AI Dynamic Scaling Engine ────────────────── */}
          {currentStage.id === 5 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-400/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span className="text-sm font-black uppercase">Adaptive Neuro-Stimulation Algorithm</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600">
                  Difficulty Level: 3 (Auto Scaled)
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                "Arun's recall latency of <strong>1.8s</strong> and consistency score of <strong>85%</strong> triggered adaptive scaling. The system expands the grid to 4×4 and tailors the next game: <em>Daily Routine Ordering</em>."
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Calculated Cognitive Index</div>
                  <div className="text-base font-black text-emerald-500">80 / 100</div>
                </div>
                <div className="p-2.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Recommendation Engine</div>
                  <div className="text-base font-black text-purple-500">Chronological Sequencing</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 6: Caregiver Remote Monitoring ──────────────────────── */}
          {currentStage.id === 6 && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black">Dr. Anita's Smartphone View at Hospital Clinic</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Live 4-Pillar Non-Medical Cognitive Radar</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600">
                  All Systems Normal
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Memory Score</div>
                  <div className="text-lg font-black text-emerald-500 mt-1">82%</div>
                  <div className="text-[9px] text-emerald-600 font-bold">+12% vs baseline</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Attention</div>
                  <div className="text-lg font-black text-cyan-500 mt-1">76%</div>
                  <div className="text-[9px] text-cyan-600 font-bold">Stable focus</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Reaction Speed</div>
                  <div className="text-lg font-black text-purple-500 mt-1">1.8s</div>
                  <div className="text-[9px] text-purple-600 font-bold">Fast response</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] uppercase font-black text-[var(--text-secondary)]">Consistency</div>
                  <div className="text-lg font-black text-amber-500 mt-1">84%</div>
                  <div className="text-[9px] text-amber-600 font-bold">5-Day streak 🔥</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGE 7: Offline-First Reliability in Park ────────────────── */}
          {currentStage.id === 7 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center animate-fade-in">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <WifiOff className="w-6 h-6 text-rose-500 mx-auto" />
                <div className="text-xs font-black text-rose-500">1. Park Walk: 0 Bars</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Local SQLite/IndexedDB vault stores checkoffs without internet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                <div className="text-xs font-black text-amber-500">2. Home Wi-Fi Detected</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Automatic background sync pushes queued activities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <div className="text-xs font-black text-emerald-500">3. Synced 🟢</div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Zero data loss. Daughter's portal updated.
                </p>
              </div>
            </div>
          )}

          {/* ─── STAGE 8: SIH26003 Product Impact & Vision ─────────────────── */}
          {currentStage.id === 8 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white text-center space-y-4 animate-fade-in shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-teal-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-300 via-teal-300 to-white bg-clip-text text-transparent">
                  AABHA AI — SIH26003
                </h3>
                <p className="text-sm font-semibold text-purple-200 mt-1 max-w-lg mx-auto leading-relaxed">
                  "A caring voice for every memory. Empowering independence for elderly parents, bringing peace of mind to Indian families."
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ 6 Cognitive Games
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ 5 Regional Languages
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ 100% Offline Vault
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  ✓ Remote Caregiver Portal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-8 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Continuous speech active • 100% uninterrupted voiceover</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              ↻ Restart
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              Exit Showcase
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;
