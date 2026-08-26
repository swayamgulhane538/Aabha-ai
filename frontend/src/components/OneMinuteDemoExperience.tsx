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
  Share2,
  Globe
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';
import { ambientMusic } from '../services/ambientMusicService';

type SpeakerId = 'narrator' | 'father' | 'daughter' | 'doctor' | 'aabha';
type SupportedLang = 'HI' | 'EN' | 'MR';

interface DialogueLine {
  speaker: SpeakerId;
  speakerName: string;
  speakerNameMarathi?: string;
  speakerEmoji: string;
  text: string;
  textHindi: string;
  textMarathi: string;
}

interface SceneConfig {
  id: number;
  startSec: number;
  endSec: number;
  sceneNumber: string;
  title: string;
  titleMarathi: string;
  subtitle: string;
  subtitleMarathi: string;
  badge: string;
  bgGradient: string;
  visualAtmosphere: string;
  visualElements: {
    icon: string;
    label: string;
    labelMarathi: string;
    desc: string;
    descMarathi: string;
  }[];
  activeCardProps: {
    title: string;
    titleMarathi: string;
    subtitle: string;
    subtitleMarathi: string;
    tag: string;
    tagMarathi: string;
    iconEmoji: string;
  };
  dialogues: DialogueLine[];
}

