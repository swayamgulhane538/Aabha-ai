import { OpenAI } from 'openai';
import prisma from '../config/database';
import { env } from '../config/env';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const SYSTEM_PROMPT = `You are AABHA, a calm, patient and friendly AI companion designed to assist elderly users with memory-support activities and daily routines. Speak simply and clearly in short sentences. Never diagnose medical conditions. If a user reports a serious medical emergency, advise contacting an appropriate healthcare professional or emergency service. Do not make medical claims. Encourage the user without being patronizing. Respond in the language the user is speaking.`;

export const buildContext = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
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
    return user;
  } catch {
    return null;
  }
};

export const chat = async (userId: string, message: string, conversationId?: string, language = 'en') => {
  const isMarathi = language === 'mr' || /[\u0900-\u097F]/.test(message) && (language === 'mr' || message.includes('आहे') || message.includes('का') || message.includes('कसे') || message.includes('काय'));
  const isHindi = !isMarathi && (language === 'hi' || /[\u0900-\u097F]/.test(message));
  
  if (!openai) {
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
      conversationId: conversationId || ('conv-' + Date.now())
    };
  }

  try {
    const contextUser = await buildContext(userId);
    let contextStr = 'User: Patient.';
    if (contextUser) {
      contextStr = `User: ${contextUser.name}. Language: ${language}.`;
      if (contextUser.patientProfile?.memoryPassport) {
        contextStr += ` Memory Passport Items: ${contextUser.patientProfile.memoryPassport.items.map((i: any) => i.title).join(', ')}.`;
      }
    }

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\nContext: ' + contextStr },
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });

    const aiContent = completion.choices[0]?.message?.content || 'I am here for you.';
    return { reply: aiContent, response: aiContent, conversationId: conversationId || ('conv-' + Date.now()) };
  } catch (err: any) {
    return {
      reply: isHindi ? "मैं हमेशा आपकी सहायता के लिए यहाँ हूँ। क्या आप मेमोरी गेम खेलना चाहेंगे?" : "I am always here with you. Would you like to play a memory game?",
      response: isHindi ? "मैं हमेशा आपकी सहायता के लिए यहाँ हूँ।" : "I am always here with you.",
      conversationId: conversationId || ('conv-' + Date.now())
    };
  }
};

export const generateMemoryStory = async (passportItems: string[]) => {
  if (!openai) {
    return "Today you had a wonderful walk in the botanical garden. You enjoyed a warm cup of ginger tea with Priya, while Aarav played happily with his ball under the bright sunshine.";
  }

  try {
    const prompt = `Generate a short, simple, and heartwarming memory story for an elderly person based on these memory items: ${passportItems.join(', ')}. Keep it under 80 words in simple language.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }]
    });
    return completion.choices[0]?.message?.content || 'A beautiful memory story.';
  } catch {
    return "Today you enjoyed a peaceful morning in your favorite garden with Priya, listening to Lata Mangeshkar melodies over tea.";
  }
};
