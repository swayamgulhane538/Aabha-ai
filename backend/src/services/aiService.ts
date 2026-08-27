import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import prisma from '../config/database';
import { env } from '../config/env';
import { db } from '../store/persistentDatabase';

// ─── GOOGLE GEMINI AI INITIALIZATION ─────────────────────────────────────────
const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// OpenAI fallback if configured
const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const LANGUAGE_NAMES: Record<string, { name: string; native: string; script: string }> = {
  hi: { name: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
  mr: { name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
  bn: { name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
  as: { name: 'Assamese', native: 'অসমীয়া', script: 'Assamese/Bengali' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
  ta: { name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
  te: { name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
  ml: { name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  en: { name: 'Indian English', native: 'English', script: 'Latin' }
};

const SYSTEM_PROMPT = `You are AABHA AI (आभा एआई), a compassionate, warm, and highly intelligent cognitive and healthcare companion designed for Indian families, patients, seniors, students, and caregivers.

Key Principles:
1. Speak simply, clearly, warmly, and empathetically.
2. MULTI-LINGUAL FLUENCY: You are fully fluent in major Indian languages (Hindi, Marathi, Bengali, Assamese, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, and Indian English).
3. TARGET LANGUAGE ADAPTATION: Always respond fluently and naturally in the requested Target Language or the language the user speaks to you in, using its proper native script and cultural respect.
4. If speaking in Indian regional languages, use culturally respectful and caring honorifics (e.g. "जी", "काका", "साहेब", "দাদা", "அண்ணா", "గారు").
5. Never diagnose medical conditions or prescribe dosages. Provide supportive, non-diagnostic guidance.
6. If the user mentions emergency distress or severe pain, urge immediate contact with emergency contacts (SOS) or medical professionals.
7. Provide helpful, encouraging cognitive engagement, memory prompts, and daily routine guidance.
8. Keep responses concise (2 to 4 sentences) for easy comprehension on mobile and voice-to-speech.`;

export const buildContext = async (userId: string) => {
  try {
    // 1. Check Persistent Memory DB
    const userMedications = db.getMedications(userId);
    const userAppointments = db.getAppointments(userId);
    const userMoods = db.getMoodLogs(userId);
    const userProfile = db.getUserById(userId);

    const contextData: any = {
      name: userProfile?.name || 'User',
      role: userProfile?.role || 'PATIENT',
      medications: userMedications.map(m => `${m.name} (${m.dosage}) at ${m.scheduledTime} [${m.status}]`),
      appointments: userAppointments.map(a => `${a.doctorName} on ${a.date} at ${a.time} for ${a.purpose}`),
      recentMood: userMoods[0]?.emoji || '😊'
    };

    // 2. Check Prisma if available
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          patientProfile: {
            include: {
              memoryPassport: { include: { items: true, people: true } },
            }
          },
          reminders: { where: { status: 'ACTIVE' }, take: 5 }
        }
      });
      if (dbUser) {
        contextData.name = dbUser.name;
        if (dbUser.patientProfile?.memoryPassport) {
          contextData.memoryItems = dbUser.patientProfile.memoryPassport.items.map((i: any) => i.title);
          contextData.familyMembers = dbUser.patientProfile.memoryPassport.people.map((p: any) => `${p.name} (${p.relationship})`);
        }
      }
    } catch {
      // Ignore prisma fallback
    }

    return contextData;
  } catch {
    return null;
  }
};

export const chat = async (userId: string, message: string, conversationId?: string, language = 'en', customApiKey?: string) => {
  const cleanLang = language?.toLowerCase().split('-')[0] || 'en';
  const langMeta = LANGUAGE_NAMES[cleanLang] || LANGUAGE_NAMES.en;

  const contextData = await buildContext(userId);
  let contextPromptStr = '';
  if (contextData) {
    contextPromptStr = `\nPatient Context:\n- Name: ${contextData.name}\n- Scheduled Medications: ${contextData.medications.join('; ') || 'None scheduled'}\n- Upcoming Appointments: ${contextData.appointments.join('; ') || 'None scheduled'}\n- Recent Mood: ${contextData.recentMood}`;
    if (contextData.familyMembers) {
      contextPromptStr += `\n- Family: ${contextData.familyMembers.join(', ')}`;
    }
  }

  // ─── 1. GOOGLE GEMINI AI (PRIMARY ENGINE WITH MULTI-MODEL FALLBACK) ────────
  const activeGeminiKey = customApiKey?.trim() || geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (activeGeminiKey) {
    const candidateModels = [
      'gemini-3.7-flash',
      'gemini-3.7-thinking',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-thinking-exp',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    const dynamicGenAI = new GoogleGenerativeAI(activeGeminiKey);

    const mandatoryInstruction = `MANDATORY LANGUAGE CONSTRAINT:
You MUST respond 100% EXCLUSIVELY in ${langMeta.name} (${langMeta.native}) using ${langMeta.script} script.
Do NOT use English words or Latin alphabet.
If the language is Hindi, reply strictly in pure Hindi (हिन्दी).
If the language is Marathi, reply strictly in pure Marathi (मराठी).
Keep your response warm, respectful, caring, and concise (2-3 sentences).`;

    for (const modelName of candidateModels) {
      try {
        const model = dynamicGenAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT + contextPromptStr + '\n\n' + mandatoryInstruction
        });

        const promptWithLang = `[Reply strictly in ${langMeta.name} (${langMeta.native})]\n${message}`;
        const result = await model.generateContent(promptWithLang);
        const geminiReply = result.response.text().trim();

        if (geminiReply) {
          return {
            reply: geminiReply,
            response: geminiReply,
            engine: 'google-gemini',
            model: modelName,
            conversationId: conversationId || ('conv-' + Date.now()),
            language: cleanLang
          };
        }
      } catch (geminiErr: any) {
        // Try next candidate model
        console.warn(`Model ${modelName} encountered an error, trying next candidate:`, geminiErr?.message || geminiErr);
      }
    }
  }

  // ─── 2. OPENAI GPT-4O-MINI (SECONDARY FALLBACK) ────────────────────────────
  if (openai) {
    try {
      const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT + contextPromptStr + `\nReply 100% in ${langMeta.name} (${langMeta.native}) using ${langMeta.script} script.` },
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages
      });

      const aiContent = completion.choices[0]?.message?.content?.trim() || 'I am here with you.';
      return {
        reply: aiContent,
        response: aiContent,
        engine: 'openai-gpt4o-mini',
        conversationId: conversationId || ('conv-' + Date.now()),
        language: cleanLang
      };
    } catch (openaiErr) {
      console.warn('OpenAI fallback error:', openaiErr);
    }
  }

  // ─── 3. DETERMINISTIC MULTI-LINGUAL CONVERSATIONAL ENGINE ──────────────────
  const lower = message.toLowerCase();
  const patName = contextData?.name || (cleanLang === 'mr' ? 'काका' : 'जी');
  let reply = "";

  // ─────────────────── MARATHI (मराठी) CONVERSATIONAL ENGINE ──────────────────
  if (cleanLang === 'mr') {
    if (lower.includes('namaskar') || lower.includes('namaste') || lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्कार') || lower.includes('नमस्ते')) {
      reply = `सस्नेह नमस्कार ${patName}! मी आभा आहे, तुमची डिजिटल साथीदार. आज तुमची तब्येत कशी आहे? मी तुम्हाला कशी मदत करू?`;
    } else if (lower.includes('kaise ho') || lower.includes('kasa') || lower.includes('kase') || lower.includes('कशी') || lower.includes('कसे')) {
      reply = `मी अगदी छान आहे ${patName}! तुमच्या सोबत गप्पा मारायला मला खूप आनंद होतो. तुम्ही आज पाणी आणि वेळेवर औषध घेतले का?`;
    } else if (lower.includes('game') || lower.includes('khel') || lower.includes('खेळ') || lower.includes('activity') || lower.includes('सराव') || lower.includes('पझल')) {
      reply = `होय नक्कीच! तुमच्या मेंदूला तजेलदार ठेवण्यासाठी आजचा 'मेमरी मॅच' (कार्ड जुळवा) खेळ तयार आहे. आपण आता खेळ सुरू करूया का?`;
    } else if (lower.includes('medicine') || lower.includes('aushadh') || lower.includes('goli') || lower.includes('औषध') || lower.includes('गोळी') || lower.includes('वेळ')) {
      reply = `तुमच्या दुपारच्या औषधाची वेळ १:०० वाजता आहे (मेमॅन्टाईन १०mg). कृपया वेळेवर एका ग्लासात पाणी घेऊन औषध नक्की घ्या.`;
    } else if (lower.includes('doctor') || lower.includes('bhet') || lower.includes('अपॉइंटमेंट') || lower.includes('डॉक्टर') || lower.includes('रुग्णालय')) {
      reply = `तुमची पुढील डॉक्टरांची भेट डॉ. राजेश शर्मा यांच्यासोबत २८ तारखेला सकाळी ११:०० वाजता आहे. काळजी करू नका, सर्व व्यवस्थित आहे!`;
    } else if (lower.includes('family') || lower.includes('priya') || lower.includes('kutumb') || lower.includes('कुटुंब') || lower.includes('मुलगी') || lower.includes('मुलगा')) {
      reply = `तुमची मुलगी प्रिया आणि संपूर्ण कुटुंब तुमच्यावर खूप प्रेम करते! प्रियाने तुमच्यासाठी आवडती गाणी आणि फोटो मेमरी पासपोर्टमध्ये सेव्ह केले आहेत.`;
    } else if (lower.includes('story') || lower.includes('gosht') || lower.includes('गोष्ट') || lower.includes('कविता') || lower.includes('गाणी')) {
      reply = `एकदा एका शांत बागेत, सकाळच्या कोवळ्या उन्हात वाफाळलेला चहा पिताना जुनी गाणी ऐकण्याचा आनंद काही वेगळाच असतो. आपले कुटुंब आणि आठवणी हीच आपली खरी संपत्ती आहे.`;
    } else if (lower.includes('sad') || lower.includes('bhiti') || lower.includes('एकटे') || lower.includes('भीती') || lower.includes('काळजी') || lower.includes('उदास')) {
      reply = `शांत राहा ${patName}, मुळीच घाबरू नका. मी आणि तुमचे कुटुंब सदैव तुमच्या सोबत आहोत. एक दीर्घ श्वास घ्या आणि छान गाणे ऐकूया.`;
    } else if (lower.includes('score') || lower.includes('health') || lower.includes('आरोग्य') || lower.includes('तब्येत') || lower.includes('प्रगती')) {
      reply = `आज तुमचा कॉग्निटिव्ह स्कोर ९२% इतका उत्तम आहे! तुमचे नियमित खेळ आणि औषधे यामुळे तुमचे आरोग्य खूप छान सुधारत आहे.`;
    } else {
      reply = `नमस्कार ${patName}! मी आभा, तुमची काळजीवाहू मैत्रीण. तुम्ही मला औषधांची वेळ, मेमरी खेळ किंवा कुटुंबाबद्दल कधीही विचारू शकता.`;
    }
  }

  // ─────────────────── HINDI (हिन्दी) CONVERSATIONAL ENGINE ──────────────────
  else if (cleanLang === 'hi') {
    if (lower.includes('namaste') || lower.includes('namaskar') || lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('नमस्कार') || lower.includes('प्रणाम')) {
      reply = `सादर नमस्ते ${patName}! मैं आभा हूँ, आपकी प्यारी डिजिटल साथी। आज आपकी तबीयत कैसी है? मैं आपकी क्या सहायता करूँ?`;
    } else if (lower.includes('kaise') || lower.includes('kaisa') || lower.includes('कैसे') || lower.includes('कैसी') || lower.includes('हाल')) {
      reply = `मैं बहुत अच्छी हूँ ${patName}! आपके साथ बातचीत करके मेरा दिल खुश हो जाता है। क्या आपने आज सुबह की ताज़ा हवा में सैर की?`;
    } else if (lower.includes('game') || lower.includes('khel') || lower.includes('खेल') || lower.includes('activity') || lower.includes('मेमोरी') || lower.includes('पहेली')) {
      reply = `जी बिल्कुल! आपके दिमाग को तरोताजा रखने के लिए आज का 'मेमोरी मैच' खेल तैयार है। चलिए साथ मिलकर कार्ड्स ढूंढते हैं!`;
    } else if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('goli') || lower.includes('दवा') || lower.includes('गोली') || lower.includes('समय')) {
      reply = `आपकी अगली दवा का समय दोपहर 1:00 बजे है (मेमेंटाइन 10mg)। कृपया समय पर एक गिलास गुनगुने पानी के साथ दवा अवश्य लें।`;
    } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('डॉक्टर') || lower.includes('अपॉइंटमेंट') || lower.includes('अस्पताल')) {
      reply = `आपका अगला डॉक्टर अपॉइंटमेंट डॉ. राजेश शर्मा जी के साथ 28 तारीख को सुबह 11:00 बजे निर्धारित है। सब कुछ बहुत बढ़िया चल रहा है!`;
    } else if (lower.includes('family') || lower.includes('priya') || lower.includes('parivar') || lower.includes('परिवार') || lower.includes('बेटी') || lower.includes('बेटा')) {
      reply = `आपकी बेटी प्रिया और पूरा परिवार आपसे बेहद प्यार करता है! प्रिया ने आपके लिए सुंदर पुरानी तस्वीरें और गीत सेव करके रखे हैं।`;
    } else if (lower.includes('story') || lower.includes('kahani') || lower.includes('कहानी') || lower.includes('कविता') || lower.includes('गाना') || lower.includes('चाय')) {
      reply = `एक सुंदर सुबह, बालकनी में गरम चाय की चुस्की और पुराने मधुर गीतों की धुन... जीवन की सबसे खूबसूरत यादें हमारे अपनों के प्यार में बसी होती हैं।`;
    } else if (lower.includes('sad') || lower.includes('dar') || lower.includes('udhas') || lower.includes('अकेला') || lower.includes('डर') || lower.includes('उदास') || lower.includes('चिंता')) {
      reply = `शांत रहिए ${patName} जी, बिल्कुल घबराइए मत। मैं और आपका परिवार हर पल आपके साथ हैं। एक गहरी सांस लीजिए, सब कुछ ठीक है।`;
    } else if (lower.includes('score') || lower.includes('health') || lower.includes('स्वास्थ्य') || lower.includes('सेहत') || lower.includes('प्रगति')) {
      reply = `आज आपका कॉग्निटिव स्कोर 92% बहुत शानदार है! आपके नियमित दिमागी अभ्यास और समय पर दवा से स्वास्थ्य बहुत मजबूत हो रहा है।`;
    } else {
      reply = `नमस्ते ${patName} जी! मैं आभा हूँ। आप मुझसे दवा का समय, मेमोरी गेम्स, डॉक्टर अपॉइंटमेंट या दिनचर्या के बारे में कुछ भी पूछ सकते हैं।`;
    }
  }

  // ─────────────────── BENGALI (বাংলা) ──────────────────────────────────────
  else if (cleanLang === 'bn') {
    if (lower.includes('khel') || lower.includes('খেলা') || lower.includes('game')) {
      reply = `হ্যাঁ নিশ্চয়ই! আপনার মস্তিষ্কের অনুশীলনের জন্য মেমরি ম্যাচ খেলা প্রস্তুত। চলুন শুরু করি!`;
    } else if (lower.includes('medicine') || lower.includes('ঔষধ') || lower.includes('সময়')) {
      reply = `আপনার পরবর্তী ওষুধের সময় দুপুর ১:০০ টায় (মেম্যান্টিন ১০ মিলিগ্রাম)। অনুগ্রহ করে সময়মতো জল দিয়ে ওষুধ নিন।`;
    } else {
      reply = `নমস্কার! আমি আভা, আপনার যত্নশীল ডিজিটাল সঙ্গী। আজ আপনার দিনটি কেমন কাটছে? আমি আপনাকে কীভাবে সাহায্য করতে পারি?`;
    }
  }

  // ─────────────────── GUJARATI (ગુજરાતી) ──────────────────────────────────
  else if (cleanLang === 'gu') {
    if (lower.includes('khel') || lower.includes('રમત') || lower.includes('game')) {
      reply = `હા ચોક્કસ! તમારા મગજને તાજગી આપવા માટે આજની મેમરી મેચ રમત તૈયાર છે. ચાલો શરૂ કરીએ!`;
    } else if (lower.includes('medicine') || lower.includes('દવા') || lower.includes('સમય')) {
      reply = `તમારી આગામી દવાનો સમય બપોરે ૧:૦૦ વાગ્યે છે. કૃપા કરીને સમયસર પાણી સાથે દવા લો.`;
    } else {
      reply = `નમસ્તે! હું આભા છું, તમારી મિત્ર. આજે તમે કેવું અનુભવો છો? દવાઓ કે રમતો માટે હું હાજર છું.`;
    }
  }

  // ─────────────────── TAMIL (தமிழ்) ────────────────────────────────────────
  else if (cleanLang === 'ta') {
    reply = `வணக்கம்! நான் ஆபா. உங்கள் அடுத்த மருந்து மதியம் 1:00 மணிக்கு உள்ளது. இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?`;
  }

  // ─────────────────── TELUGU (తెలుగు) ──────────────────────────────────────
  else if (cleanLang === 'te') {
    reply = `నమస్కారం! నేను ఆభా. మీ తదుపరి మందు సమయం మధ్యాహ్నం 1:00 గంటలకు. ఈరోజు మీకు నేను ఎలా సహాయపడగలను?`;
  }

  // ─────────────────── KANNADA (ಕನ್ನಡ) ──────────────────────────────────────
  else if (cleanLang === 'kn') {
    reply = `ನಮಸ್ಕಾರ! ನಾನು ಆಭಾ. ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿ ಮಧ್ಯಾಹ್ನ 1:00 ಗಂಟೆಗೆ ಇದೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
  }

  // ─────────────────── PUNJABI (ਪੰਜਾਬੀ) ────────────────────────────────────
  else if (cleanLang === 'pa') {
    reply = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਆਭਾ ਹਾਂ। ਤੁਹਾਡੀ ਅਗਲੀ ਦਵਾਈ ਦੁਪਹਿਰ 1:00 ਵਜੇ ਹੈ। ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?`;
  }

  // ─────────────────── ENGLISH ─────────────────────────────────────────────
  else {
    if (lower.includes('game') || lower.includes('activity') || lower.includes('start')) {
      reply = "Your memory exercise is ready! Would you like me to start today's Memory Match game?";
    } else if (lower.includes('medicine') || lower.includes('remind') || lower.includes('routine')) {
      reply = "Your next scheduled medication is Memantine (10mg) at 1:00 PM with a glass of water.";
    } else {
      reply = `Hello ${patName}! I am AABHA, your caring cognitive companion. How are you feeling today? I am right here with you.`;
    }
  }

  return {
    reply,
    response: reply,
    engine: 'aabha-intelligent-conversational-engine',
    conversationId: conversationId || ('conv-' + Date.now()),
    language: cleanLang
  };
};

export const generateMemoryStory = async (passportItems: string[]) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a short, simple, and heartwarming memory story for an elderly person based on these memory items: ${passportItems.join(', ')}. Keep it under 80 words in simple, soothing language.`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch {
      // Fallback
    }
  }

  if (openai) {
    try {
      const prompt = `Generate a short, simple, and heartwarming memory story for an elderly person based on these memory items: ${passportItems.join(', ')}. Keep it under 80 words in simple language.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }]
      });
      return completion.choices[0]?.message?.content || 'A beautiful memory story.';
    } catch {
      // Fallback
    }
  }

  return "Today you enjoyed a peaceful morning in your favorite garden with Priya, listening to classical melodies over tea.";
};

export default {
  chat,
  buildContext,
  generateMemoryStory
};
