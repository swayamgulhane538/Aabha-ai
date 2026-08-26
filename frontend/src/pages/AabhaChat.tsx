import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { useOnlineStatus } from '../services/offlineService';
import { Abha3DOrb, OrbState } from '../components/Abha3DOrb';
import { geminiService } from '../services/geminiService';
import {
  Mic,
  MicOff,
  Send,
  Globe,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  engine?: string;
  timestamp: Date;
}

export const AabhaChat: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOnline = useOnlineStatus();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const lang = (i18n.language || 'en').split('-')[0].toLowerCase();
    let greeting = `Namaste ${user?.name || 'Mr. Arun Das'}! I am AABHA, your AI healthcare companion powered by Google Gemini. How are you feeling today? You can ask me about your medicines, memory games, daily routine, or your family.`;
    if (lang === 'mr') {
      greeting = `नमस्ते ${user?.name || 'श्री अरुण दास'}! मी आभा आहे, गुगल जेमिनीद्वारे समर्थित तुमची एआय आरोग्य साथीदार. आज तुम्हाला कसे वाटत आहे? तुम्ही मला तुमची औषधे, स्मरणशक्तीचे खेळ, दिनचर्या किंवा कुटुंबाबद्दल विचारू शकता.`;
    } else if (lang === 'hi') {
      greeting = `नमस्ते ${user?.name || 'श्री अरुण दास'}! मैं आभा हूँ, गूगल जेमिनी द्वारा संचालित आपकी एआई स्वास्थ्य साथी। आज आप कैसा महसूस कर रहे हैं? आप मुझसे अपनी दवाइयों, दिमागी खेल, दिनचर्या या परिवार के बारे में पूछ सकते हैं।`;
    } else if (lang === 'bn') {
      greeting = `নমস্কার ${user?.name || 'শ্রী অরুণ দাস'}! আমি আভা, গুগল জেমিনি দ্বারা চালিত আপনার এআই স্বাস্থ্য সঙ্গী। আজ আপনার কেমন লাগছে? আপনি আমাকে আপনার ওষুধ, স্মৃতি খেলা, দিনলিপি বা পরিবার সম্পর্কে জিজ্ঞাসা করতে পারেন।`;
    } else if (lang === 'as') {
      greeting = `নমস্কাৰ ${user?.name || 'শ্ৰী অৰুণ দাস'}! মই আভা, গুগল জেমিনিৰ দ্বাৰা চালিত আপোনাৰ এআই স্বাস্থ্য সংগী। আজি আপোনাৰ কেনে লাগিছে? আপুনি মোক আপোনাৰ ঔষধ, স্মৃতিৰ খেল, দিনচৰ্যা বা পৰিয়ালৰ বিষয়ে সুধিব পাৰে।`;
    }
    return [
      {
        id: '1',
        text: greeting,
        sender: 'ai',
        engine: 'Google Gemini 1.5 Flash',
        timestamp: new Date()
      }
    ];
  });

  const [input, setInput] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSpeechSupported] = useState(() => speechService.isSupported());
  const [isMuted, setIsMuted] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => geminiService.getApiKey());
  const [keyStatusMsg, setKeyStatusMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(() => geminiService.hasApiKey());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOnline) setOrbState('ERROR');
    else if (orbState === 'ERROR') setOrbState('IDLE');
  }, [isOnline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveAndTestKey = async () => {
    if (!apiKeyInput.trim()) {
      geminiService.setApiKey('');
      setHasGeminiKey(false);
      setKeyStatusMsg({ type: 'error', text: 'API Key removed. Using default offline fallback.' });
      return;
    }

    setIsTestingKey(true);
    setKeyStatusMsg({ type: '', text: 'Testing connection to Google Gemini API...' });

    const result = await geminiService.testConnection(apiKeyInput.trim());
    setIsTestingKey(false);

    if (result.success) {
      geminiService.setApiKey(apiKeyInput.trim());
      setHasGeminiKey(true);
      setKeyStatusMsg({ type: 'success', text: '✅ Connected to Google Gemini 1.5 Flash successfully!' });
      setTimeout(() => {
        setShowKeyModal(false);
      }, 1500);
    } else {
      setKeyStatusMsg({ type: 'error', text: `❌ ${result.message}` });
    }
  };

  /** Check for explicit local commands (like starting a game immediately) */
  const checkDirectNavigation = (query: string): boolean => {
    const q = query.toLowerCase();
    if (q.includes('start memory') || q.includes('start game') || q.includes('khel shuru') || q.includes('खेळ सुरू')) {
      setTimeout(() => navigate('/patient/games/memory-match'), 2200);
      return true;
    }
    return false;
  };

  const sendToAI = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setOrbState('THINKING');

    const shouldNavigate = checkDirectNavigation(text);

    // 1. Try Direct Client-Side Gemini (Instant, Low Latency) if key exists
    let aiText = '';
    let engineName = 'Google Gemini 1.5 Flash';

    if (geminiService.hasApiKey()) {
      try {
        const patientContext = `Patient Name: ${user?.name || 'Mr. Arun Das'}, Medications: Donepezil 5mg (8:30 AM), Memantine 10mg (1:00 PM), Daughter: Priya Das.`;
        const clientRes = await geminiService.generateChatResponse(text, patientContext, i18n.language);
        if (clientRes) {
          aiText = clientRes;
        }
      } catch {
        // Fallback to backend
      }
    }

    // 2. Call Backend API (which also runs Google Gemini with persistent DB context)
    if (!aiText) {
      try {
        const response: any = await api.post('/ai/chat', {
          message: text,
          conversationId,
          language: i18n.language,
          apiKey: geminiService.getApiKey()
        });

        aiText = response.reply || response.response || response.message || "I am always here with you!";
        if (response.engine) engineName = response.engine === 'google-gemini' ? 'Google Gemini 1.5 Flash' : response.engine;
        if (response.conversationId) setConversationId(response.conversationId);
      } catch {
        // 3. Multi-Lingual Contextual Fallback
        const cleanLang = (i18n.language || 'en').toLowerCase().split('-')[0];
        const patName = user?.name || (cleanLang === 'mr' ? 'काका' : cleanLang === 'hi' ? 'जी' : '');

        if (cleanLang === 'mr') {
          aiText = shouldNavigate
            ? "तुमच्यासाठी मेमरी मॅच (पातळी २) खेळ सुरू करत आहे! चला मेंदूचा छान सराव करूया."
            : `नमस्कार ${patName}! मी आभा आहे, तुमची मैत्रीण. तुमचे दुपारचे औषध १:०० वाजता आहे. आपण एखादा छान खेळ खेळूया का?`;
        } else if (cleanLang === 'hi') {
          aiText = shouldNavigate
            ? "आपके लिए मेमोरी मैच (लेवल 2) खेल शुरू किया जा रहा है! चलिए साथ में अभ्यास करते हैं।"
            : `नमस्ते ${patName}! मैं आभा हूँ। आपकी अगली दवा का समय दोपहर 1:00 बजे है। क्या आप कोई मेमोरी गेम खेलना चाहेंगे?`;
        } else if (cleanLang === 'bn') {
          aiText = shouldNavigate
            ? "আপনার জন্য মেমরি ম্যাচ খেলা শুরু হচ্ছে!"
            : `নমস্কার! আমি আভা। আপনার পরবর্তী ওষুধের সময় দুপুর ১:০০ টায়।`;
        } else if (cleanLang === 'gu') {
          aiText = shouldNavigate
            ? "તમારા માટે મેમરી મેચ ગેમ શરૂ થઈ રહી છે!"
            : `નમસ્તે! હું આભા છું. તમારી આગામી દવાનો સમય બપોરે ૧:૦૦ વાગ્યે છે.`;
        } else if (cleanLang === 'ta') {
          aiText = shouldNavigate
            ? "உங்களுக்காக நினைவாற்றல் விளையாட்டு தொடங்குகிறது!"
            : `வணக்கம்! நான் ஆபா. உங்கள் அடுத்த மருந்து மதியம் 1:00 மணிக்கு உள்ளது.`;
        } else if (cleanLang === 'te') {
          aiText = shouldNavigate
            ? "మీ కోసం మెమరీ మ్యాచ్ గేమ్ ప్రారంభమవుతోంది!"
            : `నమస్కారం! నేను ఆభా. మీ తదుపరి మందు సమయం మధ్యాహ్నం 1:00 గంటలకు.`;
        } else if (cleanLang === 'kn') {
          aiText = shouldNavigate
            ? "ನಿಮಗಾಗಿ ಮೆಮೊರಿ ಮ್ಯಾಚ್ ಆಟ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ!"
            : `ನಮಸ್ಕಾರ! ನಾನು ಆಭಾ. ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿ ಮಧ್ಯಾಹ್ನ 1:00 ಗಂಟೆಗೆ ಇದೆ.`;
        } else if (cleanLang === 'pa') {
          aiText = shouldNavigate
            ? "ਤੁਹਾਡੇ ਲਈ ਮੈਮੋਰੀ ਮੈਚ ਖੇਡ ਸ਼ੁਰੂ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ!"
            : `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਆਭਾ ਹਾਂ। ਤੁਹਾਡੀ ਅਗਲੀ ਦਵਾਈ ਦੁਪਹਿਰ 1:00 ਵਜੇ ਹੈ।`;
        } else {
          aiText = shouldNavigate
            ? "Starting your recommended Memory Match exercise (Level 2) in just a moment! Let's stimulate your brain together."
            : `Namaste ${user?.name || 'Mr. Arun Das'}! I am right here with you. Your next scheduled medicine is Memantine (10mg) at 1:00 PM with water. Would you like to practice a memory exercise?`;
        }
        engineName = 'Aabha Intelligent Assistant';
      }
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: 'ai',
      engine: engineName,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);

    if (!isMuted && isSpeechSupported) {
      setOrbState('SPEAKING');
      speechService.speak(aiText, i18n.language, () => setOrbState('IDLE'));
    } else {
      setOrbState('IDLE');
    }
  };

  const handleSend = () => {
    if (input.trim() && orbState !== 'THINKING') {
      sendToAI(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (!isSpeechSupported) return;

    const getSpeechLangCode = (lang: string) => {
      const map: Record<string, string> = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        as: 'as-IN',
        gu: 'gu-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        pa: 'pa-IN',
        en: 'en-US'
      };
      const clean = lang?.toLowerCase().split('-')[0] || 'en';
      return map[clean] || 'en-US';
    };

    if (orbState === 'LISTENING') {
      speechService.stopListening();
      setOrbState('IDLE');
      return;
    }

    setOrbState('LISTENING');
    speechService.startListening(
      (transcript: string) => {
        setOrbState('IDLE');
        if (transcript.trim()) {
          sendToAI(transcript.trim());
        }
      },
      () => setOrbState('IDLE'),
      getSpeechLangCode(i18n.language)
    );
  };

  const INDIAN_LANGS = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'as', label: 'অসমীয়া' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'en', label: 'English' }
  ];

  const getQuickPrompts = () => {
    const lang = i18n.language.split('-')[0];
    if (lang === 'hi') {
      return [
        { label: '📅 आज का क्या कार्यक्रम है?', text: 'आज मेरा क्या कार्यक्रम है?' },
        { label: '💊 मेरी अगली दवा कब है?', text: 'मेरी अगली दवा का समय कब है?' },
        { label: '🧠 मेमोरी गेम शुरू करो', text: 'मेमोरी मैच गेम शुरू करो' },
        { label: '👨‍👩‍👧 मेरा परिवार कौन है?', text: 'मेरे परिवार में कौन-कौन है?' },
        { label: '🌟 आज मेरा स्वास्थ्य कैसा है?', text: 'आज मेरा कॉग्निटिव स्कोर और स्वास्थ्य कैसा है?' },
        { label: '📜 एक सुंदर कहानी सुनाओ', text: 'मुझे परिवार और प्रेम पर एक छोटी प्रेरणादायक कहानी सुनाओ।' }
      ];
    }
    if (lang === 'mr') {
      return [
        { label: '📅 आजचे नियोजन काय आहे?', text: 'आज माझे काय नियोजन आहे?' },
        { label: '💊 माझे पुढील औषध केव्हा आहे?', text: 'माझे पुढचे औषध केव्हा घ्यायचे आहे?' },
        { label: '🧠 मेमरी गेम सुरू करा', text: 'मेमरी मॅच खेळ सुरू करा' },
        { label: '👨‍👩‍👧 माझे कुटुंब कोण आहे?', text: 'माझ्या कुटुंबात कोण कोण आहे?' },
        { label: '🌟 आजचे माझे आरोग्य कसे आहे?', text: 'आजचे माझे आरोग्य आणि स्कोर कसा आहे?' },
        { label: '📜 एक छान गोष्ट सांगा', text: 'मला एक सुंदर कौटुंबिक गोष्ट सांगा.' }
      ];
    }
    if (lang === 'bn') {
      return [
        { label: '📅 আজকের সময়সূচী কী?', text: 'আজকের আমার সময়সূচী কী?' },
        { label: '💊 আমার ওষুধ কখন?', text: 'আমার পরের ওষুধের সময় কখন?' },
        { label: '🧠 মেমরি খেলা শুরু করুন', text: 'মেমরি ম্যাচ খেলা শুরু করুন' },
        { label: '📜 একটি গল্প বলুন', text: 'আমাকে একটি সুন্দর পরিবারের গল্প বলুন।' }
      ];
    }
    if (lang === 'gu') {
      return [
        { label: '📅 આજનું સમયપત્રક શું છે?', text: 'આજનું મારું શિડ્યુલ શું છે?' },
        { label: '💊 મારી દવા ક્યારે છે?', text: 'મારી આગામી દવાનો સમય ક્યારે છે?' },
        { label: '🧠 મેમરી રમત શરૂ કરો', text: 'મેમરી મેચ ગેમ શરૂ કરો' },
        { label: '📜 એક સુંદર વાર્તા કહો', text: 'મને એક સુંદર વાર્તા કહો.' }
      ];
    }
    if (lang === 'ta') {
      return [
        { label: '📅 இன்றைய அட்டவணை என்ன?', text: 'இன்று எனக்கு என்ன அட்டவணை?' },
        { label: '💊 அடுத்த மருந்து எப்போது?', text: 'என் அடுத்த மருந்து எப்போது எடுக்க வேண்டும்?' },
        { label: '🧠 விளையாட்டு தொடங்கு', text: 'நினைவாற்றல் விளையாட்டைத் தொடங்கு' }
      ];
    }
    if (lang === 'te') {
      return [
        { label: '📅 నేటి షెడ్యూల్ ఏమిటి?', text: 'ఈరోజు నా షెడ్యూల్ ఏమిటి?' },
        { label: '💊 తదుపరి మందు ఎప్పుడు?', text: 'నా తదుపరి మందు ఎప్పుడు తీసుకోవాలి?' },
        { label: '🧠 మెమరీ గేమ్ ప్రారంభించు', text: 'మెమరీ మ్యాచ్ గేమ్ ప్రారంభించు' }
      ];
    }
    if (lang === 'kn') {
      return [
        { label: '📅 ಇಂದಿನ ವೇಳಾಪಟ್ಟಿ ಏನು?', text: 'ಇಂದು ನನ್ನ ವೇಳಾಪಟ್ಟಿ ಏನು?' },
        { label: '💊 ಮುಂದಿನ ಔಷಧಿ ಯಾವಾಗ?', text: 'ನನ್ನ ಮುಂದಿನ ಔಷಧಿಯ ಸಮಯ ಯಾವಾಗ?' },
        { label: '🧠 ಮೆಮೊರಿ ಆಟ ಪ್ರಾರಂಭಿಸಿ', text: 'ಮೆಮೊರಿ ಮ್ಯಾಚ್ ಆಟವನ್ನು ಪ್ರಾರಂಭಿಸಿ' }
      ];
    }
    if (lang === 'pa') {
      return [
        { label: '📅 ਅੱਜ ਦਾ ਸ਼ਡਿਊਲ ਕੀ ਹੈ?', text: 'ਅੱਜ ਮੇਰਾ ਕੀ ਪ੍ਰੋਗਰਾਮ ਹੈ?' },
        { label: '💊 ਮੇਰੀ ਅਗਲੀ ਦਵਾਈ ਕਦੋਂ ਹੈ?', text: 'ਮੇਰੀ ਅਗਲੀ ਦਵਾਈ ਦਾ ਸਮਾਂ ਕਦੋਂ ਹੈ?' },
        { label: '🧠 ਮੈਮੋਰੀ ਗੇਮ ਸ਼ੁਰੂ ਕਰੋ', text: 'ਮੈਮੋਰੀ ਮੈਚ ਗੇਮ ਸ਼ੁਰੂ ਕਰੋ' }
      ];
    }
    return [
      { label: `📅 ${t('What do I have today?')}`, text: 'What is my schedule today?' },
      { label: `💊 ${t('When is my medicine?')}`, text: 'When is my next medicine?' },
      { label: `🧠 ${t('Start memory game')}`, text: 'Start a memory game' },
      { label: `👨‍👩‍👧 ${t('Who is my family?')}`, text: 'Who is my son and daughter?' },
      { label: `🌟 ${t('How am I doing today?')}`, text: 'How am I doing today and what is my cognitive score?' },
      { label: `📜 ${t('Tell me a heartwarming story')}`, text: 'Tell me a short heartwarming memory story about family and tea.' }
    ];
  };

  const quickPrompts = getQuickPrompts();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-sans pb-24 text-[var(--text-primary)]">
      {/* ─── 1. TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-3.5 sm:p-5 rounded-[24px] flex items-center justify-between border border-[var(--card-border-inline)] gap-2 flex-wrap sm:flex-nowrap">
        <Link to="/patient" className="btn-glass px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs flex items-center gap-1.5 hover:text-emerald-400">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('Back to Dashboard')}</span>
          <span className="sm:hidden">{t('Back')}</span>
        </Link>

        {/* Multi-Lingual & Model Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Multi-Language Dropdown for Gemini */}
          <select
            value={i18n.language.split('-')[0]}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="btn-glass px-2.5 py-1.5 text-xs font-black cursor-pointer rounded-xl focus:outline-none"
            aria-label="Select AI Chat Language"
          >
            {INDIAN_LANGS.map(l => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                🗣️ {l.label}
              </option>
            ))}
          </select>

          {/* Gemini API Key Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              hasGeminiKey
                ? 'bg-teal-500/20 text-teal-300 border-teal-400/40 shadow-sm'
                : 'btn-glass text-amber-300 border-amber-400/40'
            }`}
            title="Configure Google Gemini API Key"
          >
            <span className="hidden sm:inline">{hasGeminiKey ? t('Gemini Active') : t('Enter Gemini Key')}</span>
          </button>


          {/* Voice Output Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'btn-glass text-emerald-400'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMuted ? t('Muted') : t('Voice ON')}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 3D ORB VISUALIZER STAGE ────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] p-5 sm:p-7 rounded-[28px] border border-[var(--card-border-inline)] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
        <div className="py-1 sm:py-2">
          <Abha3DOrb size="lg" state={orbState} interactive={true} onClick={toggleListening} showLabel={true} />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {t('AABHA Voice Care Companion')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
            Google Gemini 1.5
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mt-1">
          {orbState === 'LISTENING'
            ? t('Listening to you... Speak now')
            : orbState === 'THINKING'
            ? t('Thinking & processing...')
            : orbState === 'SPEAKING'
            ? t('Speaking response gently...')
            : t('Tap the mic or 3D Orb to speak, or tap one of the common prompts below.')}
        </p>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendToAI(p.text)}
              className="btn-glass px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)] hover:text-emerald-300 hover:border-emerald-400/40 active:scale-95 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GEMINI STATUS BANNER ────────────────────────────────────────── */}
      {!hasGeminiKey && (
        <div
          onClick={() => setShowKeyModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-between cursor-pointer hover:border-amber-400 transition shadow-lg gap-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🔑</span>
            <div>
              <div className="font-black text-amber-200">Google Gemini Connect Karen</div>
              <div className="text-[11px] text-amber-300/80 font-normal">अभी ऑफलाइन मोड चल रहा है। 1-क्लिक में फ्री Google Gemini API Key जोड़कर लाइव AI चालू करें।</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowKeyModal(true); }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow cursor-pointer transition active:scale-95"
          >
            Connect Key ⚡
          </button>
        </div>
      )}

      {/* ─── 3. CHAT MESSAGES LOG ─────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-4 max-h-[420px] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center mr-2.5 shrink-0 mt-1 shadow-md">
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[88%] sm:max-w-[78%]">
              <div
                className={`rounded-[20px] px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-lg whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-xs font-bold self-end'
                    : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-xs font-medium'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'ai' && msg.engine && (
                <span className="text-[10px] text-teal-400/70 font-semibold px-2">
                  ✨ {msg.engine}
                </span>
              )}
            </div>
          </div>
        ))}

        {orbState === 'THINKING' && (
          <div className="flex justify-start items-center gap-2 text-xs text-[var(--text-secondary)] font-bold p-3 bg-[var(--bg-surface-secondary)] rounded-2xl w-max">
            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
            <span>Google Gemini is generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── 4. INPUT & VOICE BAR ─────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-2.5 sm:p-4 rounded-[24px] border border-[var(--card-border-inline)] flex items-center gap-2 sm:gap-3">
        {/* Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={orbState === 'THINKING' || orbState === 'SPEAKING'}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition shadow-lg shrink-0 cursor-pointer active:scale-95 ${
            orbState === 'LISTENING'
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
              : 'btn-glow'
          }`}
          title={orbState === 'LISTENING' ? 'Stop Listening' : 'Start Voice Input'}
        >
          {orbState === 'LISTENING' ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            orbState === 'LISTENING'
              ? t('Listening to you... Speak now')
              : t('Ask AABHA (e.g. "What do I have today?", "When is my medicine?")...')
          }
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] text-xs sm:text-sm font-medium focus:border-teal-400 focus:outline-none transition min-w-0"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || orbState === 'THINKING'}
          className="btn-glow w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      {/* ─── 5. GEMINI API KEY SETUP MODAL ─────────────────────────────────── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[var(--bg-surface)] p-6 rounded-[28px] border border-[var(--border)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">Google Gemini API Setup</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Connect Gemini 1.5 Flash for smart responses</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>Gemini API Key</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] text-xs font-mono focus:border-teal-400 focus:outline-none transition"
              />
              <p className="text-[10px] text-[var(--text-secondary)]">
                Your key is stored securely in your browser's LocalStorage and used directly with Google AI Studio.
              </p>
            </div>

            {keyStatusMsg.text && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  keyStatusMsg.type === 'success'
                    ? 'bg-teal-500/20 border border-teal-400/40 text-teal-300'
                    : keyStatusMsg.type === 'error'
                    ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                    : 'bg-white/5 border border-white/10 text-slate-300'
                }`}
              >
                {keyStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                ) : keyStatusMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
                )}
                <span>{keyStatusMsg.text}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="btn-glass w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              {/* Deactivate Button if Key is active */}
              {(hasGeminiKey || apiKeyInput.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    geminiService.setApiKey('');
                    setApiKeyInput('');
                    setHasGeminiKey(false);
                    setKeyStatusMsg({ type: 'error', text: '🛑 Gemini Deactivated! Reverted to Default Engine.' });
                    setTimeout(() => setShowKeyModal(false), 900);
                  }}
                  className="px-3 py-2.5 rounded-2xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 w-full sm:w-auto transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="Deactivate Gemini Key & Revert to Offline Engine"
                >
                  <span>🗑️</span>
                  <span>Deactivate</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (apiKeyInput.trim()) {
                    geminiService.setApiKey(apiKeyInput.trim());
                    setHasGeminiKey(true);
                    setKeyStatusMsg({ type: 'success', text: '✅ Key Saved & Activated!' });
                    setTimeout(() => setShowKeyModal(false), 800);
                  }
                }}
                disabled={!apiKeyInput.trim()}
                className="btn-glass flex-1 w-full py-2.5 rounded-2xl text-xs font-bold text-teal-300 border-teal-400/40 hover:bg-teal-500/20 cursor-pointer disabled:opacity-40"
              >
                ⚡ Save & Activate
              </button>
              <button
                type="button"
                onClick={handleSaveAndTestKey}
                disabled={isTestingKey || !apiKeyInput.trim()}
                className="btn-glow flex-1 w-full py-2.5 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Test & Connect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AabhaChat;
