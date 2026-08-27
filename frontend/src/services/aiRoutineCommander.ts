/**
 * AI Routine & Voice Command Parser Service
 * Understands natural language voice commands in English, Hindi (हिन्दी / Hinglish), and Marathi (मराठी).
 * Intelligently extracts Reminder Title, Scheduled Time, Date, Category, and Voice Message.
 * Answers grounded routine queries (What do I have today?, What is my next reminder?, Pending tasks, Completion %).
 */

export interface ParsedVoiceCommand {
  intent: 'CREATE_REMINDER' | 'QUERY_ROUTINE' | 'QUERY_NEXT' | 'QUERY_PENDING' | 'QUERY_PROGRESS' | 'HELP' | 'CLARIFY';
  title?: string;
  type?: 'MEDICINE' | 'WATER' | 'MEAL' | 'ACTIVITY' | 'APPOINTMENT' | 'FAMILY_CALL';
  time?: string; // HH:MM in 24h
  date?: string; // YYYY-MM-DD
  recurrence?: 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM';
  customDays?: number[];
  voiceMessage?: string;
  voiceLanguage?: 'en' | 'hi' | 'mr';
  needsClarification?: boolean;
  clarificationQuestion?: string;
  partialData?: any;
}

export class AIRoutineCommander {
  /**
   * Parse natural language command spoken by user
   */
  public static parseCommand(
    text: string,
    currentLang: 'en' | 'hi' | 'mr' = 'hi',
    pendingContext?: Partial<ParsedVoiceCommand>
  ): ParsedVoiceCommand {
    const raw = text.toLowerCase().trim();

    // 1. If we were waiting for missing information (like time)
    if (pendingContext && pendingContext.needsClarification) {
      const extractedTime = this.extractTime(raw);
      if (extractedTime) {
        const title = pendingContext.title || 'Reminder';
        const type = pendingContext.type || 'MEDICINE';
        const lang = pendingContext.voiceLanguage || currentLang;
        const voiceMsg = this.generateDefaultVoiceMessage(title, type, lang);

        return {
          intent: 'CREATE_REMINDER',
          title,
          type,
          time: extractedTime,
          date: pendingContext.date || new Date().toISOString().slice(0, 10),
          recurrence: pendingContext.recurrence || 'DAILY',
          voiceMessage: voiceMsg,
          voiceLanguage: lang,
          needsClarification: false
        };
      }
    }

    // 2. Check for Routine Query Intents
    if (
      raw.includes('what do i have today') ||
      raw.includes('aaj kya hai') ||
      raw.includes('aaj ka schedule') ||
      raw.includes('aaj mera routine') ||
      raw.includes('आज काय आहे') ||
      raw.includes('आज का दिन') ||
      raw.includes('todays schedule')
    ) {
      return { intent: 'QUERY_ROUTINE' };
    }

    if (
      raw.includes('next reminder') ||
      raw.includes('agla reminder') ||
      raw.includes('next medicine') ||
      raw.includes('agli dawa') ||
      raw.includes('पुढचे स्मरणपत्र') ||
      raw.includes('पुढील औषध')
    ) {
      return { intent: 'QUERY_NEXT' };
    }

    if (
      raw.includes('pending') ||
      raw.includes('kya baki hai') ||
      raw.includes('kaunsa task baki') ||
      raw.includes('काय बाकी आहे')
    ) {
      return { intent: 'QUERY_PENDING' };
    }

    if (
      raw.includes('progress') ||
      raw.includes('kitna routine complete') ||
      raw.includes('kitna kaam hua') ||
      raw.includes('completion percentage') ||
      raw.includes('किती पूर्ण झाले')
    ) {
      return { intent: 'QUERY_PROGRESS' };
    }

    // 3. Extract Reminder Details from Command
    // Detect Language
    let lang: 'en' | 'hi' | 'mr' = currentLang;
    if (/[\u0900-\u097F]/.test(text)) {
      if (text.includes('आठवण') || text.includes('वेळ') || text.includes('औषध')) {
        lang = 'mr';
      } else {
        lang = 'hi';
      }
    } else if (raw.includes('remind me') || raw.includes('reminder') || raw.includes('at ')) {
      lang = 'en';
    } else if (raw.includes('yaad dilana') || raw.includes('yaad dila') || raw.includes('baje')) {
      lang = 'hi';
    } else if (raw.includes('aathvan') || raw.includes('aathvan karun dya')) {
      lang = 'mr';
    }

    // Extract Type & Title
    let type: 'MEDICINE' | 'WATER' | 'MEAL' | 'ACTIVITY' | 'APPOINTMENT' | 'FAMILY_CALL' = 'MEDICINE';
    let title = 'Medicine';

    if (raw.includes('water') || raw.includes('paani') || raw.includes('pani') || text.includes('पानी') || text.includes('पाणी')) {
      type = 'WATER';
      title = lang === 'mr' ? 'पाणी पिणे (Water)' : lang === 'hi' ? 'पानी पीना (Water)' : 'Drink Water';
    } else if (raw.includes('exercise') || raw.includes('vyayam') || raw.includes('kasrat') || text.includes('कसरत') || text.includes('व्यायाम')) {
      type = 'ACTIVITY';
      title = lang === 'mr' ? 'व्यायाम (Exercise)' : lang === 'hi' ? 'व्यायाम (Exercise)' : 'Daily Exercise';
    } else if (raw.includes('study') || raw.includes('padhai') || raw.includes('abhyas') || text.includes('पढ़ाई') || text.includes('अभ्यास') || raw.includes('class')) {
      type = 'ACTIVITY';
      title = lang === 'mr' ? 'अभ्यास (Study)' : lang === 'hi' ? 'पढ़ाई (Study)' : 'Study & Learning';
    } else if (raw.includes('walk') || raw.includes('tahalna') || raw.includes('ferfatka') || text.includes('टहलना') || text.includes('फेरफटका')) {
      type = 'ACTIVITY';
      title = lang === 'mr' ? 'संध्याकाळचा फेरफटका (Walk)' : lang === 'hi' ? 'शाम की सैर (Walk)' : 'Evening Walk';
    } else if (raw.includes('lunch') || raw.includes('dinner') || raw.includes('breakfast') || raw.includes('khana') || raw.includes('jevan') || text.includes('भोजन') || text.includes('जेवण')) {
      type = 'MEAL';
      title = lang === 'mr' ? 'जेवण (Meal)' : lang === 'hi' ? 'भोजन (Meal)' : 'Healthy Meal';
    } else if (raw.includes('doctor') || raw.includes('hospital') || raw.includes('appointment') || text.includes('डॉक्टर')) {
      type = 'APPOINTMENT';
      title = lang === 'mr' ? 'डॉक्टर भेट (Doctor)' : lang === 'hi' ? 'डॉक्टर अपॉइंटमेंट' : 'Doctor Consultation';
    } else if (raw.includes('call') || raw.includes('phone') || raw.includes('priya') || text.includes('फोन') || text.includes('कॉल')) {
      type = 'FAMILY_CALL';
      title = lang === 'mr' ? 'कुटुंबाशी फोन (Family Call)' : lang === 'hi' ? 'परिवार से बातचीत (Call)' : 'Family Call';
    } else {
      type = 'MEDICINE';
      title = lang === 'mr' ? 'औषध (Medicine)' : lang === 'hi' ? 'दवा (Medicine)' : 'Medicine';
    }

    // Extract Recurrence
    let recurrence: 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM' = 'DAILY';
    let customDays: number[] | undefined;

    if (raw.includes('roz') || raw.includes('daily') || raw.includes('every day') || text.includes('रोज़') || text.includes('दररोज')) {
      recurrence = 'DAILY';
    } else if (raw.includes('every monday') || raw.includes('har somwar') || text.includes('सोमवार')) {
      recurrence = 'CUSTOM';
      customDays = [1];
    } else if (raw.includes('weekday') || raw.includes('somwar se shukrawar')) {
      recurrence = 'WEEKDAYS';
    } else if (raw.includes('kal') || raw.includes('tomorrow') || raw.includes('aaj') || raw.includes('today') || text.includes('कल') || text.includes('उद्या')) {
      recurrence = 'ONCE';
    }

    // Extract Date
    const today = new Date();
    let targetDate = today.toISOString().slice(0, 10);
    if (raw.includes('kal') || raw.includes('tomorrow') || text.includes('कल') || text.includes('उद्या')) {
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      targetDate = tomorrow.toISOString().slice(0, 10);
    }

    // Extract Time
    const time = this.extractTime(raw);

    // If time could NOT be extracted, ask for clarification!
    if (!time) {
      let clarificationQuestion = 'Sure. What time should I remind you?';
      if (lang === 'hi') {
        clarificationQuestion = `ज़रूर! आपको ${title} के लिए किस समय याद दिलाना है?`;
      } else if (lang === 'mr') {
        clarificationQuestion = `नक्कीच! तुम्हाला ${title} साठी किती वाजता आठवण करून देऊ?`;
      }

      return {
        intent: 'CLARIFY',
        title,
        type,
        date: targetDate,
        recurrence,
        voiceLanguage: lang,
        needsClarification: true,
        clarificationQuestion,
        partialData: { title, type, date: targetDate, recurrence, voiceLanguage: lang }
      };
    }

    // Generate Spoken Voice Message
    const voiceMessage = this.generateDefaultVoiceMessage(title, type, lang);

    return {
      intent: 'CREATE_REMINDER',
      title,
      type,
      time,
      date: targetDate,
      recurrence,
      customDays,
      voiceMessage,
      voiceLanguage: lang,
      needsClarification: false
    };
  }

