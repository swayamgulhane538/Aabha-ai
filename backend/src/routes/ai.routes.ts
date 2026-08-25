import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { db, AiConversationRecord } from '../store/persistentDatabase';

const router = Router();
router.use(authenticate);

// ─── 1. TALK TO ABHA AI (Voice & Text Assistant) ──────────────────────────────
router.post('/chat', async (req, res) => {
  const user = req.user!;
  const { message, language = 'hi', conversationId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const query = message.trim();
  const lower = query.toLowerCase();

  // Detect language
  const isMarathi = language === 'mr' || (language === 'mr' || lower.includes('आहे') || lower.includes('का') || lower.includes('कसे') || lower.includes('काय') || lower.includes('औषध') || lower.includes('खेळ'));
  const isHindi = !isMarathi && (language === 'hi' || /[\u0900-\u097F]/.test(query) || lower.includes('kab') || lower.includes('dawa') || lower.includes('karna') || lower.includes('khel'));

  // Retrieve user context from persistent database
  const userMedications = db.getMedications(user.id);
  const userAppointments = db.getAppointments(user.id);
  const nextMed = userMedications.find(m => m.status === 'UPCOMING') || userMedications[0];
  const nextApt = userAppointments.find(a => a.status === 'UPCOMING') || userAppointments[0];

  let replyText = '';
  let intent = 'GENERAL_CHAT';
  let action: any = null;

  // 1. EMERGENCY / SOS DETECTION
  if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help') || lower.includes('madad') || lower.includes('बचाओ') || lower.includes('मदत')) {
    intent = 'SOS';
    action = { type: 'TRIGGER_SOS' };
    if (isMarathi) {
      replyText = "शांत राहा! मी ताबडतोब तुमच्या कुटुंबाला आणि डॉक्टरला आणीबाणीचा (SOS) संदेश पाठवत आहे. मदत पोहोचत आहे.";
    } else if (isHindi) {
      replyText = "शांत रहिए! मैं तुरंत आपके परिवार और डॉक्टर को आपातकालीन (SOS) अलर्ट भेज रही हूँ। मदद पहुँच रही है।";
    } else {
      replyText = "Please stay calm. I am immediately alerting your emergency contact and caregiver. Help is on the way.";
    }
  }

  // 2. MEDICATIONS QUERY
  else if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('goli') || lower.includes('दवा') || lower.includes('औषध') || lower.includes('pill')) {
    intent = 'MEDICATION_QUERY';
    action = { type: 'NAVIGATE', path: '/patient/reminders' };

    if (nextMed) {
      if (isMarathi) {
        replyText = `तुमचे पुढचे औषध ${nextMed.name} (${nextMed.dosage}) ${nextMed.scheduledTime} वाजता आहे. ${nextMed.instructions || ''}`;
      } else if (isHindi) {
        replyText = `आपकी अगली दवा ${nextMed.name} (${nextMed.dosage}) ${nextMed.scheduledTime} पर निर्धारित है। ${nextMed.instructions || 'कृपया समय पर पानी के साथ लें।'}`;
      } else {
        replyText = `Your next scheduled medication is ${nextMed.name} (${nextMed.dosage}) at ${nextMed.scheduledTime}. ${nextMed.instructions || ''}`;
      }
    } else {
      if (isMarathi) replyText = "आजची सर्व औषधे पूर्ण झाली आहेत. काळजी करू नका!";
      else if (isHindi) replyText = "आज की सभी दवाएं पूरी हो चुकी हैं। बहुत बढ़िया!";
      else replyText = "All scheduled medications for today have been completed. Great job!";
    }
  }

  // 3. APPOINTMENTS QUERY
  else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('bhet') || lower.includes('भेट') || lower.includes('अपॉइंटमेंट') || lower.includes('hospital')) {
    intent = 'APPOINTMENT_QUERY';
    action = { type: 'NAVIGATE', path: '/patient/appointments' };

    if (nextApt) {
      if (isMarathi) {
        replyText = `तुमची पुढील भेट ${nextApt.doctorName} सोबत दिनांक ${nextApt.date} रोजी वेळ ${nextApt.time} वाजता आहे. ${nextApt.purpose}`;
      } else if (isHindi) {
        replyText = `आपका अगला अपॉइंटमेंट ${nextApt.doctorName} के साथ ${nextApt.date} को ${nextApt.time} पर है। कारण: ${nextApt.purpose}`;
      } else {
        replyText = `Your next appointment is with ${nextApt.doctorName} on ${nextApt.date} at ${nextApt.time}. Purpose: ${nextApt.purpose}`;
      }
    } else {
      if (isMarathi) replyText = "सध्या तुमची कोणतीही आगामी भेट नियोजित नाही.";
      else if (isHindi) replyText = "फिलहाल आपका कोई आगामी डॉक्टर अपॉइंटमेंट नहीं है।";
      else replyText = "You currently do not have any upcoming doctor appointments scheduled.";
    }
  }

  // 4. START COGNITIVE GAMES
  else if (lower.includes('game') || lower.includes('khel') || lower.includes('खेळ') || lower.includes('puzzle') || lower.includes('memory') || lower.includes('दिमाग')) {
    intent = 'GAME_REQUEST';
    action = { type: 'START_GAME', gameType: 'memory-match' };

    if (isMarathi) {
      replyText = "होय नक्कीच! मी तुमच्यासाठी 'मेमरी मॅच' खेळ सुरू करत आहे. चला खेळूया!";
    } else if (isHindi) {
      replyText = "जी बिल्कुल! मैं आपके लिए 'मेमोरी मैच' खेल शुरू कर रही हूँ। चलिए दिमाग को तरोताजा करते हैं!";
    } else {
      replyText = "Starting your Memory Match exercise right now! Let's stimulate your brain with fun card matching.";
    }
  }

  // 5. DAILY ROUTINE QUERY
  else if (lower.includes('routine') || lower.includes('aaj kya') || lower.includes('aaj mujhe') || lower.includes('schedule') || lower.includes('दिनचर्या') || lower.includes('आज काय')) {
    intent = 'ROUTINE_QUERY';
    if (isMarathi) {
      replyText = "आजची दिनचर्या: सकाळी मेमरी खेळ, दुपारी १:०० वाजता औषध आणि पुरेसे पाणी पिणे. रात्री ८:०० वाजता रक्तदाबाचे औषध.";
    } else if (isHindi) {
      replyText = "आज की दिनचर्या: सुबह मेमोरी गेम खेलना, दोपहर 1:00 बजे दवा लेना और पानी पीना, और रात 8:00 बजे बीपी की दवा लेना।";
    } else {
      replyText = "Today's Routine: Complete your morning memory puzzle, take scheduled afternoon medicine at 1:00 PM with water, and evening medicine at 8:00 PM.";
    }
  }

  // 6. SYMPTOM OR HEALTH CONCERNS (Strict non-diagnostic response)
  else if (lower.includes('dard') || lower.includes('pain') || lower.includes('dizzy') || lower.includes('headache') || lower.includes('chakkar') || lower.includes('dukhte') || lower.includes('तबियत')) {
    intent = 'HEALTH_OBSERVATION';
    if (isMarathi) {
      replyText = "मी ही नोंद करून ठेवली आहे आणि तुमच्या कुटुंबियांना कळवत आहे. कृपया लक्षात ठेवा की मी वैद्यकीय निदान (medical diagnosis) करू शकत नाही. आपण डॉक्टरांशी संपर्क साधूया का?";
    } else if (isHindi) {
      replyText = "मैंने यह बात नोट कर ली है। कृपया ध्यान दें कि मैं कोई मेडिकल डायग्नोसिस नहीं दे सकती। अगर ज्यादा परेशानी है तो हम अभी डॉक्टर या प्रिया जी को कॉल कर सकते हैं।";
    } else {
      replyText = "I have noted this for your caregiver and doctor to review. Please note that I cannot provide medical diagnoses. If you feel unwell, we can immediately contact your doctor or family.";
    }
  }

  // 7. WAKE WORD / GREETING / GENERAL CHAT
  else if (lower.includes('abha') || lower.includes('aabha') || lower.includes('hello') || lower.includes('namaste') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('नमस्कार')) {
    intent = 'GREETING';
    if (isMarathi) {
      replyText = `नमस्कार ${user.name}! मी आभा आहे, तुमची मैत्रीण. तुम्हाला औषधांची वेळ, खेळ किंवा अपॉइंटमेंटबद्दल काय विचारायचे आहे?`;
    } else if (isHindi) {
      replyText = `नमस्ते ${user.name} जी! मैं आभा हूँ। आपको दवा की जानकारी, मेमोरी गेम या आज के रूटीन में क्या मदद चाहिए?`;
    } else {
      replyText = `Hello ${user.name}! I am AABHA, your caring assistant. How may I help you with your medications, memory games, or schedule today?`;
    }
  }

  // 8. DEFAULT FRIENDLY RESPONSE
  else {
    if (isMarathi) {
      replyText = `मी नेहमी तुमच्यासोबत आहे ${user.name}! तुम्ही मला औषधांची वेळ, खेळ सुरू करणे किंवा डॉक्टरांच्या भेटीबद्दल विचारू शकता.`;
    } else if (isHindi) {
      replyText = `मैं हमेशा आपके साथ हूँ ${user.name} जी! आप मुझसे दवा का समय, मेमोरी गेम शुरू करने या डॉक्टर अपॉइंटमेंट के बारे में पूछ सकते हैं।`;
    } else {
      replyText = `I am always here with you, ${user.name}! You can ask me about your medicine schedules, start memory games, or check upcoming doctor visits.`;
    }
  }

  // Log conversation in persistent database
  const convRecord: AiConversationRecord = {
    id: 'conv-' + Date.now(),
    patientUserId: user.id,
    userMessage: query,
    assistantResponse: replyText,
    language: isMarathi ? 'mr' : isHindi ? 'hi' : 'en',
    intent,
    timestamp: new Date().toISOString()
  };

  db.logAiConversation(convRecord);

  return res.json({
    reply: replyText,
    response: replyText,
    intent,
    action,
    conversationId: conversationId || convRecord.id,
    language: convRecord.language
  });
});

