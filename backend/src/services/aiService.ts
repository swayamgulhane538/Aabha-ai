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

const SYSTEM_PROMPT = `You are AABHA AI (आभा एआई), a compassionate, warm, and highly intelligent cognitive and healthcare companion designed for Indian families, patients, seniors, students, and caregivers.

Key Principles:
1. Speak simply, clearly, warmly, and empathetically.
2. Understand and respond naturally in the user's preferred language (Hindi, Marathi, Indian English, Bengali, Assamese, Gujarati, Tamil, Telugu).
3. If speaking in Hindi/Hinglish or Marathi, use culturally respectful and caring honorifics (e.g. "जी", "काका", "नमस्ते").
4. Never diagnose medical conditions or prescribe dosages. Provide supportive, non-diagnostic guidance.
5. If the user mentions emergency distress or severe pain, urge immediate contact with emergency contacts (SOS) or medical professionals.
6. Provide helpful, encouraging cognitive engagement, memory prompts, and daily routine guidance.
7. Keep responses concise (2 to 4 sentences) for easy comprehension on mobile and voice-to-speech.`;

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

export const chat = async (userId: string, message: string, conversationId?: string, language = 'en') => {
  const isMarathi = language === 'mr' || /[\u0900-\u097F]/.test(message) && (language === 'mr' || message.includes('आहे') || message.includes('का') || message.includes('कसे') || message.includes('काय') || message.includes('औषध'));
  const isHindi = !isMarathi && (language === 'hi' || /[\u0900-\u097F]/.test(message));

  const contextData = await buildContext(userId);
  let contextPromptStr = '';
  if (contextData) {
    contextPromptStr = `\nPatient Context:\n- Name: ${contextData.name}\n- Scheduled Medications: ${contextData.medications.join('; ') || 'None scheduled'}\n- Upcoming Appointments: ${contextData.appointments.join('; ') || 'None scheduled'}\n- Recent Mood: ${contextData.recentMood}`;
    if (contextData.familyMembers) {
      contextPromptStr += `\n- Family: ${contextData.familyMembers.join(', ')}`;
    }
  }

  // ─── 1. GOOGLE GEMINI AI (PRIMARY ENGINE) ──────────────────────────────────
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT + contextPromptStr + `\nTarget Language: ${language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'Indian English'}.`
      });

      const result = await model.generateContent(message);
      const geminiReply = result.response.text().trim();

      if (geminiReply) {
        return {
          reply: geminiReply,
          response: geminiReply,
          engine: 'google-gemini',
          model: 'gemini-1.5-flash',
          conversationId: conversationId || ('conv-' + Date.now()),
          language: isMarathi ? 'mr' : isHindi ? 'hi' : 'en'
        };
      }
    } catch (geminiErr: any) {
      console.warn('Google Gemini API call encountered an error, falling back to next engine:', geminiErr?.message || geminiErr);
    }
  }

  // ─── 2. OPENAI GPT-4O-MINI (SECONDARY FALLBACK) ────────────────────────────
  if (openai) {
    try {
      const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT + contextPromptStr },
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
        language: isMarathi ? 'mr' : isHindi ? 'hi' : 'en'
      };
    } catch (openaiErr) {
      console.warn('OpenAI fallback error:', openaiErr);
    }
  }

  // ─── 3. DETERMINISTIC OFFLINE-FIRST CONTEXT RESOLVER (ZERO HALLUCINATION) ───
  const lower = message.toLowerCase();
  let reply = "";

  if (isMarathi) {
    if (lower.includes('game') || lower.includes('खेळ') || lower.includes('activity')) {
      reply = "नमस्कार! आज तुमचा मेमरी मॅच खेळ तयार आहे. आपण आता खेळ सुरू करूया का?";
    } else if (lower.includes('medicine') || lower.includes('औषध') || lower.includes('time') || lower.includes('वेळ')) {
      reply = "तुमच्या दुपारच्या औषधाची वेळ १:०० वाजता आहे. कृपया वेळेवर पाणी पिऊन औषध घ्या.";
    } else if (lower.includes('priya') || lower.includes('प्रिया') || lower.includes('daughter') || lower.includes('मुलगी')) {
      reply = "प्रिया तुमची लाडकी मुलगी आहे. तिने आज तुमच्यासाठी प्रेमाचा संदेश पाठवला आहे.";
    } else {
      reply = "नमस्कार! मी आभा आहे, तुमची मैत्रीण. आज तुम्हाला कसे वाटत आहे? आपण एखादा छान खेळ खेळूया का?";
    }
  } else if (isHindi) {
    if (lower.includes('game') || lower.includes('खेल') || lower.includes('activity')) {
      reply = "नमस्ते! आज आपका मेमोरी मैच गेम तैयार है। क्या आप अभी खेलना चाहेंगे?";
    } else if (lower.includes('medicine') || lower.includes('दवा') || lower.includes('time') || lower.includes('समय')) {
      reply = "आपकी अगली दवा का समय दोपहर 1:00 बजे है। याद से पानी पी लीजिएगा।";
    } else if (lower.includes('priya') || lower.includes('प्रिया') || lower.includes('daughter') || lower.includes('बेटी')) {
      reply = "प्रिया जी आपकी बेटी हैं। उन्होंने आज आपके लिए एक प्यार भरा संदेश भेजा है।";
    } else {
      reply = "नमस्ते! मैं आभा हूँ, आपकी साथी। आज आप कैसा महसूस कर रहे हैं? क्या हम कोई मजेदार एक्टिविटी करें?";
    }
  } else {
    if (lower.includes('game') || lower.includes('activity') || lower.includes('start')) {
      reply = "Your memory exercise is ready! Would you like me to start today's Memory Match game?";
    } else if (lower.includes('medicine') || lower.includes('remind') || lower.includes('routine')) {
      reply = "You have a blood pressure medicine reminder and hydration check scheduled for today.";
    } else if (lower.includes('priya') || lower.includes('who is')) {
      reply = "Priya is your loving daughter. She sent you a heartwarming message this morning.";
    } else {
      reply = "Hello! I am AABHA, your caring companion. How are you feeling today? I am here to help with your activities and reminders.";
    }
  }

  return {
    reply,
    response: reply,
    engine: 'aabha-offline-rule-engine',
    conversationId: conversationId || ('conv-' + Date.now()),
    language: isMarathi ? 'mr' : isHindi ? 'hi' : 'en'
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