  /**
   * Extract HH:MM 24-hour time from spoken text
   */
  private static extractTime(text: string): string | null {
    // Check for "8 baje", "10 baje", "8:30 baje"
    const bajeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(?:baje|वाजे|बजे|vajta|वाजता)/i);
    if (bajeMatch) {
      let hours = parseInt(bajeMatch[1], 10);
      const mins = bajeMatch[2] ? bajeMatch[2].padStart(2, '0') : '00';

      // Detect PM cues (shaam, raat, dopahar, evening, night, pm)
      const isPM = /shaam|raat|dopahar|dopar|sandhyakal|ratra|pm|evening|night|दोपहर|शाम|रात|दुपार|संध्याकाळ/i.test(text);
      const isAM = /subah|morning|sakal|am|सुबह|सकाळ/i.test(text);

      if (isPM && hours < 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
      return `${String(hours).padStart(2, '0')}:${mins}`;
    }

    // Check for "8:30 AM", "10:00 PM", "8 AM", "7 PM"
    const ampmMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const mins = ampmMatch[2] ? ampmMatch[2].padStart(2, '0') : '00';
      const period = ampmMatch[3].toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${mins}`;
    }

    // Check for simple standalone numbers with morning/evening cues (e.g. "subah 8", "shaam 6", "at 10")
    const cueMatch = text.match(/(?:subah|morning|shaam|evening|raat|night|at|baje)\s*(\d{1,2})(?::(\d{2}))?/i);
    if (cueMatch) {
      let hours = parseInt(cueMatch[1], 10);
      const mins = cueMatch[2] ? cueMatch[2].padStart(2, '0') : '00';
      const isPM = /shaam|raat|dopahar|evening|night|pm/i.test(text);
      if (isPM && hours < 12) hours += 12;
      return `${String(hours).padStart(2, '0')}:${mins}`;
    }

    return null;
  }

  /**
   * Generates natural spoken voice reminder sentence
   */
  public static generateDefaultVoiceMessage(
    title: string,
    type: string,
    lang: 'en' | 'hi' | 'mr'
  ): string {
    if (lang === 'hi') {
      switch (type) {
        case 'MEDICINE': return 'दवा लेने का समय हो गया है। कृपया समय पर दवा ले लीजिए।';
        case 'WATER': return 'एक गिलास ताजा पानी पीने का समय हो गया है।';
        case 'MEAL': return 'भोजन करने का समय हो गया है।';
        case 'ACTIVITY': return `${title} का समय हो गया है। चलिए शुरू करते हैं।`;
        case 'APPOINTMENT': return 'डॉक्टर से परामर्श का समय हो गया है।';
        case 'FAMILY_CALL': return 'परिवार से बातचीत का समय हो गया है।';
        default: return `${title} का समय हो गया है।`;
      }
    } else if (lang === 'mr') {
      switch (type) {
        case 'MEDICINE': return 'औषध घेण्याची वेळ झाली आहे. कृपया औषध घ्या.';
        case 'WATER': return 'एक ग्लास पाणी पिण्याची वेळ झाली आहे.';
        case 'MEAL': return 'जेवणाची वेळ झाली आहे.';
        case 'ACTIVITY': return `${title} करण्याची वेळ झाली आहे.`;
        case 'APPOINTMENT': return 'डॉक्टरांकडे जाण्याची वेळ झाली आहे.';
        case 'FAMILY_CALL': return 'कुटुंबाशी बोलण्याची वेळ झाली आहे.';
        default: return `${title} करण्याची वेळ झाली आहे.`;
      }
    } else {
      switch (type) {
        case 'MEDICINE': return 'It is time to take your medicine with water.';
        case 'WATER': return 'Please drink a glass of water to stay healthy and hydrated.';
        case 'MEAL': return 'It is time for your meal.';
        case 'ACTIVITY': return `Time for ${title}. Let us get started.`;
        case 'APPOINTMENT': return 'You have a scheduled doctor appointment today.';
        case 'FAMILY_CALL': return 'Time for your daily family call.';
        default: return `Reminder: It is time for ${title}.`;
      }
    }
  }

  /**
   * Answers routine queries grounded strictly in the user's stored data
   */
  public static answerRoutineQuery(
    intent: ParsedVoiceCommand['intent'],
    reminders: any[],
    routineItems: any[],
    lang: 'en' | 'hi' | 'mr' = 'hi'
  ): string {
    const activeReminders = reminders.filter(r => r.status === 'ACTIVE' && r.metadata?.enabled !== false);
    const completedReminders = reminders.filter(r => r.status === 'COMPLETED');
    const totalCount = activeReminders.length + completedReminders.length;
    const completionPct = totalCount > 0 ? Math.round((completedReminders.length / totalCount) * 100) : 100;

    // Find next upcoming reminder
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sortedUpcoming = [...activeReminders].sort((a, b) => {
      const timeA = a.scheduledAt ? new Date(a.scheduledAt).getHours() * 60 + new Date(a.scheduledAt).getMinutes() : 0;
      const timeB = b.scheduledAt ? new Date(b.scheduledAt).getHours() * 60 + new Date(b.scheduledAt).getMinutes() : 0;
      return timeA - timeB;
    });

    const nextRem = sortedUpcoming.find(r => {
      if (!r.scheduledAt) return true;
      const d = new Date(r.scheduledAt);
      return d.getHours() * 60 + d.getMinutes() >= currentMinutes;
    }) || sortedUpcoming[0];

    const nextTimeStr = nextRem?.scheduledAt
      ? new Date(nextRem.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    switch (intent) {
      case 'QUERY_ROUTINE': {
        if (totalCount === 0) {
          return lang === 'mr'
            ? 'आज तुमच्या वेळापत्रकात कोणतीही नियोजित कार्ये नाहीत.'
            : lang === 'hi'
            ? 'आज आपके शेड्यूल में कोई लंबित कार्य नहीं है।'
            : 'You have no scheduled tasks for today.';
        }
        return lang === 'mr'
          ? `आज तुमच्याकडे एकूण ${totalCount} कार्ये आहेत, त्यापैकी ${completedReminders.length} पूर्ण झाली आहेत आणि ${activeReminders.length} बाकी आहेत.`
          : lang === 'hi'
          ? `आज आपके शेड्यूल में कुल ${totalCount} कार्य हैं, जिनमें से ${completedReminders.length} पूरे हो चुके हैं और ${activeReminders.length} बाकी हैं।`
          : `You have ${totalCount} tasks scheduled for today. ${completedReminders.length} completed, and ${activeReminders.length} pending.`;
      }

      case 'QUERY_NEXT': {
        if (!nextRem) {
          return lang === 'mr'
            ? 'आजचे सर्व स्मरणपत्र पूर्ण झाले आहेत! अभिनंदन.'
            : lang === 'hi'
            ? 'आज के सभी रिमाइंडर पूरे हो चुके हैं! बहुत बढ़िया।'
            : 'All reminders for today are completed! Great job.';
        }
        return lang === 'mr'
          ? `तुमचे पुढचे स्मरणपत्र ${nextTimeStr} वाजता "${nextRem.title}" आहे.`
          : lang === 'hi'
          ? `आपका अगला रिमाइंडर ${nextTimeStr} पर "${nextRem.title}" है।`
          : `Your next reminder is "${nextRem.title}" at ${nextTimeStr}.`;
      }

      case 'QUERY_PENDING': {
        if (activeReminders.length === 0) {
          return lang === 'mr'
            ? 'सर्व कार्ये पूर्ण झाली आहेत! कोणतेही काम बाकी नाही.'
            : lang === 'hi'
            ? 'बहुत खूब! आपका कोई भी कार्य बकाया नहीं है।'
            : 'Great job! You have no pending tasks right now.';
        }
        const pendingNames = activeReminders.slice(0, 3).map(r => r.title).join(', ');
        return lang === 'mr'
          ? `तुमच्याकडे ${activeReminders.length} कामे बाकी आहेत: ${pendingNames}.`
          : lang === 'hi'
          ? `आपके ${activeReminders.length} कार्य बाकी हैं: ${pendingNames}।`
          : `You have ${activeReminders.length} pending task(s): ${pendingNames}.`;
      }

      case 'QUERY_PROGRESS': {
        return lang === 'mr'
          ? `तुम्ही आजच्या दिनचर्येचे ${completionPct}% कार्य पूर्ण केले आहे (${completedReminders.length}/${totalCount}).`
          : lang === 'hi'
          ? `आपने आज के रूटीन का ${completionPct}% कार्य पूरा कर लिया है (${completedReminders.length}/${totalCount})।`
          : `You have completed ${completionPct}% of your daily routine (${completedReminders.length}/${totalCount} tasks done).`;
      }

      default:
        return lang === 'mr'
          ? 'मी तुमच्या स्मरणपत्रांमध्ये मदत करू शकते.'
          : lang === 'hi'
          ? 'मैं आपके रूटीन और रिमाइंडर में सहायता कर सकती हूँ।'
          : 'I can help you manage your daily routine and reminders.';
    }
  }
}