const SPEAKER_PROFILES: Record<SpeakerId, { pitch: number; rate: number; label: string; labelMarathi: string; color: string; bgColor: string }> = {
  father: {
    pitch: 0.82,
    rate: 0.90,
    label: '👴 Father (Papa)',
    labelMarathi: '👴 बाबा (वडील)',
    color: 'text-amber-600 dark:text-amber-300',
    bgColor: 'bg-amber-500/20 border-amber-400'
  },
  daughter: {
    pitch: 1.25,
    rate: 1.05,
    label: '👩 Daughter (Beta)',
    labelMarathi: '👩 मुलगी (अनिता)',
    color: 'text-pink-600 dark:text-pink-300',
    bgColor: 'bg-pink-500/20 border-pink-400'
  },
  doctor: {
    pitch: 1.05,
    rate: 1.02,
    label: '👨‍⚕️ Doctor',
    labelMarathi: '👨‍⚕️ डॉक्टर',
    color: 'text-cyan-600 dark:text-cyan-300',
    bgColor: 'bg-cyan-500/20 border-cyan-400'
  },
  aabha: {
    pitch: 1.15,
    rate: 1.02,
    label: '🤖 AABHA AI Assistant',
    labelMarathi: '🤖 आभा एआय (डिजिटल साथी)',
    color: 'text-purple-600 dark:text-purple-300',
    bgColor: 'bg-purple-500/20 border-purple-400'
  },
  narrator: {
    pitch: 1.00,
    rate: 1.02,
    label: '🎙️ Voiceover Narrator',
    labelMarathi: '🎙️ सूत्रधार (कथावाचक)',
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
    titleMarathi: 'समस्या: फाईल्सच्या ढिगाऱ्यात हरवलेला आरोग्य इतिहास',
    subtitle: 'Medical files, scattered prescriptions, and the struggle to find reports',
    subtitleMarathi: 'वैद्यकीय फाइल्स, विखुरलेली औषधांची प्रिस्क्रिप्शन्स आणि रिपोर्ट शोधण्याची धडपड',
    badge: '0:00 – 0:25 • THE SCATTERED FILES',
    bgGradient: 'from-stone-900 via-amber-950/70 to-slate-950',
    visualAtmosphere: 'Dark, desaturated Indian living room with paper clutter',
    visualElements: [
      {
        icon: '📁',
        label: 'Purani Files Ka Dher',
        labelMarathi: 'जुन्या फाईल्सचा ढीग',
        desc: 'Blood reports, X-rays aur prescriptions table par bikhre hain',
        descMarathi: 'रक्त तपासणी रिपोर्ट, क्ष-किरण आणि औषधांचे कागद विखुरलेले'
      },
      {
        icon: '🔍',
        label: 'Missing History',
        labelMarathi: 'इतिहास गहाळ',
        desc: 'Pichhli report dhundhne mein waqt barbaad',
        descMarathi: 'मागील महत्त्वाची रिपोर्ट शोधण्यात वेळ वाया'
      },
      {
        icon: '⌛',
        label: 'Unorganized Care',
        labelMarathi: 'अव्यवस्थित नोंदी',
        desc: 'Ek report ghar par, ek clinic par',
        descMarathi: 'एक रिपोर्ट घरी, एक दवाखान्यात'
      }
    ],
    activeCardProps: {
      title: 'Scattered Physical Paper Records',
      titleMarathi: 'विखुरलेले जुने कागदी आरोग्य नोंदी',
      subtitle: 'India mein hum health ka khayal rakhte hain, par history sambhal nahi paate.',
      subtitleMarathi: 'आपण आरोग्याची काळजी घेतो, पण आरोग्याचा इतिहास फाईल्समध्ये हरवून बसतो.',
      tag: 'Problem Statement',
      tagMarathi: 'समस्या',
      iconEmoji: '📑'
    },
    dialogues: [
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerNameMarathi: 'बाबा',
        speakerEmoji: '👴',
        text: 'Beta… where did you keep my previous blood report? Dr. Verma asked for it.',
        textHindi: 'बेटा… वो मेरी पिछली ब्लड रिपोर्ट कहाँ रखी थी? डॉक्टर साहब ने माँगी थी।',
        textMarathi: 'मुली… माझी मागची ब्लड रिपोर्ट कुठे ठेवली होतीस? डॉक्टरांनी मागितली आहे.'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerNameMarathi: 'मुलगी',
        speakerEmoji: '👩',
        text: 'Papa, I am not sure… it must be in that old paper file. Let me search quickly.',
        textHindi: 'पापा, पता नहीं… शायद पुरानी फाइल में है। एक सेकंड मैं ढूँढती हूँ।',
        textMarathi: 'बाबा, माहिती नाही… कदाचित त्या जुन्या फाईलमध्ये असेल. मी लगेच शोधून बघते.'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'In India, we care deeply for our health… but often lose track of our health history. One report at home, one prescription with the doctor, and years of medical history lost among files.',
        textHindi: 'भारत में हम अपनी सेहत का ख्याल रखते हैं… लेकिन अक्सर अपनी हेल्थ की हिस्ट्री को संभाल नहीं पाते। एक रिपोर्ट घर पर… एक पर्चा डॉक्टर के पास… और पुरानी हिस्ट्री फाइलों के बीच खो जाती है।',
        textMarathi: 'भारतात आपण तब्येतीची काळजी घेतो… पण आरोग्याचा इतिहास फाईल्सच्या ढिगाऱ्यात कुठेतरी हरवून बसतो. एक रिपोर्ट घरी… एक डॉक्टरांकडे… आणि महत्त्वाचा इतिहास फाईल्समध्ये गहाळ होतो.'
      }
    ]
  },
  {
    id: 2,
    startSec: 25,
    endSec: 55,
    sceneNumber: 'SCENE 2',
    title: 'THE CRITICAL MOMENT: Emergency Hospital Visit',
    titleMarathi: 'आणीबाणीचा क्षण: मध्यरात्री दवाखान्यातील धावपळ',
    subtitle: 'Late night medical crisis where missing health information costs critical minutes',
    subtitleMarathi: 'माहिती उपलब्ध नसल्यामुळे उपचारांत होणारा विलंब आणि डॉक्टरांची चिंता',
    badge: '0:25 – 0:55 • EMERGENCY CLINIC',
    bgGradient: 'from-rose-950 via-slate-950 to-indigo-950',
    visualAtmosphere: 'Urgent red & blue hospital lighting, ticking clock',
    visualElements: [
      {
        icon: '🚨',
        label: 'Late Night Crisis',
        labelMarathi: 'मध्यरात्री आणीबाणी',
        desc: 'Achanak tabiyat kharab hona',
        descMarathi: 'अचानक तब्येत बिघडणे'
      },
      {
        icon: '🩺',
        label: 'Doctor Inquires',
        labelMarathi: 'डॉक्टरांची चौकशी',
        desc: 'Previous medication aur reports ki maang',
        descMarathi: 'मागील औषधे आणि जुन्या रिपोर्टची मागणी'
      },
      {
        icon: '⏱️',
        label: 'Ticking Clock',
        labelMarathi: 'वेळेचा अपव्यय',
        desc: 'Emergency mein information ka missing hona',
        descMarathi: 'इमर्जन्सीमध्ये माहिती गहाळ असणे'
      }
    ],
    activeCardProps: {
      title: 'Information Crisis in Emergency',
      titleMarathi: 'इमर्जन्सीमध्ये माहितीचा अभाव',
      subtitle: 'Emergency mein problem sirf bimari nahi hoti — problem hoti hai information ka missing hona.',
      subtitleMarathi: 'इमर्जन्सीमध्ये अडचण फक्त आजार नसते — खरी अडचण असते माहिती वेळेवर न मिळणे.',
      tag: 'Critical Impact',
      tagMarathi: 'गंभीर क्षण',
      iconEmoji: '🚨'
    },
    dialogues: [
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerNameMarathi: 'मुलगी',
        speakerEmoji: '👩',
        text: 'Papa is feeling suddenly unwell and breathless… Papa, let us rush to the hospital right now!',
        textHindi: 'पापा को अचानक बेचैनी हो रही है… पापा, चलिए अभी हॉस्पिटल चलते हैं!',
        textMarathi: 'बाबांना अचानक खूप अस्वस्थ वाटतंय… बाबा, चला आपण लगेच दवाखान्यात जाऊया!'
      },
      {
        speaker: 'doctor',
        speakerName: 'Doctor',
        speakerNameMarathi: 'डॉक्टर',
        speakerEmoji: '👨‍⚕️',
        text: 'Do you have his previous reports? Is he currently on any blood pressure or heart medications?',
        textHindi: 'Previous reports हैं आपके पास? पहले कोई BP या शुगर की medication चल रही है क्या?',
        textMarathi: 'मागील काही रिपोर्ट्स आहेत का तुमच्याकडे? आधीपासून कोणती बीपी किंवा हृदयाची औषधे सुरू आहेत का?'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerNameMarathi: 'मुलगी',
        speakerEmoji: '👩',
        text: 'Doctor… we have a few papers, but his complete history is not available here. The old folder remained at home.',
        textHindi: 'सर… कुछ रिपोर्ट्स हैं, लेकिन कम्प्लीट हिस्ट्री नहीं मिल रही। पुरानी फाइल घर पर रह गई।',
        textMarathi: 'सर… काही रिपोर्ट्स आहेत, पण पूर्ण इतिहास सापडत नाहीये. जुनी फाईल घरीच राहिली.'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'In an emergency, the real danger is not just the illness… The real danger is missing critical information.',
        textHindi: 'इमरजेंसी में प्रॉब्लम सिर्फ बीमारी नहीं होती… प्रॉब्लम होती है — जानकारी का मिसिंग होना।',
        textMarathi: 'इमर्जन्सीमध्ये अडचण फक्त आजार नसते… खरी अडचण असते — खरी माहिती वेळेवर उपलब्ध नसणे.'
      }
    ]
  },
  {
    id: 3,
    startSec: 55,
    endSec: 80,
    sceneNumber: 'SCENE 3',
    title: 'AABHA AI INTRODUCTION: Your Health in Your Phone',
    titleMarathi: 'आभा एआयचा परिचय: तुमचे आरोग्य आता तुमच्या मोबाईलमध्ये',
    subtitle: 'The dark screen illuminates with an intelligent, organized health companion',
    subtitleMarathi: 'सुरक्षित, सुटसुटीत आणि कृत्रिम बुद्धिमत्ता आधारित डिजिटल आरोग्य साथी',
    badge: '0:55 – 1:20 • PRODUCT REVEAL',
    bgGradient: 'from-indigo-950 via-purple-950 to-cyan-950',
    visualAtmosphere: 'Futuristic blue & white illumination, illuminated phone screen',
    visualElements: [
      {
        icon: '✨',
        label: 'Illuminated Screen',
        labelMarathi: 'चमकती स्क्रीन',
        desc: 'Dark screen illuminates with futuristic AABHA glow',
        descMarathi: 'गडद स्क्रीनवर आभा एआयची तेजस्वी निळी-पांढरी प्रभा'
      },
      {
        icon: '📱',
        label: 'Organized Health',
        labelMarathi: 'व्यवस्थित नोंदी',
        desc: 'All records beautifully structured in phone',
        descMarathi: 'सर्व औषधे आणि अहवाल मोबाईलमध्ये उपलब्ध'
      },
      {
        icon: '🤖',
        label: 'Intelligent AI',
        labelMarathi: 'हुशार एआय',
        desc: 'Your personal cognitive health companion',
        descMarathi: 'तुमचा वैयक्तिक कॉग्निटिव्ह आरोग्य साथी'
      }
    ],
    activeCardProps: {
      title: 'Meet AABHA AI: Intelligent Health Companion',
      titleMarathi: 'भेटा आभा एआयला: तुमची स्मार्ट डिजिटल आरोग्य साथी',
      subtitle: 'Agar aapki health information phone mein organized, accessible aur intelligent way mein ho?',
      subtitleMarathi: 'जर तुमच्या आरोग्याची संपूर्ण माहिती मोबाईलमध्ये कायम उपलब्ध असेल तर?',
      tag: 'The Solution',
      tagMarathi: 'स्मार्ट उपाय',
      iconEmoji: '✨'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'What if your critical health information was available right in your smartphone — organized, accessible, and intelligent?',
        textHindi: 'लेकिन सोचिए… अगर आपकी हेल्थ की इम्पोर्टेन्ट इन्फॉर्मेशन… आपके फोन में… ऑर्गनाइज़्ड, एक्सेसिबल और इंटेलिजेंट तरीके से मौजूद हो?',
        textMarathi: 'पण विचार करा… जर तुमच्या आरोग्याची संपूर्ण माहिती… तुमच्या मोबाईलमध्ये… व्यवस्थित, सुरक्षित आणि समजेल अशा पद्धतीने उपलब्ध असेल तर?'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Meet AABHA AI. Your intelligent health companion. Health records are no longer trapped in paper files — they travel with you.',
        textHindi: 'मिलिए आभा एआई से। आपकी इंटेलिजेंट हेल्थ साथी। अब हेल्थ रिकॉर्ड्स सिर्फ फाइलों में नहीं, आपके साथ हैं।',
        textMarathi: 'भेटा आभा एआयला! तुमची हुशार आरोग्य साथी. आता आरोग्य नोंदी फक्त कागदी फाईल्समध्ये नाही, तुमच्या सोबत राहतील.'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerNameMarathi: 'आभा एआय',
        speakerEmoji: '🤖',
        text: 'Hello! I am AABHA AI. Organizing your prescriptions, lab reports, and medication timeline is now effortless and safe.',
        textHindi: 'नमस्ते! मैं हूँ आभा एआई। आपके प्रिस्क्रिप्शन्स, लैब रिपोर्ट्स और मेडिकल टाइमलाइन को समझना अब बेहद आसान है।',
        textMarathi: 'नमस्कार! मी आहे आभा एआय. तुमची औषधे, तपासणी अहवाल आणि आरोग्याचा इतिहास समजून घेणे आता अतिशय सोपे झाले आहे.'
      }
    ]
  },
  {
    id: 4,
    startSec: 80,
    endSec: 125,
    sceneNumber: 'SCENE 4',
    title: 'HOW IT WORKS: 3-Step Intelligent Health Journey',
    titleMarathi: 'कार्यपद्धती: ३ टप्प्यांत सोपे आणि स्मार्ट आरोग्य व्यवस्थापन',
    subtitle: '1. Clean Timeline • 2. AI Understands Health • 3. Ask Your Health AI',
    subtitleMarathi: '१. डिजिटल टाइमलाइन • २. सोप्या भाषेत विश्लेषण • ३. प्रश्न विचारा व उत्तरे मिळवा',
    badge: '1:20 – 2:05 • 3-STEP ENGINE',
    bgGradient: 'from-teal-950 via-slate-900 to-indigo-950',
    visualAtmosphere: 'Live UI app recordings, interactive AI chat, timeline flow',
    visualElements: [
      {
        icon: '📅',
        label: '1. Digital Timeline',
        labelMarathi: '१. डिजिटल टाइमलाइन',
        desc: 'Old report ➔ Digital record, Prescription ➔ Medicine info',
        descMarathi: 'जुनी रिपोर्ट ➔ डिजिटल नोंद, औषध पर्चा ➔ अलार्म'
      },
      {
        icon: '🧠',
        label: '2. AI Explains Terms',
        labelMarathi: '२. सोप्या भाषेत स्पष्टीकरण',
        desc: 'Complex medical jargon translated to simple language',
        descMarathi: 'कठीण वैद्यकीय संज्ञा सोप्या भाषेत समजतात'
      },
      {
        icon: '💬',
        label: '3. Ask Health AI',
        labelMarathi: '३. आरोग्याचे प्रश्न विचारा',
        desc: '"Ye medicine kisliye hai?" ➔ Instant clear answers',
        descMarathi: '"ही गोळी कशासाठी आहे?" ➔ त्वरित स्पष्टीकरण'
      }
    ],
    activeCardProps: {
      title: 'Simple Digital Health Experience',
      titleMarathi: 'सहज आणि सोपा डिजिटल आरोग्य अनुभव',
      subtitle: 'Questions poochiye. Records ko samajhiye. Apni health journey ko better way mein track kijiye.',
      subtitleMarathi: 'प्रश्न विचारा, रिपोर्ट समजून घ्या आणि आपल्या आरोग्यावर पूर्ण नियंत्रण मिळवा.',
      tag: 'Interactive Tech',
      tagMarathi: 'तंत्रज्ञान',
      iconEmoji: '⚡'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'AABHA AI transforms physical files into a clean health timeline. Old reports become structured digital records; prescriptions become live reminders.',
        textHindi: 'आभा एआई आपकी हेल्थ इन्फॉर्मेशन को एक साफ़ टाइमलाइन में बदल देती है। पुरानी रिपोर्ट्स डिजिटल रिकॉर्ड बन जाती हैं।',
        textMarathi: 'आभा एआय कागदी फाईल्सना एका स्वच्छ डिजिटल टाइमलाइनमध्ये रूपांतरित करते. जुने अहवाल डिजिटल नोंदी बनतात आणि औषधे अलार्म बनतात.'
      },
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerNameMarathi: 'बाबा',
        speakerEmoji: '👴',
        text: 'AABHA, what is important in my recent blood report? And why did the doctor prescribe Donepezil?',
        textHindi: 'आभा, मेरी हालिया ब्लड रिपोर्ट में क्या खास है? और ये डोनेपेज़िल दवाई किसलिए है?',
        textMarathi: 'आभा, माझ्या ताज्या ब्लड रिपोर्टमध्ये काय महत्त्वाचं आहे? आणि ही डोनेपेझिल गोळी मला कशासाठी दिली आहे?'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerNameMarathi: 'आभा एआय',
        speakerEmoji: '🤖',
        text: 'Arun ji, your BP and glucose parameters are stable. Donepezil supports memory and daily focus, scheduled at 8:30 AM after breakfast!',
        textHindi: 'अरुण जी, आपकी रिपोर्ट सामान्य है। डोनेपेज़िल आपकी याददाश्त और फोकस के लिए है, जो सुबह 8:30 बजे नाश्ते के बाद लेनी है!',
        textMarathi: 'अरुण काका, तुमचा बीपी आणि शुगर रिपोर्ट सामान्य आहे. डोनेपेझिल गोळी तुमच्या स्मरणशक्तीसाठी आहे, जी सकाळी 8:30 वाजता घ्यायची आहे!'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Ask questions. Understand complex medical terms in simple words. Track your health journey with complete clarity.',
        textHindi: 'सवाल्स पूछिए। रिपोर्ट्स को सरल भाषा में समझिए। अपनी सेहत के सफर को बेहतर तरीके से ट्रैक कीजिए।',
        textMarathi: 'प्रश्न विचारा, रिपोर्ट सोप्या भाषेत समजून घ्या आणि आपल्या आरोग्यावर पूर्ण नियंत्रण मिळवा.'
      }
    ]
  },
  {
    id: 5,
    startSec: 125,
    endSec: 150,
    sceneNumber: 'SCENE 5',
    title: 'THE DOCTOR EXPERIENCE: Contextual Consultations',
    titleMarathi: 'डॉक्टरांचा अनुभव: अचूक संदर्भ आणि जलद उपचार',
    subtitle: 'Doctors get instant historical context instead of starting from zero',
    subtitleMarathi: 'मागील ६ महिन्यांचा अचूक इतिहास पाहून डॉक्टरांना अचूक निर्णय घेता येतो',
    badge: '2:05 – 2:30 • CLINIC CONSULTATION',
    bgGradient: 'from-cyan-950 via-slate-900 to-purple-950',
    visualAtmosphere: 'Professional hospital consultation room, doctor smiling at phone summary',
    visualElements: [
      {
        icon: '🩺',
        label: 'Instant Context',
        labelMarathi: 'त्वरित संदर्भ',
        desc: 'Pichhle 6 mahine ka complete timeline ek tap mein',
        descMarathi: 'मागील ६ महिन्यांची संपूर्ण टाइमलाइन एका क्लिकवर'
      },
      {
        icon: '📈',
        label: '4-Pillar Radar',
        labelMarathi: '४ मुख्य स्तंभ',
        desc: 'Memory, Attention, Reaction Speed & Consistency',
        descMarathi: 'स्मरणशक्ती, एकाग्रता, गती आणि सातत्य'
      },
      {
        icon: '🤝',
        label: 'Better Decisions',
        labelMarathi: 'अचूक उपचार',
        desc: 'No guesswork; accurate diagnostics & treatment',
        descMarathi: 'कोणतीही शंका न राहता योग्य आणि जलद उपचार'
      }
    ],
    activeCardProps: {
      title: 'Empowering Doctors with Context',
      titleMarathi: 'डॉक्टरांना अचूक संदर्भ मिळतो',
      subtitle: 'Jab information organized hoti hai, toh conversation sirf "aaj kya hua?" se shuru nahi hoti.',
      subtitleMarathi: 'जेव्हा माहिती व्यवस्थित असते, तेव्हा संभाषण फक्त "आज काय झालं?" ने सुरू होत नाही.',
      tag: 'Clinical Value',
      tagMarathi: 'वैद्यकीय मूल्य',
      iconEmoji: '🩺'
    },
    dialogues: [
      {
        speaker: 'doctor',
        speakerName: 'Doctor',
        speakerNameMarathi: 'डॉक्टर',
        speakerEmoji: '👨‍⚕️',
        text: 'Excellent! Your phone shows the last six months of dosage, timeline, and cognitive metrics in one structured dashboard! Now I have complete historical context.',
        textHindi: 'अच्छा! आपके फोन में पिछले 6 महीने की कम्प्लीट हिस्ट्री और टाइमलाइन एक जगह है! अब मुझे आपकी पूरी स्थिति समझ आ रही है।',
        textMarathi: 'छान! तुमच्या मोबाईलमध्ये मागच्या ६ महिन्यांचा संपूर्ण इतिहास आणि औषधांची नोंद एकाच जागी दिसतेय! आता मला तुमचा पूर्ण संदर्भ समजला आहे.'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'When health information is structured, consultations do not start with "what happened today?". Doctors gain instant context for faster, safer care.',
        textHindi: 'जब इन्फॉर्मेशन ऑर्गनाइज़्ड होती है… तो बातचीत सिर्फ "आज क्या हुआ?" से शुरू नहीं होती। डॉक्टर के पास आपकी पूरी हेल्थ स्टोरी समझने का बेहतर कॉन्टेक्स्ट होता है।',
        textMarathi: 'जेव्हा माहिती व्यवस्थित असते… तेव्हा संभाषण फक्त "आज काय झालं?" ने सुरू होत नाही. डॉक्टरांकडे योग्य निर्णय घेण्यासाठी पूर्ण संदर्भ असतो.'
      }
    ]
  },
  {
    id: 6,
    startSec: 150,
    endSec: 170,
    sceneNumber: 'SCENE 6',
    title: 'EMOTIONAL PAYOFF: Peace of Mind for Families',
    titleMarathi: 'कुटुंबाला मानसिक शांतता: फाईल्सची चिंता कायमची संपली',
    subtitle: 'No more lost files — your health story stays with you forever',
    subtitleMarathi: 'घरातील ज्येष्ठांना स्वाभिमान आणि मुलांना काळजीपासून पूर्ण मुक्ती',
    badge: '2:30 – 2:50 • FAMILY RELIEF',
    bgGradient: 'from-amber-950 via-purple-950 to-slate-950',
    visualAtmosphere: 'Warm golden hour home lighting, relaxed happy father & daughter',
    visualElements: [
      {
        icon: '🏡',
        label: 'Peace of Mind',
        labelMarathi: 'मानसिक समाधान',
        desc: 'Ghar par relaxed baithkar muskurahat',
        descMarathi: 'घरी बसून चेहऱ्यावर निश्चिंत हास्य'
      },
      {
        icon: '❤️',
        label: 'Dignified Care',
        labelMarathi: 'स्वाभिमानी आरोग्य',
        desc: 'Files dhundhne ki chinta khatam',
        descMarathi: 'फाईल्स शोधण्याचे टेन्शन कायमचे संपले'
      },
      {
        icon: '📱',
        label: 'Health in Pocket',
        labelMarathi: 'आरोग्य खिशात',
        desc: 'Aapki health story aapke saath',
        descMarathi: 'तुमची आरोग्य कहाणी कायम तुमच्या सोबत'
      }
    ],
    activeCardProps: {
      title: 'Lifelong Health Dignity',
      titleMarathi: 'आरोग्याचा स्वाभिमान आणि निश्चिंतता',
      subtitle: 'Ab woh purani report dhundhne ki zarurat nahi padegi. Ab aapki health story aapke saath rahegi.',
      subtitleMarathi: 'आता जुनी फाईल शोधण्याची गरज पडणार नाही. आता तुमची आरोग्याची कहाणी तुमच्या सोबत राहील.',
      tag: 'Emotional Payoff',
      tagMarathi: 'मानसिक समाधान',
      iconEmoji: '❤️'
    },
    dialogues: [
      {
        speaker: 'father',
        speakerName: 'Father',
        speakerNameMarathi: 'बाबा',
        speakerEmoji: '👴',
        text: 'So now we will never have to panic or dig through stacks of old paper files again, beta?',
        textHindi: 'तो अब वो पुरानी फाइल और पुरानी रिपोर्ट ढूँढने की ज़रूरत नहीं पड़ेगी बेटा?',
        textMarathi: 'म्हणजे आता त्या जुन्या फाईल्स शोधायची आणि काळजी करायची गरज पडणार नाही ना?'
      },
      {
        speaker: 'daughter',
        speakerName: 'Daughter',
        speakerNameMarathi: 'मुलगी',
        speakerEmoji: '👩',
        text: 'Never again, Papa! Now your complete health story… will always stay safe in your phone, with you forever!',
        textHindi: 'नहीं पापा! अब आपकी पूरी हेल्थ स्टोरी… हमेशा आपके फोन में, आपके साथ रहेगी!',
        textMarathi: 'नाही बाबा! आता तुमची आरोग्याची संपूर्ण कहाणी… कायम तुमच्या मोबाईलमध्ये, तुमच्या सोबत राहील!'
      },
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'No more frantic searches for lost prescriptions. Just calm, empowered, independent living for Indian families.',
        textHindi: 'फाइलों के खोने का डर हमेशा के लिए खत्म। सिर्फ सुकून, आजादी और आत्मनिर्भर जीवन।',
        textMarathi: 'कागदपत्रे गहाळ होण्याचे टेन्शन कायमचे संपले. फक्त स्वाभिमान, स्वातंत्र्य आणि निश्चिंत जीवन.'
      }
    ]
  },
  {
    id: 7,
    startSec: 170,
    endSec: 180,
    sceneNumber: 'SCENE 7',
    title: 'FINAL BRAND MOMENT: Your Health. Your Story. Your AI.',
    titleMarathi: 'आभा एआयचा संकल्प: तुमचे आरोग्य. तुमची कहाणी. तुमचे एआय.',
    subtitle: 'Because your health story deserves to be remembered • SIH26003',
    subtitleMarathi: 'स्मार्ट इंडिया हॅकाथॉन SIH26003 • संपूर्ण भारतासाठी समर्पित',
    badge: '2:50 – 3:00 • GRAND FINALE',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    visualAtmosphere: 'Cinematic glowing gold AABHA AI crest & official link banner',
    visualElements: [
      {
        icon: '🏆',
        label: 'SIH26003 Gold',
        labelMarathi: 'SIH26003 सुवर्णपदक',
        desc: 'Pan-India AI Health Innovation',
        descMarathi: 'अखिल भारतीय एआय आरोग्य नवोन्मेष'
      },
      {
        icon: '🌐',
        label: 'Live Prototype',
        labelMarathi: 'थेट संकेतस्थळ',
        desc: 'aabha-ai.vercel.app/patient',
        descMarathi: 'aabha-ai.vercel.app/patient'
      },
      {
        icon: '🇮🇳',
        label: 'For All Generations',
        labelMarathi: 'सर्व पिढ्यांसाठी',
        desc: 'Kids, Adults, Seniors & Doctors',
        descMarathi: 'मुले, तरुण, ज्येष्ठ आणि डॉक्टर्स'
      }
    ],
    activeCardProps: {
      title: 'AABHA AI — Your Health. Your Story. Your AI.',
      titleMarathi: 'आभा एआय — तुमचे आरोग्य. तुमची कहाणी. तुमचे एआय.',
      subtitle: 'Health sirf ek report nahi hai, health ek journey hai. Usse organize karna — ye hai AABHA AI.',
      subtitleMarathi: 'आरोग्य हा फक्त एक रिपोर्ट नाही, तो एक जीवनप्रवास आहे. त्याला जपून ठेवणे — हीच आहे आभा एआय.',
      tag: 'Final Brand Vision',
      tagMarathi: 'अंतिम संकल्प',
      iconEmoji: '🏆'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'Voiceover',
        speakerNameMarathi: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Health is not just a report. Health is a lifelong journey. To understand it… to organize it… and to empower it… This is AABHA AI.',
        textHindi: 'हेल्थ सिर्फ एक रिपोर्ट नहीं है। हेल्थ एक सफर है। उस सफर को समझना… उसे ऑर्गनाइज़ करना… और उस पर भरोसा पाना… ये है आभा एआई।',
        textMarathi: 'आरोग्य हा फक्त एक रिपोर्ट नाही, तो एक जीवनप्रवास आहे. हा प्रवास समजून घेणे… व्यवस्थित ठेवणे… आणि स्वाभिमानी बनवणे… हीच आहे आभा एआय.'
      },
      {
        speaker: 'aabha',
        speakerName: 'AABHA AI',
        speakerNameMarathi: 'आभा एआय',
        speakerEmoji: '🤖',
        text: 'AABHA AI — Because your health story deserves to be remembered. Experience now at aabha-ai.vercel.app!',
        textHindi: 'आभा एआई — क्योंकि आपकी सेहत की कहानी हमेशा याद रखी जानी चाहिए। अभी अनुभव कीजिए!',
        textMarathi: 'आभा एआय — कारण तुमच्या आरोग्याची कहाणी जपली जाणे आवश्यक आहे. आताच भेट द्या aabha-ai.vercel.app वर!'
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
  const [voiceLang, setVoiceLang] = useState<SupportedLang>('HI'); // Default Hinglish, with Indian English & Marathi
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerId>('narrator');

  const totalSeconds = 180; // 3 Minutes (0:00 to 3:00)
  const timerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(true);
  const isVoiceoverOnRef = useRef<boolean>(true);
  const voiceLangRef = useRef<SupportedLang>('HI');
  const stageDialogueIdxRef = useRef<number>(0);
  const currentStageIdRef = useRef<number>(1);

  // Sync ref values
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isVoiceoverOnRef.current = isVoiceoverOn;
    voiceLangRef.current = voiceLang;
  }, [isPlaying, isVoiceoverOn, voiceLang]);

  // Chrome speech synthesis heartbeat
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

  // Play next continuous dialogue with character voice tuning across 3 languages
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

    let textToSpeak = currentLine.text;
    if (voiceLangRef.current === 'HI') {
      textToSpeak = currentLine.textHindi;
    } else if (voiceLangRef.current === 'MR') {
      textToSpeak = currentLine.textMarathi;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      utterance.pitch = speakerProfile.pitch;
      utterance.rate = speakerProfile.rate;

      if (voiceLangRef.current === 'MR') {
        utterance.lang = 'mr-IN';
      } else if (voiceLangRef.current === 'HI') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Pick matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voiceLangRef.current === 'MR') {
        const mrVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('hi'));
        if (mrVoice) utterance.voice = mrVoice;
      } else if (currentLine.speaker === 'daughter') {
        const femaleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Google UK English Female'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else if (currentLine.speaker === 'father') {
        const maleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Google UK English Male'))
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

  const handleChangeLang = (lang: SupportedLang) => {
    stopSpeech();
    setVoiceLang(lang);
    voiceLangRef.current = lang;
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

  let activeSubtitle = activeLine.text;
  let activeSpeakerName = activeLine.speakerName;
  if (voiceLang === 'HI') {
    activeSubtitle = activeLine.textHindi;
  } else if (voiceLang === 'MR') {
    activeSubtitle = activeLine.textMarathi;
    if (activeLine.speakerNameMarathi) {
      activeSpeakerName = activeLine.speakerNameMarathi;
    }
  }

  const isMarathi = voiceLang === 'MR';

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
                  3-Min Screenplay
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium hidden sm:block">
                {isMarathi
                  ? '“आरोग्य नोंदी आता फक्त फाईल्समध्ये नाही, तुमच्या सोबत आहेत”'
                  : '“Ab Health Records Sirf Files Mein Nahi, Aapke Saath Hain”'}
              </div>
            </div>
          </div>

          {/* Controls: Voiceover + Music + 3 Languages + Timer + Play/Pause + Restart + Close */}
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

            {/* 🌐 3-WAY LANGUAGE SELECTOR (Hinglish • Indian English • मराठी) */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => handleChangeLang('HI')}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer ${
                  voiceLang === 'HI' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Hinglish / Hindi"
              >
                🇮🇳 हिं
              </button>
              <button
                type="button"
                onClick={() => handleChangeLang('EN')}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer ${
                  voiceLang === 'EN' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Indian English"
              >
                🇮🇳 EN
              </button>
              <button
                type="button"
                onClick={() => handleChangeLang('MR')}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer ${
                  voiceLang === 'MR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="मराठी (Marathi)"
              >
                🚩 म
              </button>
            </div>

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
                  <span className="hidden md:inline">
                    • {isMarathi ? s.titleMarathi.split(':')[0] : s.title.split(':')[0]}
                  </span>
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
              <span>{activeLine.speakerEmoji} {activeSpeakerName}:</span>
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
                  {isMarathi ? currentScene.titleMarathi : currentScene.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 font-medium">
                  {isMarathi ? currentScene.subtitleMarathi : currentScene.subtitle}
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
                    <h4 className="text-xs font-black text-white">
                      {isMarathi ? elem.labelMarathi : elem.label}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {isMarathi ? elem.descMarathi : elem.desc}
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
                  <span className="text-[10px] uppercase font-black text-purple-300">
                    {isMarathi ? 'थेट संवाद' : 'Live Dialogue Line'}
                  </span>
                  <p className="text-xs font-bold text-white italic">
                    "{activeSubtitle}"
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  {isMarathi ? currentScene.activeCardProps.tagMarathi : currentScene.activeCardProps.tag}
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
                  {isMarathi
                    ? `थेट आभा एआई स्क्रीनप्ले (दृश्य ${currentScene.id}):`
                    : `Live AABHA AI Screenplay Flow (Scene ${currentScene.id}):`}
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
                    <span>{isMarathi ? 'कागदी फाईल्सचा ढीग' : 'Physical Paper Pile'}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isMarathi
                      ? 'जुनी प्रिस्क्रिप्शन्स, हाताने लिहिलेल्या डॉक्टरांच्या नोंदी आणि डिस्चार्ज कार्ड्स फाईल्समध्ये गहाळ.'
                      : 'Old prescriptions, handwritten doctor notes & hospital discharge cards lost in folders.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="font-black text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isMarathi ? 'इतिहास गहाळ होण्याचा धोका' : 'Missing History Risk'}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isMarathi
                      ? 'डॉक्टरांना मागील औषधांची माहिती न मिळाल्यामुळे उपचारांत अडचणी.'
                      : 'Doctors cannot cross-verify drug interactions or past allergies in time.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                  <div className="font-black text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{isMarathi ? 'आभा एआईचा उपाय' : 'The Solution'}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isMarathi
                      ? 'विखुरलेल्या कागदी नोंदींना एका सुरक्षित डिजिटल टाइमलाइनमध्ये रूपांतरित करणे.'
                      : 'Transforming scattered physical documents into one clean, intelligent digital timeline.'}
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
                      <span className="font-black text-rose-600 uppercase">
                        {isMarathi ? 'इमर्जन्सी रूम तपासणी' : 'Emergency Room Consultation'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">11:45 PM Night Crisis</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {isMarathi
                        ? 'डॉक्टर विचारतात: "मागील काही रिपोर्ट्स आहेत का? आधीची औषधे कोणती सुरू आहेत?"'
                        : 'Doctor asks: "Previous reports hain? Koi medication chal rahi hai?" Complete history missing.'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase shrink-0">
                  {isMarathi ? 'माहितीचा अभाव' : 'Critical Info Needed'}
                </span>
              </div>
            )}

            {/* SCENE 3 UI: AABHA AI Glow Reveal */}
            {currentScene.id === 3 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-400/40 text-white flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Abha3DOrb size="sm" state="SPEAKING" interactive={false} />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300">
                      {isMarathi ? 'स्मार्ट डिजिटल आरोग्य साथी' : 'Intelligent Health Companion'}
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {isMarathi
                        ? 'भेटा आभा एआईला — तुमचे आरोग्य. तुमची कहाणी. तुमचे एआय.'
                        : 'Meet AABHA AI — Your Health. Your Story. Your AI.'}
                    </h4>
                    <p className="text-[11px] text-purple-200">
                      {isMarathi
                        ? 'आरोग्याची सर्व माहिती मोबाईलमध्ये सुरक्षित आणि एका क्लिकवर उपलब्ध.'
                        : 'All health information organized, accessible, and intelligent in your smartphone.'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase shrink-0">
                  {isMarathi ? 'सक्रिय प्रणाली' : 'Live & Active'}
                </span>
              </div>
            )}

            {/* SCENE 4 UI: 3-Step Interactive Engine */}
            {currentScene.id === 4 && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {isMarathi ? '१. टाइमलाइन व्ह्यू' : '1. Timeline View'}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Old Report ➔ Clean Digital Event</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-teal-600 dark:text-teal-400">
                      {isMarathi ? '२. सोपे स्पष्टीकरण' : '2. AI Explains Terms'}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {isMarathi ? 'कठीण संज्ञा ➔ सोपी मराठी / हिंदी' : 'Jargon ➔ Simple Hindi / English'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                    <div className="font-bold text-cyan-600 dark:text-cyan-400">
                      {isMarathi ? '३. प्रश्न विचारा' : '3. Ask Your Health AI'}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">"Ye medicine kisliye hai?" ➔ Answers</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-400/20 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                  <span>
                    {isMarathi
                      ? 'ℹ️ एआय केवळ माहितीसाठी आहे. वैद्यकीय उपचारांसाठी डॉक्टरांचा सल्ला घ्या.'
                      : 'ℹ️ AI information ke liye hai. Medical decisions ke liye healthcare professional se consult karein.'}
                  </span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {isMarathi ? 'वैद्यकीय डिस्क्लेमर ✓' : 'Non-Diagnostic Disclaimer ✓'}
                  </span>
                </div>
              </div>
            )}

            {/* SCENE 5 UI: The Doctor Consultation Experience */}
            {currentScene.id === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">
                    {isMarathi ? 'स्मरणशक्ती निर्देशांक' : 'Memory Index'}
                  </div>
                  <div className="text-base font-black text-emerald-500">82%</div>
                  <div className="text-[9px] text-emerald-600 font-bold">
                    {isMarathi ? 'स्थिर इतिहास' : 'Stable History'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">
                    {isMarathi ? 'औषध नियमितता' : 'Medication Adherence'}
                  </div>
                  <div className="text-base font-black text-cyan-500">100%</div>
                  <div className="text-[9px] text-cyan-600 font-bold">
                    {isMarathi ? '३ पैकी ३ पूर्ण' : '3 of 3 Confirmed'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">
                    {isMarathi ? 'प्रतिक्रिया गती' : 'Reaction Latency'}
                  </div>
                  <div className="text-base font-black text-purple-500">1.8s</div>
                  <div className="text-[9px] text-purple-600 font-bold">
                    {isMarathi ? 'उत्तम रिफ्लेक्स' : 'Normal Reflexes'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">
                    {isMarathi ? 'डॉक्टरांचा वेळ' : 'Doctor Decision Time'}
                  </div>
                  <div className="text-base font-black text-amber-500">&lt; 30 sec</div>
                  <div className="text-[9px] text-amber-600 font-bold">
                    {isMarathi ? 'त्वरित संदर्भ' : 'Instant Context'}
                  </div>
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
                      {isMarathi
                        ? '“आता तुमची आरोग्याची संपूर्ण कहाणी… कायम तुमच्या सोबत राहील.”'
                        : '“Ab aapki health story… hamesha aapke saath rahegi.”'}
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {isMarathi
                        ? 'कोणतीही फाईल गहाळ होण्याचे टेन्शन नाही. कुटुंबाला पूर्ण मानसिक समाधान.'
                        : 'Family peace of mind with zero lost reports or forgotten dosages.'}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isMarathi ? '१००% मानसिक शांतता ✓' : 'Peace of Mind 100% ✓'}
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
                    {isMarathi
                      ? 'आभा एआई — तुमचे आरोग्य. तुमची कहाणी. तुमचे एआय.'
                      : 'AABHA AI — Your Health. Your Story. Your AI.'}
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
                  <span>{isMarathi ? 'आभा एआय अनुभवा' : 'Experience AABHA AI'}</span>
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
            <span className="hidden sm:inline">
              {isMarathi
                ? 'अधिकृत ३-मिनिट चित्रपट • ३ भाषांमध्ये उपलब्ध (मराठी, हिंग्लिश, इंग्रजी) • SIH26003'
                : 'Official 3-Min Screenplay • Available in Indian English, Hinglish & Marathi • SIH26003'}
            </span>
            <span className="sm:hidden">
              {isMarathi ? 'आभा एआय चित्रपट' : 'AABHA AI Film'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              {isMarathi ? '↻ पुन्हा सुरू करा' : '↻ Restart Film'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              {isMarathi ? 'चित्रपट बंद करा' : 'Exit Film'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;
