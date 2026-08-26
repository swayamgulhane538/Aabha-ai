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
  Trees,
  CloudSun
} from 'lucide-react';
import { Abha3DOrb } from './Abha3DOrb';
import { ambientMusic } from '../services/ambientMusicService';

type SpeakerId = 'narrator' | 'dadaji' | 'sunita' | 'munna' | 'aabha';

interface DialogueLine {
  speaker: SpeakerId;
  speakerName: string;
  speakerEmoji: string;
  text: string;
  textHindi: string;
}

interface StageConfig {
  id: number;
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  storyChapter: string;
  villageSetting: string;
  cartoonScene: {
    bgGradient: string;
    settingLabel: string;
    sceneryElements: string[];
    characterA: {
      id: SpeakerId;
      name: string;
      role: string;
      emoji: string;
      actionText: string;
    };
    characterB?: {
      id: SpeakerId;
      name: string;
      role: string;
      emoji: string;
      actionText: string;
    };
    companionAction: string;
    keyPropEmoji: string;
    keyPropLabel: string;
    outcomePill: string;
  };
  dialogues: DialogueLine[];
}

const SPEAKER_PROFILES: Record<SpeakerId, { pitch: number; rate: number; label: string; color: string; bgColor: string }> = {
  dadaji: {
    pitch: 0.78,
    rate: 0.88,
    label: '👴 काका रामप्रसाद (75 वर्ष)',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-500/20 border-amber-500/50'
  },
  sunita: {
    pitch: 1.25,
    rate: 1.02,
    label: '👩‍⚕️ आशा दीदी सुनीता (35 वर्ष)',
    color: 'text-teal-700 dark:text-teal-300',
    bgColor: 'bg-teal-500/20 border-teal-500/50'
  },
  munna: {
    pitch: 1.65,
    rate: 1.15,
    label: '👦 नटखट मुन्ना (9 वर्ष)',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-500/20 border-orange-500/50'
  },
  aabha: {
    pitch: 1.10,
    rate: 1.02,
    label: '🤖 आभा एआई (स्मार्ट साथी)',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-500/20 border-purple-500/50'
  },
  narrator: {
    pitch: 1.00,
    rate: 1.02,
    label: '🎙️ कहानी वाचक (सूत्रधार)',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-500/20 border-indigo-500/50'
  }
};

