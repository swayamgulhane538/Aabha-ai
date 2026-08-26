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
  Star
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';
import { ambientMusic, MUSIC_TRACKS, MusicTrackInfo } from '../services/ambientMusicService';

interface StageConfig {
  id: number;
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  storyChapter: string;
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
    title: 'Chapter 1: Morning in New Delhi with Dadaji',
    subtitle: '72-year-old retired teacher Arun Das and his daughter Dr. Anita',
    badge: 'SCENE 01 • THE AGING CHALLENGE',
    icon: '🏡',
    storyChapter: 'Scene 1: Morning Dilemma at Home',
    cartoonScene: {
      bgGradient: 'from-amber-100 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900',
      settingLabel: '🏠 Cozy Living Room • 08:00 AM',
      characterA: {
        name: 'Dadaji (Mr. Arun Das, 72)',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Sitting on sofa searching for medicine strip',
        dialogue: 'Subah ki dawai li thi ya nahi? Paani kitna piya tha? 🤔',
        dialogueType: 'thought'
      },
      characterB: {
        name: 'Dr. Anita (Daughter, 42)',
        role: 'Doctor & Caregiver',
        emoji: '👩‍⚕️',
        actionText: 'Rushing to hospital clinic shift with stethoscope',
        dialogue: 'Papa, chinta mat kijiye! Aabha tablet par sab bata degi! 👋',
        dialogueType: 'speech'
      },
      companionAction: 'AABHA Orb floats gently, winking with reassuring smile ✨',
      keyPropEmoji: '💊',
      keyPropLabel: 'Morning Pill Box',
      outcomePill: 'Dignified Self-Care Needed'
    },
    narrationSentences: [
      'Welcome to the animated story of Aabha AI, an intelligent daily companion for elderly care.',
      'In a quiet morning living room in Delhi, meet seventy-two-year-old grandfather Arun Das, fondly called Dadaji.',
      'Like millions of Indian elders, Dadaji wants to stay independent, but mild memory lapses make remembering medicines and water intake stressful.',
      'His daughter, Doctor Anita, worries about his daily care while working long shifts at the hospital clinic.',
      'Aabha AI enters their home to transform everyday routines into joyful, guided interactions.'
    ],
    narrationSentencesHindi: [
      'आभा एआई की एनिमेटेड कहानी में आपका स्वागत है, जो बुजुर्गों के जीवन में खुशियों का रंग भरती है।',
      'नई दिल्ली के एक शांत घर में मिलते हैं 72 वर्षीय दादाजी, श्री अरुण दास जी से।',
      'दादाजी स्वावलंबी रहना चाहते हैं, लेकिन कभी-कभी सुबह की दवाई और पानी का समय याद रखना मुश्किल हो जाता है।',
      'उनकी डॉक्टर बेटी अनिता अस्पताल में काम करते हुए भी पिता की सेहत को लेकर चिंतित रहती हैं।',
      'इसीलिए उनके जीवन में आती है आभा एआई, जो हर दिनचर्या को आसान और तनावमुक्त बनाती है।'
    ]
  },
  {
    id: 2,
    startSec: 22,
    endSec: 45,
    title: 'Chapter 2: Dadaji Taps the Big Glowing Tablet',
    subtitle: '1-Tap medicine checkoff and water logging on high-contrast screen',
    badge: 'SCENE 02 • ACCESSIBLE MORNING',
    icon: '☕',
    storyChapter: 'Scene 2: Breakfast Table & 1-Tap Dashboard',
    cartoonScene: {
      bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900',
      settingLabel: '☕ Breakfast Table • 08:30 AM',
      characterA: {
        name: 'Dadaji',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Tapping large glowing green button on tablet',
        dialogue: 'Arey waah! Chashme ke bina bhi sab saaf dikh raha hai! 😄',
        dialogueType: 'speech'
      },
      companionAction: 'Aabha Tablet displays: Donepezil (5mg) Confirmed! 💧 Glass 1/6 Logged!',
      keyPropEmoji: '📱',
      keyPropLabel: 'High-Contrast Aabha Tablet',
      outcomePill: '100% Morning Medicine Logged ✓'
    },
    narrationSentences: [
      'At the breakfast table, Dadaji sits comfortably with his morning tea and tablet.',
      'Aabha AI presents large, colorful touch buttons designed specifically for senior eyes and fingers.',
      'With a single joyful tap, Dadaji logs his Donepezil medicine and drinks his first glass of warm water.',
      'A cheerful green checkmark pops up on screen, giving him immediate confidence without needing reading glasses.',
      'Emergency SOS and hydration progress stay permanently visible at the top of the screen.'
    ],
    narrationSentencesHindi: [
      'नाश्ते की मेज पर दादाजी अपनी सुबह की चाय के साथ टैबलेट लेकर बैठते हैं।',
      'आभा एआई का बड़ा और रंगीन इंटरफेस खास बुजुर्गों की आँखों के लिए तैयार किया गया है।',
      'दादाजी सिर्फ एक हल्के टैप से अपनी डोनेपेज़िल दवाई और पानी का पहला गिलास टिक कर देते हैं।',
      'स्क्रीन पर तुरंत चमकता हुआ हरा निशान आ जाता है, जिससे उन्हें बिना चश्मे के भी पूरा भरोसा रहता है।'
    ]
  },
  {
    id: 3,
    startSec: 45,
    endSec: 75,
    title: 'Chapter 3: Chatting with Aabha on the Balcony',
    subtitle: 'Zero-hallucination conversational voice care in natural Hindi and English',
    badge: 'SCENE 03 • VOICE COMPANION',
    icon: '🎤',
    storyChapter: 'Scene 3: Balcony Tea & Friendly AI Voice',
    cartoonScene: {
      bgGradient: 'from-purple-100 via-indigo-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900',
      settingLabel: '🪴 Sunny Balcony Garden • 09:00 AM',
      characterA: {
        name: 'Dadaji',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Sipping hot tea, speaking warmly into the air',
        dialogue: 'Aabha, mera aaj ka kya program hai beta? 🗣️',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Aabha AI (3D Voice Companion)',
        role: 'Intelligent AI Companion',
        emoji: '🤖',
        actionText: 'Pulsing with warm purple voice waves and cheerful smile',
        dialogue: 'Namaste Arun ji! 01:00 PM par lunch aur Memantine dawai hai, fir 5 baje park walk! ✨',
        dialogueType: 'speech'
      },
      companionAction: 'Deterministic SQL database retrieval with ZERO hallucinations',
      keyPropEmoji: '☕',
      keyPropLabel: 'Steaming Cup of Chai',
      outcomePill: '0.3s Speech Intent Resolution'
    },
    narrationSentences: [
      'Sitting in his balcony among blooming flower pots, Dadaji speaks naturally to Aabha.',
      'He asks warmly in Hindi: "Aabha, what is my schedule today?"',
      'Aabha AI responds with human warmth, fetching exact stored records from local memory with zero hallucination.',
      'She gently reminds him of lunch at one o clock, his afternoon Memantine dose, and his evening stroll.',
      'Multi-lingual voice technology supports Hindi, English, Bengali, Assamese, and Marathi seamlessly.'
    ],
    narrationSentencesHindi: [
      'बालकनी में फूलों के बीच चाय पीते हुए दादाजी प्यार से पूछते हैं: "आभा, मेरा आज का क्या कार्यक्रम है?"',
      'आभा एआई एक परिवार के सदस्य की तरह विनम्रता और मिठास से जवाब देती है।',
      'वह बिना किसी गलती के असली डेटाबेस से दोपहर के भोजन, दवाई और शाम की सैर का सही समय बताती है।',
      'यह बहुभाषी तकनीक हिंदी, अंग्रेजी, मराठी, बंगाली और असमिया में सहज बातचीत करती है।'
    ]
  },
  {
    id: 4,
    startSec: 75,
    endSec: 110,
    title: 'Chapter 4: Brain Games with Granddaughter Priya',
    subtitle: 'Memory Match & Routine Ordering turning brain exercise into family fun',
    badge: 'SCENE 04 • COGNITIVE PLAYROOM',
    icon: '🎴',
    storyChapter: 'Scene 4: Joyful Intergenerational Gaming',
    cartoonScene: {
      bgGradient: 'from-amber-50 via-yellow-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900',
      settingLabel: '🎨 Playroom Carpet • 03:00 PM',
      characterA: {
        name: 'Dadaji',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Flipping colorful apple and flower memory cards',
        dialogue: 'Mil gaya! Apple ke saath Apple! Mera score 85% ho gaya! 🎯',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Priya (Granddaughter, Age 9)',
        role: 'Grandchild Cheerleader',
        emoji: '👧',
        actionText: 'Clapping hands and jumping with celebration confetti',
        dialogue: 'Yayyy Dadu! Aapne saare pairs match kar diye! Super Dadu! 🎉',
        dialogueType: 'speech'
      },
      companionAction: 'Real-time tracking of 85% accuracy and 1.8s reaction latency',
      keyPropEmoji: '🎴',
      keyPropLabel: 'Interactive Cartoon Cards',
      outcomePill: 'Visual Recall Score: 85% Accuracy'
    },
    narrationSentences: [
      'In the afternoon, nine-year-old granddaughter Priya joins Dadaji on the colorful living room rug.',
      'Together they play Memory Match and Daily Routine Ordering on the tablet.',
      'While it feels like joyful playtime, Aabha AI precisely measures Dadaji\'s visual recall, card matching accuracy, and reaction speed.',
      'Dadaji achieves an impressive eighty-five percent score with a swift one point eight second response time.',
      'Priya cheers with confetti, turning cognitive wellness into warm intergenerational bonding.'
    ],
    narrationSentencesHindi: [
      'दोपहर में 9 साल की नन्हीं पोती प्रिया दादाजी के साथ गेम खेलने आ जाती है।',
      'दोनों मिलकर टैबलेट पर मेमोरी मैच और रूटीन कार्ड्स के जोड़े बनाते हैं।',
      'यह खेल केवल मनोरंजन नहीं है—आभा एआई बैकग्राउंड में दादाजी की याददाश्त और रिफ्लेक्स गति को मापती है।',
      'दादाजी 85% की शानदार एक्यूरेसी लाते हैं और प्रिया तालियाँ बजाकर खुशी से झूम उठती है।'
    ]
  },
  {
    id: 5,
    startSec: 110,
    endSec: 135,
    title: 'Chapter 5: The AI Brain Levels Up!',
    subtitle: 'Adaptive AI Engine dynamically scales difficulty to Level 3',
    badge: 'SCENE 05 • ADAPTIVE AI LAB',
    icon: '🧠',
    storyChapter: 'Scene 5: Real-Time Neuro-Stimulation Scaling',
    cartoonScene: {
      bgGradient: 'from-cyan-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900',
      settingLabel: '⚡ Aabha AI Neural Engine Core',
      characterA: {
        name: 'Dadaji',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Smiling proudly as gold stars burst onto the screen',
        dialogue: 'Level 3 aa gaya! Ab aur mazaa aayega! ⭐⭐⭐',
        dialogueType: 'speech'
      },
      characterB: {
        name: 'Adaptive AI Engine',
        role: 'Neuro-Calibrator',
        emoji: '🧠',
        actionText: 'Pulsing glowing neural wires and expanding 4x4 card grid',
        dialogue: 'Performance > 80% Detected ➔ Unlocking Level 3 Challenges! 🚀',
        dialogueType: 'speech'
      },
      companionAction: 'Dynamically scales difficulty without frustration or fatigue',
      keyPropEmoji: '⭐',
      keyPropLabel: '3 Gold Stars & Badge',
      outcomePill: 'Adaptive Scaling: Level 2 ➔ Level 3'
    },
    narrationSentences: [
      'Inside the system, our Adaptive AI Engine evaluates Dadaji\'s progress in real time.',
      'Because his recall accuracy exceeded eighty percent, the engine automatically upgrades his difficulty to Level 3.',
      'It expands the card grid to four by four, introducing gentle cognitive distractor elements.',
      'The personalization engine automatically queues his next activity: Daily Routine Chronological Ordering.',
      'This guarantees the brain exercises remain engaging, rewarding, and never frustrating.'
    ],
    narrationSentencesHindi: [
      'सिस्टम के अंदर आभा का एडेप्टिव एआई इंजन दादाजी के प्रदर्शन का लाइव विश्लेषण करता है।',
      '85% का शानदार स्कोर देखकर एआई इंजन गेम को लेवल 2 से लेवल 3 में अपग्रेड कर देता है।',
      'कार्ड ग्रिड बड़ा हो जाता है और नए दिलचस्प पैटर्न आते हैं ताकि दिमाग की कसरत होती रहे।',
      'यह एडेप्टिव तकनीक दिमाग को हमेशा सक्रिय रखती है और किसी भी तरह की निराशा से बचाती है।'
    ]
  },
  {
    id: 6,
    startSec: 135,
    endSec: 155,
    title: 'Chapter 6: Dr. Anita Checks from Hospital Clinic',
    subtitle: 'Caregiver Portal with 4-Pillar cognitive radar and peace of mind',
    badge: 'SCENE 06 • CAREGIVER CLINIC',
    icon: '🏥',
    storyChapter: 'Scene 6: Remote Peace of Mind at Work',
    cartoonScene: {
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900',
      settingLabel: '🏥 Hospital Clinic Desk • 04:30 PM',
      characterA: {
        name: 'Dr. Anita Verma',
        role: 'Doctor & Daughter',
        emoji: '👩‍⚕️',
        actionText: 'Checking Aabha Caregiver Portal on her smartphone',
        dialogue: 'Papa ki Memory 82%, saari dawai time par li! Dil ko kitna sukoon milta hai! 💚',
        dialogueType: 'thought'
      },
      companionAction: 'Live 4-Pillar Radar: Memory 82%, Attention 76%, Speed 1.8s, Consistency 84%',
      keyPropEmoji: '🩺',
      keyPropLabel: 'Stethoscope & Clinic Phone',
      outcomePill: 'Caregiver Status: 100% Peace of Mind'
    },
    narrationSentences: [
      'Meanwhile, across the city at the hospital clinic, Doctor Anita takes a quick break.',
      'She opens the Caregiver Portal on her phone and sees the live four-pillar cognitive health overview.',
      'Memory Score is at eighty-two percent, Attention at seventy-six percent, and all three daily medications are confirmed.',
      'Smart non-diagnostic alerts reassure her that her father is safe, active, and thriving at home.'
    ],
    narrationSentencesHindi: [
      'इसी बीच, अस्पताल में मरीजों को देखने के बाद डॉक्टर अनिता अपने फोन पर आभा पोर्टल खोलती हैं।',
      'उन्हें पिता के 4 मुख्य स्तंभों का लाइव ग्राफ दिखता है: मेमोरी 82%, अटेंशन 76%, और सभी दवाइयाँ समय पर पूरी।',
      'स्मार्ट अलर्ट्स उन्हें आश्वस्त करते हैं कि घर पर पिता पूरी तरह सुरक्षित और खुश हैं।'
    ]
  },
  {
    id: 7,
    startSec: 155,
    endSec: 170,
    title: 'Chapter 7: Evening Park Walk with Zero Internet',
    subtitle: 'Offline-first vault chimes on time and auto-syncs upon returning home',
    badge: 'SCENE 07 • OFFLINE PARK WALK',
    icon: '🌳',
    storyChapter: 'Scene 7: Offline-First Reliability',
    cartoonScene: {
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900',
      settingLabel: '🌳 Green Community Park • 05:30 PM (0 Bars)',
      characterA: {
        name: 'Dadaji',
        role: 'Grandfather',
        emoji: '👴',
        actionText: 'Enjoying evening walk in fresh park breeze',
        dialogue: 'Park me network nahi hai, fir bhi Aabha ne time par paani pine ki ghanti bajayi! 🔔',
        dialogueType: 'speech'
      },
      companionAction: 'Cloud shows ☁️❌ Offline Vault Active ➔ Returning Home ➔ 🟢 Wi-Fi Auto-Synced!',
      keyPropEmoji: '🌳',
      keyPropLabel: 'Park Trees & Walking Shoes',
      outcomePill: 'Zero Data Loss • Auto Synced'
    },
    narrationSentences: [
      'In the evening, Dadaji goes for a brisk walk in the community park where cellular internet drops completely.',
      'Aabha AI\'s offline-first architecture continues running seamlessly on local storage, chiming a gentle reminder to drink water.',
      'The moment Dadaji walks back through his front door, the cached offline activity queue automatically syncs with the caregiver cloud.',
      'Zero data loss guarantees reliability across Indian towns, villages, and outdoor journeys.'
    ],
    narrationSentencesHindi: [
      'शाम को दादाजी पार्क में सैर करने जाते हैं जहाँ मोबाइल नेटवर्क पूरी तरह गायब हो जाता है।',
      'लेकिन आभा का ऑफलाइन वॉल्ट बिना इंटरनेट के भी समय पर पानी पीने का अलार्म बजाता है।',
      'जैसे ही दादाजी घर लौटते हैं, सारा डेटा अपने आप वाई-फाई से सिंक हो जाता है।',
      'यह तकनीक भारत के हर गाँव और शहर में 100% विश्वसनीयता सुनिश्चित करती है।'
    ]
  },
  {
    id: 8,
    startSec: 170,
    endSec: 180,
    title: 'Chapter 8: The Happy Family Celebration & SIH Trophy',
    subtitle: 'Supporting memory, empowering independence, and connecting Indian families',
    badge: 'SCENE 08 • THE GRAND FINALE',
    icon: '🏆',
    storyChapter: 'Scene 8: Dignity, Joy & Pan-India Vision',
    cartoonScene: {
      bgGradient: 'from-purple-100 via-pink-50 to-amber-100 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900',
      settingLabel: '🍽️ Family Dinner Table • 08:30 PM',
      characterA: {
        name: 'Dadaji, Anita & Priya',
        role: 'The Reunited Indian Family',
        emoji: '👨‍👩‍👧',
        actionText: 'Smiling together around the dinner table with gold medal',
        dialogue: 'Aabha ne humare ghar me khushiyaan aur sukoon la diya! ❤️',
        dialogueType: 'speech'
      },
      companionAction: 'Aabha AI Orb glows with gold champion wreath & SIH26003 trophy 🏆',
      keyPropEmoji: '🏆',
      keyPropLabel: 'SIH 26003 Gold Trophy',
      outcomePill: 'Ready for Pan-India Deployment 🇮🇳'
    },
    narrationSentences: [
      'At the dinner table, three generations sit together with smiles, laughter, and peace of mind.',
      'Aabha AI empowers our elders to live with dignity and independence while keeping caregivers connected.',
      'With six cognitive games, five regional languages, offline capability, and transparent AI analytics, Aabha AI is ready for nationwide deployment.',
      'Thank you for experiencing Aabha AI for Smart India Hackathon problem statement SIH twenty-six thousand three!'
    ],
    narrationSentencesHindi: [
      'रात के खाने की मेज पर तीनों पीढ़ियाँ एक साथ मुस्कुराती और खुशियाँ मनाती हैं।',
      'आभा एआई बुजुर्गों को गरिमा देती है और परिवारों को अटूट विश्वास और सुरक्षा।',
      '6 कॉग्निटिव गेम्स, 5 भारतीय भाषाओं और 100% ऑफलाइन तकनीक के साथ हम पूरे देश की सेवा के लिए तैयार हैं।',
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
  const [activeTrack, setActiveTrack] = useState<MusicTrackInfo>(ambientMusic.getActiveTrack());

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
        // Continuously play the next sentence immediately
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
        ambientMusic.start(0.35);
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
      ambientMusic.start(0.35);
      setIsMusicOn(true);
    }
  };

  const handleCycleMusicTrack = () => {
    const nextT = ambientMusic.cycleNextTrack();
    setActiveTrack(nextT);
    if (!isMusicOn) {
      setIsMusicOn(true);
      ambientMusic.start(0.08, nextT.id);
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
      onPointerDown={() => ambientMusic.ensureAudioContext()}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-6xl bg-[var(--bg-surface)] rounded-[24px] sm:rounded-[36px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP PRESENTATION BAR ────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-purple-500 to-amber-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm">
                🎬
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                  AABHA AI • ANIMATED STORY SHOWCASE
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Cartoon Storyboard Flow
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Illustrated Family Story with Continuous Voiceover & Ambient BGM
              </div>
            </div>
          </div>

          {/* Controls: Voiceover + Music + Lang + Timer + Play/Pause + Restart + Close */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Ambient Background Music Toggle & 2nd Track Selector */}
            <div className="flex items-center bg-white/10 rounded-xl border border-white/15 p-0.5">
              <button
                type="button"
                onClick={handleToggleMusic}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  isMusicOn
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'text-slate-400'
                }`}
                title={isMusicOn ? 'Mute Background Music' : 'Start Background Music'}
              >
                <Music className={`w-3.5 h-3.5 ${isMusicOn ? 'text-purple-400 animate-bounce' : ''}`} />
                <span className="hidden sm:inline text-[11px]">{isMusicOn ? 'BGM ON' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={handleCycleMusicTrack}
                className="px-2 py-1 rounded-lg text-[11px] font-black text-amber-300 hover:text-amber-200 bg-white/5 hover:bg-white/15 transition cursor-pointer flex items-center gap-1"
                title={`Current: ${activeTrack.name} (Click to switch track)`}
              >
                <span>{activeTrack.icon}</span>
                <span className="hidden md:inline">{activeTrack.shortName}</span>
              </button>
            </div>

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
            <span className="hidden sm:inline">Story Narrator:</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] italic leading-relaxed animate-fade-in line-clamp-2">
            "{activeSubtitle}"
          </p>
        </div>

        {/* ─── DYNAMIC CARTOON THEATER & INTERACTIVE STORY STAGE ───────────── */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4">
          {/* 🎭 THE MAIN ANIMATED CARTOON STORYBOARD STAGE ──────────────────── */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-br ${currentStage.cartoonScene.bgGradient} border-2 border-amber-400/40 shadow-xl relative overflow-hidden transition-all duration-700 space-y-4`}>
            {/* Top Stage Header: Setting & Scene Label */}
            <div className="flex items-center justify-between relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-sm flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>{currentStage.cartoonScene.settingLabel}</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-600 text-white shadow-md">
                {currentStage.badge}
              </span>
            </div>

            {/* ─── ANIMATED CARTOON CHARACTERS & COMIC SPEECH BUBBLES ───────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10 pt-2">
              {/* Character A (Dadaji / Patient) Card */}
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
                      AABHA AI Companion Active
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
                <span className="text-slate-800 dark:text-slate-200">Key Prop: {currentStage.cartoonScene.keyPropLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-amber-500">✨ Story Outcome:</span>
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

            {/* Stage-Specific App Previews */}
            {currentStage.id === 1 && (
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👴</div>
                  <div className="font-bold mt-1">72-Yr Elder</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Independent living</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👩‍⚕️</div>
                  <div className="font-bold mt-1">Doctor Daughter</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Remote peace of mind</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">🤖</div>
                  <div className="font-bold mt-1">Aabha Companion</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Daily friendly care</div>
                </div>
              </div>
            )}

            {currentStage.id === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-lg">🚨</span>
                  <div className="font-black text-rose-500">SOS 1-Tap</div>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <span className="text-lg">💊</span>
                  <div className="font-black text-teal-500">Donepezil 5mg ✓</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-lg">💧</span>
                  <div className="font-black text-blue-500">Warm Water 1/6 ✓</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-lg">📅</span>
                  <div className="font-black text-indigo-500">5 Tasks Scheduled</div>
                </div>
              </div>
            )}

            {currentStage.id === 3 && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗣️</span>
                  <span>"Aabha, mera aaj ka kya program hai?"</span>
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
                  <span>Memory Match (Grandpa & Priya Playing Together)</span>
                </div>
                <span className="font-mono font-bold text-emerald-500">Accuracy: 85% • Latency: 1.8s</span>
              </div>
            )}

            {currentStage.id === 5 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>Score 85% &gt; 80% Threshold ➔ Grid Expanded to 4×4</span>
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
                  <span>Park Walk: 0 Cellular Bars ➔ Offline SQLite Vault Active</span>
                </div>
                <span className="text-emerald-500 font-bold">Auto-Syncs on Wi-Fi ✓</span>
              </div>
            )}

            {currentStage.id === 8 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-xs flex items-center justify-between">
                <span>🏆 SIH26003: Supporting Memory, Empowering Independence</span>
                <span>Ready for Pan-India Deployment 🇮🇳</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Animated cartoon story • Continuous AI speech active • SIH26003</span>
            <span className="sm:hidden">Cartoon Story Flow</span>
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