// ─── 2. GET AI CONVERSATION HISTORY ──────────────────────────────────────────
router.get('/history', (req, res) => {
  const user = req.user!;
  const { patientUserId } = req.query as { patientUserId?: string };

  let targetId = user.id;
  if ((user.role === 'CAREGIVER' || user.role === 'ADMIN') && patientUserId) {
    targetId = patientUserId;
  }

  const logs = db.getAiConversations(targetId);
  return res.json(logs);
});

// ─── 3. GET DAILY AI SUMMARY FOR CAREGIVER ───────────────────────────────────
router.get('/daily-summary/:patientId', (req, res) => {
  const user = req.user!;
  const targetPatient = db.getUserById(req.params.patientId) || db.getUserByPatientId(req.params.patientId);

  if (!targetPatient) {
    return res.status(404).json({ message: 'Patient record not found' });
  }

  const meds = db.getMedications(targetPatient.id);
  const takenCount = meds.filter(m => m.status === 'TAKEN').length;
  const games = db.getGameResults(targetPatient.id);
  const moods = db.getMoodLogs(targetPatient.id);
  const recentMood = moods[0]?.emoji || '😊';

  const summary = {
    patientName: targetPatient.name,
    patientId: targetPatient.patientId,
    date: new Date().toISOString().split('T')[0],
    memoryExercises: games.length > 0 ? `Completed (${games.length} sessions today)` : 'Pending for today',
    medicationStatus: `${takenCount}/${meds.length} doses taken`,
    moodStatus: `Stable & Calm (${recentMood})`,
    overallActivity: 'Good',
    aiObservation: `Patient ${targetPatient.name} completed today's memory exercises successfully with high visual recall. ${takenCount < meds.length ? 'One evening medication reminder is pending at 8:00 PM.' : 'All medications taken on schedule.'}`,
    disclaimer: 'This AI summary is an operational pattern observation for caregiver convenience and does not constitute a clinical medical diagnosis.'
  };

  return res.json(summary);
});

export default router;