const STAGES: StageConfig[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 22,
    title: 'दृश्य 1: आनंदपुर गाँव की चौपाल और चारपाई',
    subtitle: '75 वर्षीय रामप्रसाद काका और स्कूल जाते नन्हे मुन्ना की सुबह',
    badge: 'दृश्य 01 • गाँव की चौपाल',
    icon: '🏡',
    storyChapter: 'Scene 1: गाँव की सुबह और याददाश्त का संबल',
    villageSetting: '🌳 गाँव की चौपाल • नीम का पेड़ और चारपाई',
    cartoonScene: {
      bgGradient: 'from-amber-200 via-orange-100 to-yellow-50 dark:from-slate-950 dark:via-amber-950/80 dark:to-slate-900',
      settingLabel: '🏡 आनंदपुर गाँव • सुबह 08:00 AM',
      sceneryElements: ['🌳 नीम का पेड़', '🪑 लकड़ी की चारपाई', '🌾 दूर लहलहाते खेत', '🛖 मिट्टी का आँगन'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद (उम्र 75)',
        role: 'गाँव के बुजुर्ग (धोती-कुर्ता व पगड़ी)',
        emoji: '👴',
        actionText: 'चारपाई पर बैठकर सोच रहे हैं कि आज की गोली खाई या नहीं'
      },
      characterB: {
        id: 'munna',
        name: 'मुन्ना (उम्र 9)',
        role: 'स्कूल यूनिफॉर्म में बस्ता लिए पोता',
        emoji: '👦',
        actionText: 'स्कूल का बस्ता कंधे पर टांगे दादाजी के पास आता है'
      },
      companionAction: 'आभा एआई का चमकता जादुई गोला चारपाई के पास हवा में मुस्कुराता है ✨',
      keyPropEmoji: '🛖',
      keyPropLabel: 'गाँव का आँगन और लकड़ी की चारपाई',
      outcomePill: 'गाँव के बुजुर्गों के लिए डिजिटल संबल'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Welcome to Anandpur village. Meet seventy-five year old grandfather Ramprasad and his grandson Munna.',
        textHindi: 'एक सुंदर और हरे-भरे गाँव आनंदपुर में आपका स्वागत है। मिलिए 75 वर्षीय रामप्रसाद काका और उनके नटखट पोते मुन्ना से।'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Arey Munna! Main subah ki dawai khana bhool gaya kya? Umar ke saath sab dhundhla ho jata hai re!',
        textHindi: 'अरे मुन्ना! मैं सुबह की गोली खाना भूल गया क्या रे? उम्र के साथ याददाश्त कमजोर हो जाती है!'
      },
      {
        speaker: 'munna',
        speakerName: 'मुन्ना',
        speakerEmoji: '👦',
        text: 'Dada ji! Chinta kyu karte ho? Humare gaon me AABHA AI aa gayi hai! Tablet par sab ek tap me ho jata hai!',
        textHindi: 'दादा जी! चिंता क्यों करते हो? हमारे गाँव में आभा एआई आ गई है! टैबलेट पर सब एक टैप में हो जाता है!'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Ramprasad Kaka, pranaam! Main AABHA AI hoon — gaon ke bacchon, kisaanon aur buzurgon ki sacchi saheli!',
        textHindi: 'रामप्रसाद काका, प्रणाम! मैं आभा एआई हूँ — गाँव के बच्चों, युवाओं और बुजुर्गों की सच्ची डिजिटल सहेली!'
      }
    ]
  },
  {
    id: 2,
    startSec: 22,
    endSec: 45,
    title: 'दृश्य 2: खाट पर बैठकर टैबलेट पर 1-टैप दवाई',
    subtitle: 'बिना चश्मे के बड़े हरे बटन से दवाई और मिट्टी के घड़े से पानी का चेक-ऑफ',
    badge: 'दृश्य 02 • सरल ग्रामीण इंटरफेस',
    icon: '🍵',
    storyChapter: 'Scene 2: आसान 1-टैप गाँव का डैशबोर्ड',
    villageSetting: '🏺 मिट्टी का घड़ा, चाय का कुल्हड़ और चमकता टैबलेट',
    cartoonScene: {
      bgGradient: 'from-emerald-100 via-teal-50 to-amber-50 dark:from-slate-950 dark:via-teal-950/80 dark:to-slate-900',
      settingLabel: '🍵 नाश्ते की खाट • 08:30 AM',
      sceneryElements: ['🏺 मिट्टी का मटका', '☕ चाय का कुल्हड़', '📱 चमकता बड़ा टैबलेट', '🌻 गेंदे के फूल'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद',
        role: 'दवाई लेते हुए मुस्कुराते दादाजी',
        emoji: '👴',
        actionText: 'अंगूठे से टैबलेट के बड़े हरे बटन को छूते हैं'
      },
      characterB: {
        id: 'munna',
        name: 'मुन्ना',
        role: 'दूध का गिलास पीता हुआ बच्चा',
        emoji: '👦',
        actionText: 'स्कूल जाने से पहले अपना पढ़ाई का चार्ट देखता है'
      },
      companionAction: 'डोनेपेज़िल गोली दर्ज ✓ | घड़े से 2 गिलास पानी पूरा ✓ | मुन्ना का होमवर्क चार्ट ✓',
      keyPropEmoji: '🏺',
      keyPropLabel: 'गाँव का घड़ा और कुल्हड़',
      outcomePill: '100% स्वावलंबी और आसान'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'On the cot, Ramprasad taps the giant high-contrast button without needing reading glasses.',
        textHindi: 'चारपाई पर बैठे रामप्रसाद काका बिना चश्मे के बड़े हरे बटन को छूते हैं।'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Arey wah! Itna bada button! Ungli lagate hi dawai tick ho gayi aur ghade ka paani bhi jud gaya!',
        textHindi: 'अरे वाह! इतना बड़ा हरा बटन! उँगली लगाते ही दवाई टिक हो गई और घड़े का पानी भी जुड़ गया!'
      },
      {
        speaker: 'munna',
        speakerName: 'मुन्ना',
        speakerEmoji: '👦',
        text: 'Dada ji, maine bhi apna school ka time table dekh liya! Hum dono ka kaam ho gaya!',
        textHindi: 'दादा जी, मैंने भी अपना स्कूल का टाइम टेबल देख लिया! हम दोनों का काम हो गया!'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Shabash Kaka! Morning Donepezil medicine confirmed, two glasses of water logged, and Munna is ready for school!',
        textHindi: 'शाबाश काका! सुबह की डोनेपेज़िल दवाई दर्ज हो गई है, पानी पूरा हुआ और मुन्ना स्कूल के लिए तैयार है!'
      }
    ]
  },
  {
    id: 3,
    startSec: 45,
    endSec: 75,
    title: 'दृश्य 3: नीम के पेड़ के नीचे आभा से देसी बातचीत',
    subtitle: 'गाँव की बोली में बिना किसी मेडिकल भ्रम के सीधा और सही उत्तर',
    badge: 'दृश्य 03 • देसी वॉइस असिस्टेंट',
    icon: '🎤',
    storyChapter: 'Scene 3: चौपाल पर वॉइस बातचीत',
    villageSetting: '🌿 नीम की छाँव, हुक्का और गाँव के लोग',
    cartoonScene: {
      bgGradient: 'from-purple-100 via-indigo-50 to-amber-100 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-900',
      settingLabel: '🌿 नीम के पेड़ के नीचे • 09:00 AM',
      sceneryElements: ['🌳 विशाल नीम का पेड़', '🕊️ उड़ती चिड़ियाँ', '📻 पुराना रेडियो', '🪑 चौपाल का चबूतरा'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद',
        role: 'मुस्कुराकर पूछते हुए काका',
        emoji: '👴',
        actionText: 'हवा में आभा से अपनी देसी भाषा में सवाल पूछते हैं'
      },
      characterB: {
        id: 'aabha',
        name: 'आभा एआई',
        role: 'बोलने वाला जादुई 3D साथी',
        emoji: '🤖',
        actionText: 'बैंगनी तरंगों के साथ बोलकर दिनचर्या समझाती है'
      },
      companionAction: 'लोकल डेटाबेस से 100% सही और सुरक्षित जानकारी, शून्य भ्रम',
      keyPropEmoji: '📻',
      keyPropLabel: 'गाँव की चौपाल और रेडियो',
      outcomePill: '5 क्षेत्रीय भारतीय भाषाओं में संवाद'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Under the cool shade of the neem tree, Dadaji talks to Aabha in his native tongue.',
        textHindi: 'नीम के पेड़ की ठंडी छाँव में रामप्रसाद काका अपनी देसी बोली में आभा से बात करते हैं।'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Aabha bitiya, zara batao toh aaj dopahar ko mujhe kya karna hai aur dawai kab leni hai?',
        textHindi: 'आभा बिटिया, जरा बताओ तो आज दोपहर को मुझे क्या करना है और दवाई कब लेनी है?'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Ramprasad Kaka, dopahar 1:00 baje daal-roti ke baad Memantine dawai leni hai, aur shaam 5:00 baje khet ki sair hai!',
        textHindi: 'रामप्रसाद काका, दोपहर 1:00 बजे दाल-रोटी के बाद मेमेंटाइन गोली लेनी है, और शाम 5:00 बजे खेत की सैर है!'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Wah re bitiya! Kitni acchi tarah yaad dilaya! Ab main bilkul befikr hoon!',
        textHindi: 'वाह रे बिटिया! कितनी अच्छी तरह याद दिलाया! अब मैं बिल्कुल बेफिक्र हूँ!'
      }
    ]
  },
  {
    id: 4,
    startSec: 75,
    endSec: 110,
    title: 'दृश्य 4: गाँव के आँगन में दिमाग के खेल (मेमोरी मैच)',
    subtitle: 'आम 🥭, मोर 🦚, घंटी 🔔 और गाय 🐄 के कार्ड्स का मिलान — मुन्ना और दादाजी की जोड़ी',
    badge: 'दृश्य 04 • ग्रामीण ब्रेन गेम्स',
    icon: '🎴',
    storyChapter: 'Scene 4: आँगन में खेल-खेल में दिमागी कसरत',
    villageSetting: '🎨 मिट्टी का आँगन, चटाई और देसी मेमोरी कार्ड्स',
    cartoonScene: {
      bgGradient: 'from-amber-100 via-yellow-50 to-orange-100 dark:from-slate-950 dark:via-purple-950/80 dark:to-slate-900',
      settingLabel: '🎨 घर का आँगन • दोपहर 03:00 PM',
      sceneryElements: ['🥭 आम का पेड़', '🦚 नाचता मोर', '🐄 चरती गाय', '🧵 हाथ की बुनी चटाई'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद',
        role: 'कार्ड्स मिलाते हुए एकाग्र दादाजी',
        emoji: '👴',
        actionText: 'आम और मोर वाले कार्ड्स को पहचानकर मिला रहे हैं'
      },
      characterB: {
        id: 'munna',
        name: 'मुन्ना',
        role: 'ताली बजाकर नाचता हुआ पोता',
        emoji: '👦',
        actionText: 'दादाजी के सही मैच पर उछलकर ताली बजाता है'
      },
      companionAction: '6 कॉग्निटिव गेम्स: मेमोरी मैच, कलर स्ट्रोप, रूटीन ऑर्डरिंग',
      keyPropEmoji: '🦚',
      keyPropLabel: 'देसी मेमोरी मैच कार्ड्स',
      outcomePill: '85% एक्यूरेसी • 1.8 सेकंड रिस्पॉन्स'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'In the afternoon, Dadaji and Munna play cognitive memory games with Indian village cards.',
        textHindi: 'दोपहर में आँगन में बैठकर दादाजी और मुन्ना देसी चित्रों वाले मेमोरी कार्ड्स का खेल खेलते हैं।'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Mil gaya re Munna! Aam ke saath Aam aur Mor ke saath Mor! Dekh mera dimaag abhi bhi kitna tez hai!',
        textHindi: 'मिल गया रे मुन्ना! आम के साथ आम और मोर के साथ मोर! देख मेरा दिमाग अभी भी कितना तेज है!'
      },
      {
        speaker: 'munna',
        speakerName: 'मुन्ना',
        speakerEmoji: '👦',
        text: 'Yayyy Dada ji! Score 85 percent ho gaya! Aap toh gaon ke sabse smart dada ji ban gaye!',
        textHindi: 'वाह दादा जी! स्कोर 85 प्रतिशत हो गया! आप तो पूरे गाँव के सबसे स्मार्ट दादा जी बन गए!'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Superb! 85% accuracy with 1.8 second reaction speed recorded! Keeping rural minds sharp and active!',
        textHindi: 'शानदार! 85% एक्यूरेसी और 1.8 सेकंड की स्पीड दर्ज हुई! गाँव के हर दिमाग की कसरत!'
      }
    ]
  },
  {
    id: 5,
    startSec: 110,
    endSec: 135,
    title: 'दृश्य 5: एआई का कमाल — लेवल 3 का अपग्रेड',
    subtitle: 'काका के लिए नया चैलेंज और मुन्ना के लिए गणित की पहेलियाँ',
    badge: 'दृश्य 05 • एडेप्टिव एआई का जादू',
    icon: '⚡',
    storyChapter: 'Scene 5: स्वतः अपग्रेड होने वाला स्मार्ट सिस्टम',
    villageSetting: '⚡ चमकती न्यूरल तरंगे और 3 सुनहरे सितारे',
    cartoonScene: {
      bgGradient: 'from-cyan-100 via-teal-50 to-emerald-100 dark:from-slate-950 dark:via-cyan-950/80 dark:to-slate-900',
      settingLabel: '⚡ आभा एआई न्यूरल सिस्टम Core',
      sceneryElements: ['⭐ 3 सुनहरे स्टार्स', '🚀 लेवल 3 का रॉकेट', '🧠 चमकता स्मार्ट दिमाग', '✨ उत्सव का माहौल'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद',
        role: 'खुशी से फूले न समाते दादाजी',
        emoji: '👴',
        actionText: 'स्क्रीन पर 3 सुनहरे सितारे देखकर हँसते हैं'
      },
      characterB: {
        id: 'aabha',
        name: 'आभा एआई',
        role: 'एडेप्टिव न्यूरो-कैलिब्रेटर',
        emoji: '🧠',
        actionText: 'काका के 85% स्कोर को देखकर लेवल 3 अनलॉक करती है'
      },
      companionAction: 'उम्र और क्षमता के अनुसार डिफिकल्टी अपने आप बढ़ जाती है',
      keyPropEmoji: '⭐',
      keyPropLabel: '3 सुनहरे स्टार्स और ट्रॉफी',
      outcomePill: 'लेवल 2 से लेवल 3 में एडेप्टिव अपग्रेड'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'The Adaptive AI Engine detects high performance and automatically upgrades difficulty to Level 3.',
        textHindi: 'आभा का एडेप्टिव एआई इंजन काका का प्रदर्शन देखकर खेल को लेवल 2 से लेवल 3 में अपग्रेड कर देता है।'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Ramprasad Kaka, you passed Level 2 with flying colors! Unlocking Level 3 with 4x4 card grids for you!',
        textHindi: 'रामप्रसाद काका, आपने 85% स्कोर किया है! आपके लिए लेवल 3 और 4x4 का नया ग्रिड खोला जा रहा है!'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Arey wah! Ye machine toh mere hisaab se seekh rahi hai! Ab aur mazaa aayega!',
        textHindi: 'अरे वाह! यह मशीन तो मेरे हिसाब से सीख रही है! अब और मजा आएगा!'
      }
    ]
  },
  {
    id: 6,
    startSec: 135,
    endSec: 155,
    title: 'दृश्य 6: गाँव का प्राथमिक स्वास्थ्य केंद्र और आशा दीदी',
    subtitle: 'सुनीता दीदी मोबाइल पर काका की 4-Pillar सेहत और दवाइयों की पुष्टि देखती हैं',
    badge: 'दृश्य 06 • आशा कार्यकर्ता पोर्टल',
    icon: '🏥',
    storyChapter: 'Scene 6: गाँव के स्वास्थ्य केंद्र में सुरक्षा',
    villageSetting: '🏥 गाँव का प्राथमिक स्वास्थ्य केंद्र (PHC) • साइकिल और चार्ट',
    cartoonScene: {
      bgGradient: 'from-blue-100 via-indigo-50 to-teal-100 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-900',
      settingLabel: '🏥 आनंदपुर स्वास्थ्य केंद्र • 04:30 PM',
      sceneryElements: ['🚲 आशा कार्यकर्ता की साइकिल', '🩺 बीपी की मशीन व स्टेथोस्कोप', '📱 स्मार्ट फोन', '📋 गाँव का हेल्थ रजिस्टर'],
      characterA: {
        id: 'sunita',
        name: 'सुनीता दीदी (आशा कार्यकर्ता)',
        role: 'गाँव की समर्पित हेल्थ वर्कर',
        emoji: '👩‍⚕️',
        actionText: 'अपने फोन पर रामप्रसाद काका का 4-Pillar हेल्थ स्कोर देख रही हैं'
      },
      characterB: {
        id: 'dadaji',
        name: 'काका रामप्रसाद (घर पर)',
        role: 'सुरक्षित और तनावमुक्त बुजुर्ग',
        emoji: '👴',
        actionText: 'घर पर आराम से चाय पी रहे हैं, 100% दवाइयाँ पूरी'
      },
      companionAction: '4 स्तंभ: मेमोरी 82%, अटेंशन 76%, स्पीड 1.8s, कंसिस्टेंसी 84% 🔥',
      keyPropEmoji: '🩺',
      keyPropLabel: 'आशा कार्यकर्ता का फोन व रजिस्टर',
      outcomePill: 'गाँव-गाँव तक पारदर्शी रिमोट केयर'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'At the rural health sub-center, ASHA health worker Sunita monitors village elders on her smartphone.',
        textHindi: 'गाँव के स्वास्थ्य केंद्र पर आशा कार्यकर्ता सुनीता दीदी अपने फोन पर बुजुर्गों का कॉग्निटिव ग्राफ देखती हैं।'
      },
      {
        speaker: 'sunita',
        speakerName: 'सुनीता दीदी',
        speakerEmoji: '👩‍⚕️',
        text: 'Ramprasad Kaka ka Memory Score 82 percent hai, aur subah ki sabhi dawaiyan time par confirm ho gayi! AABHA AI ne humara kaam asaan kar diya!',
        textHindi: 'रामप्रसाद काका का मेमोरी स्कोर 82% है और सभी दवाइयाँ समय पर पूरी हैं! आभा एआई ने गाँव में स्वास्थ्य का काम कितना आसान कर दिया!'
      },
      {
        speaker: 'aabha',
        speakerName: 'आभा एआई',
        speakerEmoji: '🤖',
        text: 'Caregiver Portal Active: All village health parameters healthy with zero missed routine alerts!',
        textHindi: 'केयरगिवर पोर्टल एक्टिव: गाँव के सभी बुजुर्ग सुरक्षित हैं और कोई पेंडिंग अलार्म नहीं है!'
      }
    ]
  },
  {
    id: 7,
    startSec: 155,
    endSec: 170,
    title: 'दृश्य 7: लहलहाते खेतों में बिना इंटरनेट (100% ऑफलाइन)',
    subtitle: 'खेतों में 0 मोबाइल नेटवर्क में भी घंटी बजी, घर लौटते ही वाई-फाई से ऑटो-सिंक',
    badge: 'दृश्य 07 • 100% ऑफलाइन वॉल्ट',
    icon: '🌾',
    storyChapter: 'Scene 7: खेतों में बिना इंटरनेट चलना',
    villageSetting: '🌾 हरे-भरे गेहूं के खेत, ट्रैक्टर और पगडंडी',
    cartoonScene: {
      bgGradient: 'from-emerald-200 via-green-100 to-teal-100 dark:from-slate-950 dark:via-emerald-950/80 dark:to-slate-900',
      settingLabel: '🌾 गाँव के खेत व पगडंडी • शाम 05:30 PM (0 सिग्नल)',
      sceneryElements: ['🌾 गेहूं की बालियाँ', '🚜 लाल ट्रैक्टर', '🐄 चरती गाय व बछड़ा', '🚶‍♂️ पगडंडी की सैर'],
      characterA: {
        id: 'dadaji',
        name: 'काका रामप्रसाद',
        role: 'खेतों में लाठी लेकर टहलते दादाजी',
        emoji: '👴',
        actionText: 'पगडंडी पर सैर कर रहे हैं जहाँ मोबाइल में 0 नेटवर्क है'
      },
      characterB: {
        id: 'munna',
        name: 'मुन्ना',
        role: 'साथ में दौड़ता पोता',
        emoji: '👦',
        actionText: 'बिना इंटरनेट के भी टैबलेट पर ऑफलाइन गेम खेल रहा है'
      },
      companionAction: 'क्लाउड ☁️❌ ऑफलाइन मोड ➔ गाँव के केंद्र में ➔ 🟢 100% डेटा सिंक!',
      keyPropEmoji: '🚜',
      keyPropLabel: 'गाँव का ट्रैक्टर और खेत',
      outcomePill: 'दूरदराज गाँव में शून्य डेटा नुकसान'
    },
    dialogues: [
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'During an evening walk across the wheat fields with zero cellular bars, Aabha AI runs 100% offline.',
        textHindi: 'शाम को जब काका खेतों में टहलने जाते हैं जहाँ कोई मोबाइल नेटवर्क नहीं होता, आभा एआई 100% ऑफलाइन काम करती है।'
      },
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'Khet me ek bhi dandi network nahi hai, fir bhi Aabha ne paani pine ki pyari ghanti bajayi! Aur chopal aate hi data sync ho gaya!',
        textHindi: 'खेत में एक भी डंडी नेटवर्क नहीं था, फिर भी आभा ने पानी पीने की घंटी बजाई! और घर आते ही सारा डेटा सिंक हो गया!'
      },
      {
        speaker: 'munna',
        speakerName: 'मुन्ना',
        speakerEmoji: '👦',
        text: 'Dada ji, ye toh jaadui app hai! Khet me bhi chalti hai aur school me bhi!',
        textHindi: 'दादा जी, यह तो जादुई ऐप है! खेत में भी चलती है और स्कूल में भी!'
      }
    ]
  },
  {
    id: 8,
    startSec: 170,
    endSec: 180,
    title: 'दृश्य 8: गाँव का उत्सव और SIH26003 की विजय',
    subtitle: 'पूरा गाँव खुशहाल — हर बच्चे, युवा और बुजुर्ग का सच्चा डिजिटल संबल',
    badge: 'दृश्य 08 • गाँव का उत्सव और विज़न',
    icon: '🏆',
    storyChapter: 'Scene 8: पूरे भारत के गाँवों के लिए समर्पित',
    villageSetting: '🎉 चौपाल पर रोशनी, ढोलक और सुनहरी ट्रॉफी',
    cartoonScene: {
      bgGradient: 'from-purple-200 via-pink-100 to-amber-200 dark:from-purple-950 dark:via-indigo-950/90 dark:to-slate-900',
      settingLabel: '🎉 आनंदपुर गाँव का चौपाल उत्सव',
      sceneryElements: ['🪘 ढोलक व नगाड़े', '💐 फूलों की माला', '🏆 SIH 26003 गोल्ड ट्रॉफी', '🇮🇳 तिरंगा'],
      characterA: {
        id: 'dadaji',
        name: 'काका, मुन्ना, सुनीता दीदी व पूरा गाँव',
        role: 'हँसता-खेलता भारतीय गाँव',
        emoji: '👨‍🌾👩‍⚕️👦👴',
        actionText: 'चौपाल पर इकट्ठा होकर आभा एआई के साथ खुशियाँ मना रहे हैं'
      },
      companionAction: 'SIH26003 ट्रॉफी 🏆 • 5 भारतीय भाषाएँ • 6 कॉग्निटिव गेम्स • 100% ऑफलाइन',
      keyPropEmoji: '🏆',
      keyPropLabel: 'SIH 26003 गोल्ड ट्रॉफी',
      outcomePill: 'भारत के हर गाँव के लिए तैयार 🇮🇳'
    },
    dialogues: [
      {
        speaker: 'dadaji',
        speakerName: 'काका रामप्रसाद',
        speakerEmoji: '👴',
        text: 'AABHA AI ne humare gaon ke har buzurg ko samman aur azaadi de di!',
        textHindi: 'आभा एआई ने हमारे गाँव के हर बुजुर्ग को सम्मान और आजादी दे दी!'
      },
      {
        speaker: 'munna',
        speakerName: 'मुन्ना',
        speakerEmoji: '👦',
        text: 'Aur hum baccho ke dimaag ko super sharp bana diya!',
        textHindi: 'और हम बच्चों के दिमाग को सुपर शार्प बना दिया!'
      },
      {
        speaker: 'sunita',
        speakerName: 'सुनीता दीदी',
        speakerEmoji: '👩‍⚕️',
        text: 'Digital Bharat ka saccha sankalp — gaon gaon me swasthya aur suraksha!',
        textHindi: 'डिजिटल भारत का सच्चा संकल्प — गाँव-गाँव में स्वास्थ्य और सुरक्षा!'
      },
      {
        speaker: 'narrator',
        speakerName: 'सूत्रधार',
        speakerEmoji: '🎙️',
        text: 'Aabha AI: Supporting memory, empowering independence, connecting rural India. Smart India Hackathon SIH26003. Dhanyavaad!',
        textHindi: 'आभा एआई: यादों का संबल, स्वतंत्रता का संबल। स्मार्ट इंडिया हैकाथॉन SIH26003। धन्यवाद!'
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
  const [voiceLang, setVoiceLang] = useState<'EN' | 'HI'>('HI'); // Default to Hindi for Desi Village Story
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerId>('narrator');

  const totalSeconds = 180; // 3 Minutes
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

  // Play next continuous dialogue with VILLAGE CHARACTER-SPECIFIC VOICE PROFILE
  const playCharacterDialogue = (stage: StageConfig, dialogueIndex: number) => {
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

      // Set character-specific voice pitch and rate
      utterance.pitch = speakerProfile.pitch;
      utterance.rate = speakerProfile.rate;
      utterance.lang = voiceLangRef.current === 'HI' ? 'hi-IN' : 'en-US';

      // Pick matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (currentLine.speaker === 'sunita') {
        const femaleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Jenny'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else if (currentLine.speaker === 'dadaji') {
        const maleVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George'))
        );
        if (maleVoice) utterance.voice = maleVoice;
      } else if (currentLine.speaker === 'munna') {
        const childVoice = voices.find(v =>
          voiceLangRef.current === 'HI'
            ? v.lang.includes('hi')
            : (v.name.includes('Zira') || v.name.includes('Samantha'))
        );
        if (childVoice) utterance.voice = childVoice;
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
                STAGES.find(s => s.id === currentStageIdRef.current) || stage;
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

  // Lifecycle & Music setup
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

      playCharacterDialogue(STAGES[0], 0);
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
      stageDialogueIdxRef.current = 0;
      playCharacterDialogue(currentStage, 0);
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
          playCharacterDialogue(currentStage, stageDialogueIdxRef.current);
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
    playCharacterDialogue(STAGES[0], 0);
  };

  const handleJumpToStage = (stage: StageConfig) => {
    stopSpeech();
    setSeconds(stage.startSec);
    currentStageIdRef.current = stage.id;
    stageDialogueIdxRef.current = 0;
    playCharacterDialogue(stage, 0);
  };

  const handleToggleVoiceover = () => {
    if (isVoiceoverOn) {
      stopSpeech();
      setIsVoiceoverOn(false);
      isVoiceoverOnRef.current = false;
    } else {
      setIsVoiceoverOn(true);
      isVoiceoverOnRef.current = true;
      playCharacterDialogue(currentStage, stageDialogueIdxRef.current);
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
    playCharacterDialogue(currentStage, 0);
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

  const currentDialogues = currentStage.dialogues;
  const activeLine = currentDialogues[currentDialogueIdx % currentDialogues.length] || currentDialogues[0];
  const activeSpeakerProfile = SPEAKER_PROFILES[activeLine.speaker] || SPEAKER_PROFILES.narrator;
  const activeSubtitle = voiceLang === 'HI' ? activeLine.textHindi : activeLine.text;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-sans select-none overflow-hidden"
    >
      <div className="relative w-full max-w-6xl bg-[var(--bg-surface)] rounded-[24px] sm:rounded-[36px] border-2 border-amber-500/40 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-modal-in text-[var(--text-primary)]">
        {/* ─── TOP PRESENTATION BAR (VILLAGE THEME) ─────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 p-0.5 animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm">
                🏡
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                  AABHA AI • आनंदपुर गाँव की एनिमेटेड कहानी
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                  देसी कार्टून पात्र बोल रहे हैं 🗣️
                </span>
              </div>
              <div className="text-[10px] text-amber-200/80 font-medium hidden sm:block">
                रामप्रसाद काका, मुन्ना, सुनीता दीदी और आभा एआई की असली गाँव की कहानी
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
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                  : 'bg-white/10 border-white/15 text-slate-400'
              }`}
              title={isMusicOn ? 'Background Music ON' : 'Background Music Muted'}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicOn ? 'text-amber-400 animate-bounce' : ''}`} />
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
              <span className="hidden lg:inline text-[11px]">{isVoiceoverOn ? 'आवाज़ चालू' : 'Muted'}</span>
            </button>

            {/* Narration Language Switch (EN / HI) */}
            <button
              type="button"
              onClick={handleToggleLang}
              className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-black text-amber-200 transition cursor-pointer border border-amber-400/40"
              title="Switch Voiceover Language"
            >
              {voiceLang === 'HI' ? '🇮🇳 हिंदी' : '🇺🇸 EN'}
            </button>

            {/* Countdown Timer */}
            <div className="px-2 sm:px-2.5 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs sm:text-sm font-black text-amber-300">
              {formatTime(seconds)} / 03:00
            </div>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title={isPlaying ? 'Pause Story' : 'Resume Story'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
              title="Restart Village Story"
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
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 h-full transition-all duration-300"
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

        {/* ─── ACTIVE CHARACTER DIALOGUE STRIP (WHO IS SPEAKING NOW) ───────── */}
        <div className="px-3.5 sm:px-8 py-2.5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border-b border-amber-400/20 flex items-center justify-between gap-3 shrink-0 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            {/* Active Character Badge with Speaking Wave */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 shrink-0 border shadow-xs ${activeSpeakerProfile.bgColor} ${activeSpeakerProfile.color}`}>
              <Radio className="w-3.5 h-3.5 animate-pulse text-current" />
              <span>{activeLine.speakerEmoji} {activeLine.speakerName} बोल रहे हैं:</span>
            </span>

            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] italic leading-relaxed animate-fade-in line-clamp-1">
              "{activeSubtitle}"
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
            <span>गाँव की चौपाल आवाज़</span>
          </div>
        </div>

        {/* ─── DYNAMIC CARTOON THEATER & INTERACTIVE STORY STAGE ───────────── */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4">
          {/* 🎭 THE MAIN ANIMATED VILLAGE CARTOON STORYBOARD STAGE ─────────── */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-br ${currentStage.cartoonScene.bgGradient} border-2 border-amber-500/50 shadow-xl relative overflow-hidden transition-all duration-700 space-y-4`}>
            {/* Top Stage Header: Setting & Village Elements */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-sm flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>{currentStage.cartoonScene.settingLabel}</span>
              </span>

              {/* Scenery Props Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentStage.cartoonScene.sceneryElements.map((elem, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 text-amber-900 dark:text-amber-200">
                    {elem}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── ANIMATED VILLAGE CARTOON CHARACTERS TALKING ALOUD ────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative z-10 pt-2">
              {/* Character A (e.g. Dadaji Ramprasad) Animated Card */}
              {(() => {
                const charA = currentStage.cartoonScene.characterA;
                const isCharASpeaking = activeSpeaker === charA.id;
                return (
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-md border-2 shadow-lg space-y-3 transition-all duration-300 ${
                      isCharASpeaking
                        ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-500 ring-4 ring-amber-400/50 scale-[1.03] shadow-amber-500/30'
                        : 'bg-white/90 dark:bg-slate-900/90 border-amber-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Animated Character Avatar */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 ${
                            isCharASpeaking ? 'animate-bounce ring-4 ring-amber-400' : ''
                          }`}
                        >
                          {charA.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              {charA.name}
                            </h4>
                            {isCharASpeaking && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950 animate-pulse">
                                🗣️ बोल रहे हैं
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            {charA.role}
                          </span>
                        </div>
                      </div>

                      {isCharASpeaking && (
                        <div className="flex items-center gap-1 text-amber-500 animate-pulse">
                          <Volume2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {charA.actionText}
                    </div>

                    {/* Dialogue Box */}
                    <div
                      className={`p-3 rounded-2xl text-xs font-bold leading-relaxed border transition-all ${
                        isCharASpeaking
                          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-transparent shadow-md scale-[1.01]'
                          : 'bg-amber-100/70 dark:bg-slate-800/70 border-amber-300/40 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base shrink-0">{isCharASpeaking ? '🗣️' : '💬'}</span>
                        <p className="italic">
                          {isCharASpeaking
                            ? `"${activeSubtitle}"`
                            : `"${voiceLang === 'HI' ? (currentStage.dialogues.find(d => d.speaker === charA.id)?.textHindi || charA.actionText) : (currentStage.dialogues.find(d => d.speaker === charA.id)?.text || charA.actionText)}"`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Character B or Aabha Companion Animated Card */}
              {currentStage.cartoonScene.characterB ? (
                (() => {
                  const charB = currentStage.cartoonScene.characterB;
                  const isCharBSpeaking = activeSpeaker === charB.id;
                  return (
                    <div
                      className={`p-4 rounded-2xl backdrop-blur-md border-2 shadow-lg space-y-3 transition-all duration-300 ${
                        isCharBSpeaking
                          ? 'bg-orange-50/95 dark:bg-orange-950/90 border-orange-500 ring-4 ring-orange-400/50 scale-[1.03] shadow-orange-500/30'
                          : 'bg-white/90 dark:bg-slate-900/90 border-orange-400/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Animated Character Avatar */}
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 ${
                              isCharBSpeaking ? 'animate-bounce ring-4 ring-orange-400' : 'animate-pulse'
                            }`}
                          >
                            {charB.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                {charB.name}
                              </h4>
                              {isCharBSpeaking && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-600 text-white animate-pulse">
                                  🗣️ बोल रहे हैं
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400">
                              {charB.role}
                            </span>
                          </div>
                        </div>

                        {isCharBSpeaking && (
                          <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                            <Volume2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {charB.actionText}
                      </div>

                      {/* Dialogue Box */}
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold leading-relaxed border transition-all ${
                          isCharBSpeaking
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md scale-[1.01]'
                            : 'bg-orange-100/70 dark:bg-slate-800/70 border-orange-300/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">{isCharBSpeaking ? '🗣️' : '💬'}</span>
                          <p className="italic">
                            {isCharBSpeaking
                              ? `"${activeSubtitle}"`
                              : `"${voiceLang === 'HI' ? (currentStage.dialogues.find(d => d.speaker === charB.id)?.textHindi || charB.actionText) : (currentStage.dialogues.find(d => d.speaker === charB.id)?.text || charB.actionText)}"`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const isAabhaSpeaking = activeSpeaker === 'aabha';
                  return (
                    <div
                      className={`p-4 rounded-2xl border-2 text-white shadow-lg flex items-center gap-4 transition-all duration-300 ${
                        isAabhaSpeaking
                          ? 'bg-gradient-to-r from-amber-950 via-purple-950 to-teal-950 border-amber-400 ring-4 ring-amber-400/40 scale-[1.03]'
                          : 'bg-gradient-to-r from-slate-950/90 to-purple-950/90 border-amber-500/30'
                      }`}
                    >
                      <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                        <Abha3DOrb size="md" state={isAabhaSpeaking ? 'SPEAKING' : 'IDLE'} interactive={false} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                            आभा एआई (गाँव का स्मार्ट साथी)
                          </span>
                          {isAabhaSpeaking && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse">
                              🗣️ आवाज़ चालू
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white">
                          {isAabhaSpeaking ? `"${activeSubtitle}"` : currentStage.cartoonScene.companionAction}
                        </h4>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 border border-emerald-400/50 text-emerald-300">
                          {currentStage.cartoonScene.outcomePill}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Bottom Village Props & Outcome Ribbon */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-950/70 backdrop-blur-md border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10 font-bold">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentStage.cartoonScene.keyPropEmoji}</span>
                <span className="text-amber-900 dark:text-amber-200">गाँव की खास वस्तु: {currentStage.cartoonScene.keyPropLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400">✨ गाँव का लाभ:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">{currentStage.cartoonScene.outcomePill}</span>
              </div>
            </div>
          </div>

          {/* ─── LIVE INTERACTIVE APP PROOF CONTAINER (BELOW CARTOON STAGE) ─ */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  गाँव की लाइव सिस्टम कार्यप्रणाली (दृश्य {currentStage.id}):
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                {currentStage.startSec}s – {currentStage.endSec}s
              </span>
            </div>

            {/* Stage-Specific Village App Proofs */}
            {currentStage.id === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👴</div>
                  <div className="font-bold mt-1">रामप्रसाद काका (75)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">गाँव के सम्मानित बुजुर्ग</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">👦</div>
                  <div className="font-bold mt-1">मुन्ना (9 वर्ष)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">गाँव की नई पीढ़ी</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xl">🤖</div>
                  <div className="font-bold mt-1">आभा एआई</div>
                  <div className="text-[10px] text-[var(--text-muted)]">गाँव का जादुई साथी</div>
                </div>
              </div>
            )}

            {currentStage.id === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-lg">🚨</span>
                  <div className="font-black text-rose-500">1-टैप मदद (SOS)</div>
                  <div className="text-[9px] text-[var(--text-muted)]">काका की सुरक्षा</div>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <span className="text-lg">💊</span>
                  <div className="font-black text-teal-500">सुबह की गोली ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">Donepezil 5mg</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-lg">🏺</span>
                  <div className="font-black text-blue-500">घड़े का पानी (2/6) ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">ताजा पानी दर्ज</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-lg">📚</span>
                  <div className="font-black text-indigo-500">मुन्ना की पढ़ाई ✓</div>
                  <div className="text-[9px] text-[var(--text-muted)]">स्कूल का होमवर्क</div>
                </div>
              </div>
            )}

            {currentStage.id === 3 && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗣️</span>
                  <span>"आभा बिटिया, आज का क्या कार्यक्रम है?" ➔ शून्य मेडिकल भ्रम के साथ उत्तर</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold">
                  देसी आवाज में बातचीत ✓
                </span>
              </div>
            )}

            {currentStage.id === 4 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎴</span>
                  <span>देसी मेमोरी कार्ड्स: 🥭 आम + 🦚 मोर + 🐄 गाय + 🔔 घंटी</span>
                </div>
                <span className="font-mono font-bold text-emerald-500">स्कोर: 85% • रिस्पॉन्स: 1.8s</span>
              </div>
            )}

            {currentStage.id === 5 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>काका के 85% स्कोर पर सिस्टम ने 4x4 ग्रिड और लेवल 3 स्वतः अनलॉक किया!</span>
                </div>
                <span className="font-black text-emerald-600">⭐ लेवल 3 अनलॉक</span>
              </div>
            )}

            {currentStage.id === 6 && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">मेमोरी</div>
                  <div className="font-black text-emerald-500">82%</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">अटेंशन</div>
                  <div className="font-black text-cyan-500">76%</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">स्पीड</div>
                  <div className="font-black text-purple-500">1.8s</div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">स्ट्रीक</div>
                  <div className="font-black text-amber-500">5 दिन 🔥</div>
                </div>
              </div>
            )}

            {currentStage.id === 7 && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-rose-500" />
                  <span>खेतों में 0 मोबाइल नेटवर्क ➔ लोकल फोन वॉल्ट में 100% काम करता है</span>
                </div>
                <span className="text-emerald-500 font-bold">चौपाल आते ही वाई-फाई से सिंक ✓</span>
              </div>
            )}

            {currentStage.id === 8 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-between gap-1">
                <span>🏆 SIH26003: भारत के हर गाँव और हर घर के लिए संपूर्ण डिजिटल संबल</span>
                <span className="text-amber-200">गाँव-गाँव में सेवा के लिए तैयार 🇮🇳</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-8 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">गाँव के पात्र खुद बोल रहे हैं • 100% ओरिजिनल कार्टून कहानी • SIH26003</span>
            <span className="sm:hidden">गाँव की कहानी</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-glass px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              ↻ कहानी दोबारा शुरू करें
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-glow px-5 py-1.5 text-xs font-black cursor-pointer shadow-md"
            >
              स्टोरी बंद करें
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OneMinuteDemoExperience;
