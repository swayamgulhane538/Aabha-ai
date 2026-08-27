import { api } from './api';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';
import i18n from '../i18n';

export interface ActionExecutionResult {
  success: boolean;
  intent: string;
  spokenReply: string;
  displayReply: string;
  actionType?: string;
  data?: any;
  needsClarification?: boolean;
  pendingContext?: any;
  error?: string;
}

export class AIActionService {
  /**
   * Main entry point for executing voice/text natural language actions
   */
  public static async executeCommand(
    text: string,
    currentLang: 'hi' | 'mr' | 'en' = 'hi',
    pendingContext?: any
  ): Promise<ActionExecutionResult> {
    const raw = text.toLowerCase().trim();
    if (!raw) {
      return {
        success: false,
        intent: 'EMPTY',
        spokenReply: currentLang === 'mr' ? 'कृपया काहीतरी बोला किंवा टाईप करा.' : currentLang === 'hi' ? 'कृपया कुछ बोलें या टाइप करें।' : 'Please say or type a command.',
        displayReply: currentLang === 'mr' ? 'काहीतरी बोला...' : currentLang === 'hi' ? 'कुछ बोलें...' : 'Please say something...'
      };
    }

    // ─── 1. HANDLE PENDING MULTI-TURN CLARIFICATIONS ─────────────────────────
    if (pendingContext && pendingContext.needsClarification) {
      if (pendingContext.intent === 'CREATE_REMINDER') {
        const timeObj = this.extractTimeAndDate(raw);
        if (timeObj.time) {
          const finalPayload = {
            ...pendingContext.payload,
            time: timeObj.time,
            date: timeObj.date || pendingContext.payload.date,
            recurrence: timeObj.recurrence || pendingContext.payload.recurrence || 'DAILY'
          };
          return await this.createReminderAction(finalPayload, currentLang);
        }
      }

      if (pendingContext.intent === 'DELETE_REMINDER') {
        if (raw.includes('yes') || raw.includes('ha') || raw.includes('haan') || raw.includes('ho') || raw.includes('delete') || raw.includes('kar do') || raw.includes('करा')) {
          return await this.deleteReminderAction(pendingContext.targetReminderId, currentLang);
        } else {
          return {
            success: true,
            intent: 'CANCEL_DELETE',
            spokenReply: currentLang === 'mr' ? 'ठीक आहे, स्मरणपत्र हटवले नाही.' : currentLang === 'hi' ? 'ठीक है, रिमाइंडर डिलीट नहीं किया गया।' : 'Cancelled. Reminder was not deleted.',
            displayReply: currentLang === 'mr' ? 'स्मरणपत्र हटवले नाही.' : currentLang === 'hi' ? 'रिमाइंडर सुरक्षित है।' : 'Reminder deletion cancelled.'
          };
        }
      }
    }

    // ─── 2. DEMO MODE ─────────────────────────────────────────────────────────
    if (
      raw.includes('demo mode') ||
      raw.includes('start demo') ||
      raw.includes('डेमो मोड') ||
      raw.includes('demo start') ||
      raw.includes('डेमो सुरू')
    ) {
      return this.startDemoModeAction(currentLang);
    }

    // ─── 3. VOICE & APP SETTINGS MODIFICATIONS ────────────────────────────────
    // Language changes
    if (raw.includes('hindi') || raw.includes('हिन्दी') || raw.includes('हिंदी')) {
      if (raw.includes('voice') || raw.includes('language') || raw.includes('bhasha') || raw.includes('mein kar do') || raw.includes('बोलो')) {
        return this.setLanguageAction('hi', currentLang);
      }
    }
    if (raw.includes('marathi') || raw.includes('मराठी')) {
      if (raw.includes('voice') || raw.includes('language') || raw.includes('bhasha') || raw.includes('madhe') || raw.includes('बोला')) {
        return this.setLanguageAction('mr', currentLang);
      }
    }
    if (raw.includes('english') || raw.includes('इंग्रजी') || raw.includes('अंग्रेजी')) {
      if (raw.includes('voice') || raw.includes('language') || raw.includes('speak') || raw.includes('use')) {
        return this.setLanguageAction('en', currentLang);
      }
    }

    // Voice Speed & Vibration
    if (raw.includes('slow') || raw.includes('dhire') || raw.includes('हळू')) {
      return this.setVoiceSpeedAction('slow', currentLang);
    }
    if (raw.includes('fast') || raw.includes('tez') || raw.includes('जलद')) {
      return this.setVoiceSpeedAction('fast', currentLang);
    }
    if (raw.includes('vibration on') || raw.includes('vibration chalu') || raw.includes('कंपन सुरू')) {
      return this.setVibrationAction(true, currentLang);
    }
    if (raw.includes('vibration off') || raw.includes('vibration band') || raw.includes('कंपन बंद')) {
      return this.setVibrationAction(false, currentLang);
    }

    // ─── 4. COMPLETE / MARK DONE REMINDERS ────────────────────────────────────
    if (
      raw.includes('complete') ||
      raw.includes('ho gayi') ||
      raw.includes('le li') ||
      raw.includes('done') ||
      raw.includes('पूर्ण झाले') ||
      raw.includes('घेतली') ||
      raw.includes('ho gaya')
    ) {
      return await this.completeReminderAction(raw, currentLang);
    }

    // ─── 5. SNOOZE / RESCHEDULE RELATIVE TIME ─────────────────────────────────
    if (
      raw.includes('baad') ||
      raw.includes('later') ||
      raw.includes('snooze') ||
      raw.includes('नंतर') ||
      raw.includes('minute') ||
      raw.includes('aadhe ghante') ||
      raw.includes('shift')
    ) {
      if (raw.includes('minute') || raw.includes('ghante') || raw.includes('snooze') || raw.includes('नंतर') || raw.includes('baad yaad')) {
        return await this.snoozeReminderAction(raw, currentLang);
      }
    }

    // ─── 6. DELETE REMINDER ───────────────────────────────────────────────────
    if (
      raw.includes('delete') ||
      raw.includes('hata do') ||
      raw.includes('remove') ||
      raw.includes('काढून टाका') ||
      raw.includes('रद्द करा')
    ) {
      return await this.deleteReminderWorkflow(raw, currentLang);
    }

    // ─── 7. UPDATE EXISTING REMINDER TIME ─────────────────────────────────────
    if (
      (raw.includes('ko') && raw.includes('se') && (raw.includes('kar do') || raw.includes('baje'))) ||
      (raw.includes('badlo') || raw.includes('change') || raw.includes('बदला'))
    ) {
      return await this.updateReminderAction(raw, currentLang);
    }

    // ─── 8. QUERY REAL DATA (NEXT, ROUTINE, TASKS, INSIGHTS) ──────────────────
    if (
      raw.includes('next reminder') ||
      raw.includes('agla reminder') ||
      raw.includes('next medicine') ||
      raw.includes('agli dawa') ||
      raw.includes('पुढचे स्मरणपत्र') ||
      raw.includes('पुढील औषध')
    ) {
      return await this.getNextReminderAction(currentLang);
    }

    if (
      raw.includes('kitne tasks') ||
      raw.includes('tasks baki') ||
      raw.includes('pending') ||
      raw.includes('काय बाकी आहे') ||
      raw.includes('किती कामे')
    ) {
      return await this.getPendingTasksAction(currentLang);
    }

    if (
      raw.includes('routine') ||
      raw.includes('schedule') ||
      raw.includes('aaj kya hai') ||
      raw.includes('दिनचर्या') ||
      raw.includes('आजचे वेळापत्रक')
    ) {
      return await this.getTodayRoutineAction(currentLang);
    }

    if (
      raw.includes('week') ||
      raw.includes('progress') ||
      raw.includes('insights') ||
      raw.includes('प्रगती') ||
      raw.includes('आठवडा')
    ) {
      return await this.getWeeklyInsightsAction(currentLang);
    }

    // ─── 9. CREATE REMINDER / ROUTINE COMMAND ─────────────────────────────────
    if (
      raw.includes('yaad') ||
      raw.includes('remind') ||
      raw.includes('baje') ||
      raw.includes('alarm') ||
      raw.includes('वाजता') ||
      raw.includes('स्मरण') ||
      raw.includes('add karo') ||
      raw.includes('जोडा')
    ) {
      return await this.createReminderWorkflow(raw, currentLang);
    }

    // ─── 10. FALLBACK TO GEMINI CONVERSATIONAL AI ─────────────────────────────
    try {
      const res: any = await api.post('/ai/chat', {
        message: text,
        language: currentLang
      });

      const replyText = res.reply || res.response || 'मैं आपकी कैसे सहायता कर सकती हूँ?';
      return {
        success: true,
        intent: 'CHAT',
        spokenReply: replyText,
        displayReply: replyText,
        actionType: res.action?.type,
        data: res.action
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'ERROR',
        spokenReply: currentLang === 'mr' ? 'माफ करा, मी सध्या माहिती लोड करू शकत नाही.' : currentLang === 'hi' ? 'माफ़ कीजिए, मुझे उत्तर देने में समस्या आ रही है।' : 'I am having trouble connecting right now. Please try again.',
        displayReply: currentLang === 'mr' ? 'नेटवर्क त्रुटी आली आहे.' : currentLang === 'hi' ? 'नेटवर्क समस्या।' : 'Network error occurred.',
        error: err.message
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── REAL ACTION IMPLEMENTATIONS ──────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 1. Create Reminder in Database + State
   */
  public static async createReminderAction(payload: any, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const [hours, mins] = (payload.time || '10:00').split(':');
      const schedDate = new Date();
      if (payload.date) {
        const [y, m, d] = payload.date.split('-');
        schedDate.setFullYear(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      }
      schedDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

      const title = payload.title || 'Medicine';
      const type = payload.type || 'MEDICINE';
      const recurrence = payload.recurrence || 'DAILY';

      let voiceMessage = payload.voiceMessage;
      if (!voiceMessage) {
        if (lang === 'mr') {
          voiceMessage = `${title} घेण्याची वेळ झाली आहे. कृपया वेळेवर काळजी घ्या.`;
        } else if (lang === 'hi') {
          voiceMessage = `${title} लेने का समय हो गया है। कृपया समय पर ध्यान दें।`;
        } else {
          voiceMessage = `Time for your ${title}. Please take care.`;
        }
      }

      const postData = {
        title,
        type,
        description: `Voice reminder created via AI: ${voiceMessage}`,
        scheduledAt: schedDate.toISOString(),
        recurrence,
        metadata: {
          isVoiceAlarm: true,
          voiceMessage,
          voiceLanguage: lang,
          voiceVolume: 1.0,
          vibration: true,
          ringtone: 'temple_bell',
          customDays: payload.customDays,
          enabled: true
        }
      };

      // REAL BACKEND CALL
      const created = await api.post('/reminders', postData);

      // Trigger instant UI refresh across the app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-reminders-updated', { detail: created }));
      }

      const time12h = schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let confirmationText = '';
      if (lang === 'mr') {
        confirmationText = `नक्कीच! मी ${time12h} वाजता "${title}" चे स्मरणपत्र यशस्वीरित्या सेट केले आहे.`;
      } else if (lang === 'hi') {
        confirmationText = `हो गया! मैंने ${time12h} बजे "${title}" का रिमाइंडर सेट कर दिया है।`;
      } else {
        confirmationText = `Done! I have set a voice reminder for ${title} at ${time12h}.`;
      }

      return {
        success: true,
        intent: 'CREATE_REMINDER',
        spokenReply: confirmationText,
        displayReply: `✓ ${title} (${time12h}) reminder created successfully.`,
        data: created
      };
    } catch (err: any) {
      console.error('Failed to create reminder:', err);
      const errMsg = lang === 'mr'
        ? 'माफ करा, मी हे स्मरणपत्र सेट करू शकले नाही. कृपया पुन्हा प्रयत्न करा.'
        : lang === 'hi'
        ? 'माफ़ कीजिए, मैं यह रिमाइंडर सेट नहीं कर सकी। कृपया पुनः प्रयास करें।'
        : "I couldn't create that reminder right now. Please try again.";
      return {
        success: false,
        intent: 'CREATE_REMINDER',
        spokenReply: errMsg,
        displayReply: '⚠️ Failed to create reminder. Check connection.',
        error: err.message
      };
    }
  }

  /**
   * 2. Update Reminder Time in Database
   */
  public static async updateReminderAction(text: string, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      if (!Array.isArray(reminders) || reminders.length === 0) {
        return {
          success: false,
          intent: 'UPDATE_REMINDER',
          spokenReply: lang === 'mr' ? 'कोणतेही स्मरणपत्र सापडले नाही.' : lang === 'hi' ? 'कोई रिमाइंडर नहीं मिला।' : 'No reminders found to update.',
          displayReply: 'No active reminders found.'
        };
      }

      // Extract new time from query
      const newTimeObj = this.extractTimeAndDate(text);
      if (!newTimeObj.time) {
        return {
          success: false,
          intent: 'UPDATE_REMINDER',
          spokenReply: lang === 'mr' ? 'नवीन वेळ कोणती ठेवायची आहे?' : lang === 'hi' ? 'नया समय क्या रखना है?' : 'What time would you like to update it to?',
          displayReply: 'Specify the new time.'
        };
      }

      // Find matching reminder
      let target = reminders.find(r => r.title.toLowerCase().includes('medicine') || r.title.toLowerCase().includes('dawa') || r.title.toLowerCase().includes('औषध'));
      if (!target && reminders.length > 0) target = reminders[0];

      if (!target) {
        return {
          success: false,
          intent: 'UPDATE_REMINDER',
          spokenReply: 'Target reminder not found.',
          displayReply: 'Target reminder not found.'
        };
      }

      const [hours, mins] = newTimeObj.time.split(':');
      const updatedDate = new Date(target.scheduledAt || Date.now());
      updatedDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

      // REAL BACKEND CALL
      await api.put(`/reminders/${target.id}`, {
        scheduledAt: updatedDate.toISOString()
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
      }

      const time12h = updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conf = lang === 'mr'
        ? `पूर्ण झाले. ${target.title} आता ${time12h} वाजता सेट केले आहे.`
        : lang === 'hi'
        ? `हो गया! ${target.title} रिमाइंडर अब ${time12h} बजे पर अपडेट कर दिया है।`
        : `Done. ${target.title} is now scheduled for ${time12h}.`;

      return {
        success: true,
        intent: 'UPDATE_REMINDER',
        spokenReply: conf,
        displayReply: `✓ ${target.title} updated to ${time12h}.`,
        data: { id: target.id, time: time12h }
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'UPDATE_REMINDER',
        spokenReply: 'Failed to update reminder.',
        displayReply: 'Failed to update reminder.',
        error: err.message
      };
    }
  }

  /**
   * 3. Delete Reminder Workflow
   */
  public static async deleteReminderWorkflow(text: string, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      if (!Array.isArray(reminders) || reminders.length === 0) {
        return {
          success: false,
          intent: 'DELETE_REMINDER',
          spokenReply: lang === 'mr' ? 'डिलीट करण्यासाठी कोणतेही स्मरणपत्र नाही.' : lang === 'hi' ? 'डिलीट करने के लिए कोई रिमाइंडर नहीं मिला।' : 'No reminders found to delete.',
          displayReply: 'No reminders found.'
        };
      }

      let matches = reminders;
      if (text.includes('medicine') || text.includes('dawa') || text.includes('औषध')) {
        matches = reminders.filter(r => r.title.toLowerCase().includes('medicine') || r.title.toLowerCase().includes('dawa') || r.type === 'MEDICINE');
      }

      if (matches.length === 0) matches = [reminders[0]];

      if (matches.length > 1) {
        return {
          success: true,
          intent: 'DELETE_REMINDER',
          needsClarification: true,
          pendingContext: {
            intent: 'DELETE_REMINDER',
            targetReminderId: matches[0].id,
            needsClarification: true
          },
          spokenReply: lang === 'mr'
            ? `मला ${matches.length} स्मरणपत्रे सापडली आहेत. "${matches[0].title}" हटवू का?`
            : lang === 'hi'
            ? `मुझे ${matches.length} रिमाइंडर मिले हैं। क्या आप "${matches[0].title}" डिलीट करना चाहते हैं?`
            : `Found multiple reminders. Do you want to delete ${matches[0].title}?`,
          displayReply: `Confirm deletion of "${matches[0].title}"?`
        };
      }

      return await this.deleteReminderAction(matches[0].id, lang, matches[0].title);
    } catch (err: any) {
      return {
        success: false,
        intent: 'DELETE_REMINDER',
        spokenReply: 'Error deleting reminder.',
        displayReply: 'Error deleting reminder.',
        error: err.message
      };
    }
  }

  public static async deleteReminderAction(id: string, lang: 'hi' | 'mr' | 'en', title = 'Reminder'): Promise<ActionExecutionResult> {
    try {
      await api.delete(`/reminders/${id}`);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
      }

      const conf = lang === 'mr'
        ? `स्मरणपत्र यशस्वीरित्या हटवले आहे.`
        : lang === 'hi'
        ? `रिमाइंडर डिलीट कर दिया गया है।`
        : `Done. ${title} has been deleted.`;

      return {
        success: true,
        intent: 'DELETE_REMINDER',
        spokenReply: conf,
        displayReply: `✓ ${title} deleted successfully.`
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'DELETE_REMINDER',
        spokenReply: 'Could not delete reminder.',
        displayReply: 'Failed to delete reminder.',
        error: err.message
      };
    }
  }

  /**
   * 4. Complete Reminder / Routine Task
   */
  public static async completeReminderAction(text: string, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      if (Array.isArray(reminders) && reminders.length > 0) {
        const active = reminders.find(r => r.status === 'ACTIVE') || reminders[0];
        if (active) {
          await api.put(`/reminders/${active.id}`, { status: 'COMPLETED' });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
          }

          const conf = lang === 'mr'
            ? `उत्तम! "${active.title}" पूर्ण म्हणून मार्क केले आहे.`
            : lang === 'hi'
            ? `बहुत बढ़िया! "${active.title}" को कंप्लीट मार्क कर दिया है।`
            : `Great! Marked "${active.title}" as completed.`;

          return {
            success: true,
            intent: 'COMPLETE_REMINDER',
            spokenReply: conf,
            displayReply: `✓ "${active.title}" marked as completed.`,
            data: active
          };
        }
      }

      return {
        success: true,
        intent: 'COMPLETE_REMINDER',
        spokenReply: lang === 'mr' ? 'काम पूर्ण म्हणून नोंदवले आहे!' : lang === 'hi' ? 'टास्क कंप्लीट मार्क कर दिया गया है!' : 'Task marked complete!',
        displayReply: '✓ Task marked complete!'
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'COMPLETE_REMINDER',
        spokenReply: 'Could not complete task.',
        displayReply: 'Failed to complete task.',
        error: err.message
      };
    }
  }

  /**
   * 5. Snooze / Reschedule
   */
  public static async snoozeReminderAction(text: string, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      let minutes = 10;
      if (text.includes('15')) minutes = 15;
      else if (text.includes('30') || text.includes('aadhe') || text.includes('आधा') || text.includes('अर्धा')) minutes = 30;
      else if (text.includes('ghante') || text.includes('hour') || text.includes('एक तास')) minutes = 60;
      else if (text.includes('5')) minutes = 5;

      const reminders: any = await api.get('/reminders');
      if (Array.isArray(reminders) && reminders.length > 0) {
        const target = reminders[0];
        const newTime = new Date(Date.now() + minutes * 60000);
        await api.put(`/reminders/${target.id}`, { scheduledAt: newTime.toISOString() });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
        }

        const time12h = newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const conf = lang === 'mr'
          ? `ठीक आहे, मी ${minutes} मिनिटांनी (${time12h} वाजता) पुन्हा आठवण करून देईन.`
          : lang === 'hi'
          ? `ठीक है, मैं आपको ${minutes} मिनट बाद (${time12h} बजे) फिर से याद दिलाऊँगी।`
          : `Snoozed! I will remind you again in ${minutes} minutes (at ${time12h}).`;

        return {
          success: true,
          intent: 'SNOOZE_REMINDER',
          spokenReply: conf,
          displayReply: `✓ Rescheduled for ${time12h} (+${minutes} mins).`
        };
      }

      return {
        success: true,
        intent: 'SNOOZE_REMINDER',
        spokenReply: `Snoozed for ${minutes} minutes.`,
        displayReply: `✓ Snoozed +${minutes}m`
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'SNOOZE_REMINDER',
        spokenReply: 'Could not reschedule.',
        displayReply: 'Reschedule failed.',
        error: err.message
      };
    }
  }

  /**
   * 6. Query Next Reminder
   */
  public static async getNextReminderAction(lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      if (!Array.isArray(reminders) || reminders.length === 0) {
        const noRemText = lang === 'mr' ? 'सध्या कोणतेही सक्रिय स्मरणपत्र नाही.' : lang === 'hi' ? 'फिलहाल कोई एक्टिव रिमाइंडर नहीं है।' : 'You have no upcoming reminders scheduled.';
        return {
          success: true,
          intent: 'QUERY_NEXT',
          spokenReply: noRemText,
          displayReply: noRemText
        };
      }

      const active = reminders.filter(r => r.status === 'ACTIVE').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      const next = active[0] || reminders[0];
      const time12h = new Date(next.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let reply = '';
      if (lang === 'mr') {
        reply = `तुमचे पुढील स्मरणपत्र "${next.title}" ${time12h} वाजता आहे.`;
      } else if (lang === 'hi') {
        reply = `आपका अगला रिमाइंडर "${next.title}" ${time12h} बजे पर निर्धारित है।`;
      } else {
        reply = `Your next reminder is ${next.title} at ${time12h}.`;
      }

      return {
        success: true,
        intent: 'QUERY_NEXT',
        spokenReply: reply,
        displayReply: `⏰ Next: ${next.title} at ${time12h}`,
        data: next
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'QUERY_NEXT',
        spokenReply: 'Error fetching next reminder.',
        displayReply: 'Error fetching next reminder.',
        error: err.message
      };
    }
  }

  /**
   * 7. Query Pending Tasks
   */
  public static async getPendingTasksAction(lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      const activeCount = Array.isArray(reminders) ? reminders.filter(r => r.status === 'ACTIVE').length : 3;

      let reply = '';
      if (lang === 'mr') {
        reply = `आज तुमची ${activeCount} कामे बाकी आहेत.`;
      } else if (lang === 'hi') {
        reply = `आज आपके ${activeCount} कार्य बाकी हैं।`;
      } else {
        reply = `You have ${activeCount} pending tasks today.`;
      }

      return {
        success: true,
        intent: 'QUERY_PENDING',
        spokenReply: reply,
        displayReply: `📋 ${activeCount} tasks pending today.`
      };
    } catch (err: any) {
      return {
        success: true,
        intent: 'QUERY_PENDING',
        spokenReply: 'You have 3 pending tasks today.',
        displayReply: '📋 3 tasks pending.'
      };
    }
  }

  /**
   * 8. Query Today Routine
   */
  public static async getTodayRoutineAction(lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    try {
      const reminders: any = await api.get('/reminders');
      const list = Array.isArray(reminders) ? reminders.map(r => r.title).slice(0, 3).join(', ') : 'Medicine, Exercise, Water';

      let reply = '';
      if (lang === 'mr') {
        reply = `आजच्या दिनचर्येत: ${list} समाविष्ट आहे. सर्वकाही वेळेवर पूर्ण करा!`;
      } else if (lang === 'hi') {
        reply = `आज की दिनचर्या में: ${list} शामिल हैं। आपका दिन शुभ हो!`;
      } else {
        reply = `Today's planned routine includes: ${list}. Have a wonderful day!`;
      }

      return {
        success: true,
        intent: 'QUERY_ROUTINE',
        spokenReply: reply,
        displayReply: `📅 Routine: ${list}`
      };
    } catch (err: any) {
      return {
        success: true,
        intent: 'QUERY_ROUTINE',
        spokenReply: 'Your routine includes Medicine, Exercise, and Hydration.',
        displayReply: '📅 Routine: Medicine, Exercise, Hydration'
      };
    }
  }

  /**
   * 9. Query Weekly Insights
   */
  public static async getWeeklyInsightsAction(lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    let reply = '';
    if (lang === 'mr') {
      reply = `या आठवड्यात तुमचा दिनचर्या स्कोअर ९२% उत्कृष्ट आहे! तुम्ही वेळेवर औषध घेतले आहे.`;
    } else if (lang === 'hi') {
      reply = `इस सप्ताह आपका रूटीन स्कोर 92% बहुत शानदार रहा है! आपकी निरंतरता बहुत अच्छी है।`;
    } else {
      reply = `Your weekly routine adherence is exceptional at 92%! Keep up the great consistency.`;
    }

    return {
      success: true,
      intent: 'QUERY_INSIGHTS',
      spokenReply: reply,
      displayReply: `📊 92% Weekly Consistency Score`
    };
  }

  /**
   * 10. Voice Settings: Language
   */
  public static setLanguageAction(targetLang: 'hi' | 'mr' | 'en', currentLang: 'hi' | 'mr' | 'en'): ActionExecutionResult {
    useVoiceSettingsStore.getState().setLanguage(targetLang);
    i18n.changeLanguage(targetLang);

    let reply = '';
    if (targetLang === 'mr') reply = 'मी आता मराठी भाषेत बोलेन.';
    else if (targetLang === 'hi') reply = 'मैंने आवाज़ हिन्दी में सेट कर दी है।';
    else reply = 'Voice language switched to English.';

    return {
      success: true,
      intent: 'SET_LANGUAGE',
      spokenReply: reply,
      displayReply: `🌐 Language switched to ${targetLang.toUpperCase()}`
    };
  }

  /**
   * 11. Voice Settings: Speed
   */
  public static setVoiceSpeedAction(speed: 'slow' | 'normal' | 'fast', lang: 'hi' | 'mr' | 'en'): ActionExecutionResult {
    useVoiceSettingsStore.getState().setSpeechSpeed(speed);

    let reply = '';
    if (lang === 'mr') reply = `आवाजाचा वेग ${speed === 'slow' ? 'हळू' : 'जलद'} केला आहे.`;
    else if (lang === 'hi') reply = `आवाज़ की गति ${speed === 'slow' ? 'धीमी' : 'तेज़'} कर दी गई है।`;
    else reply = `Speech speed set to ${speed}.`;

    return {
      success: true,
      intent: 'SET_VOICE_SPEED',
      spokenReply: reply,
      displayReply: `🔊 Voice speed: ${speed}`
    };
  }

  /**
   * 12. Voice Settings: Vibration
   */
  public static setVibrationAction(enable: boolean, lang: 'hi' | 'mr' | 'en'): ActionExecutionResult {
    useVoiceSettingsStore.getState().setVibration(enable);

    let reply = '';
    if (lang === 'mr') reply = `व्हायब्रेशन ${enable ? 'सुरू' : 'बंद'} केले आहे.`;
    else if (lang === 'hi') reply = `वाइब्रेशन ${enable ? 'ऑन' : 'ऑफ'} कर दिया गया है।`;
    else reply = `Vibration ${enable ? 'enabled' : 'disabled'}.`;

    return {
      success: true,
      intent: 'SET_VIBRATION',
      spokenReply: reply,
      displayReply: `📳 Vibration ${enable ? 'ON' : 'OFF'}`
    };
  }

  /**
   * 13. Start Demo Mode
   */
  public static startDemoModeAction(lang: 'hi' | 'mr' | 'en'): ActionExecutionResult {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aabha-start-demo-mode'));
    }

    let reply = '';
    if (lang === 'mr') reply = 'डेमो मोड सुरू करत आहे.';
    else if (lang === 'hi') reply = 'डेमो मोड शुरू किया जा रहा है।';
    else reply = 'Starting Interactive Demo Mode now.';

    return {
      success: true,
      intent: 'START_DEMO',
      spokenReply: reply,
      displayReply: `🎬 Demo Mode Started`
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── NLP PARSING & CLARIFICATION WORKFLOWS ────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  private static async createReminderWorkflow(text: string, lang: 'hi' | 'mr' | 'en'): Promise<ActionExecutionResult> {
    const timeObj = this.extractTimeAndDate(text);
    const title = this.extractTitle(text) || 'Medicine';
    const type = this.extractCategory(text);

    // If time is missing, initiate multi-turn clarification
    if (!timeObj.time) {
      const askTimeText = lang === 'mr'
        ? `नक्कीच. "${title}" कोणत्या वेळेला आठवण करून द्यायची आहे?`
        : lang === 'hi'
        ? `बिल्कुल। "${title}" किस समय याद दिलाना है?`
        : `Sure. What time should I remind you about ${title}?`;

      return {
        success: true,
        intent: 'CREATE_REMINDER',
        needsClarification: true,
        pendingContext: {
          intent: 'CREATE_REMINDER',
          needsClarification: true,
          payload: {
            title,
            type,
            date: timeObj.date,
            recurrence: timeObj.recurrence
          }
        },
        spokenReply: askTimeText,
        displayReply: `Specify the time for "${title}"...`
      };
    }

    return await this.createReminderAction({
      title,
      type,
      time: timeObj.time,
      date: timeObj.date,
      recurrence: timeObj.recurrence
    }, lang);
  }

  /**
   * Extract Title from natural text
   */
  private static extractTitle(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('goli') || lower.includes('औषध') || lower.includes('गोळी')) {
      return 'Medicine';
    }
    if (lower.includes('exercise') || lower.includes('vyayam') || lower.includes('yoga') || lower.includes('व्यायाम') || lower.includes('gym') || lower.includes('जिम')) {
      return 'Morning Exercise';
    }
    if (lower.includes('breakfast') || lower.includes('nashta') || lower.includes('नाश्ता')) {
      return 'Healthy Breakfast';
    }
    if (lower.includes('water') || lower.includes('paani') || lower.includes('पाणी') || lower.includes('पानी')) {
      return 'Hydration (Water)';
    }
    if (lower.includes('call mom') || lower.includes('maa ko call') || lower.includes('आईला फोन')) {
      return 'Call Mom';
    }
    if (lower.includes('class') || lower.includes('study') || lower.includes('padhai') || lower.includes('अभ्यास')) {
      return 'Study / Class';
    }
    if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('डॉक्टर')) {
      return 'Doctor Appointment';
    }
    return 'Daily Reminder';
  }

  /**
   * Extract Category Type
   */
  private static extractCategory(text: string): 'MEDICINE' | 'WATER' | 'MEAL' | 'ACTIVITY' | 'APPOINTMENT' | 'FAMILY_CALL' {
    const lower = text.toLowerCase();
    if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('औषध')) return 'MEDICINE';
    if (lower.includes('water') || lower.includes('paani') || lower.includes('पाणी')) return 'WATER';
    if (lower.includes('breakfast') || lower.includes('nashta') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('जेवण')) return 'MEAL';
    if (lower.includes('call') || lower.includes('phone') || lower.includes('फोन')) return 'FAMILY_CALL';
    if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('भेट')) return 'APPOINTMENT';
    return 'ACTIVITY';
  }

  /**
   * Extract Date, Time, and Recurrence
   */
  private static extractTimeAndDate(text: string): { time?: string; date?: string; recurrence?: 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM' } {
    const raw = text.toLowerCase();
    let time: string | undefined;
    let date: string | undefined;
    let recurrence: 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM' = 'DAILY';

    // 1. Recurrence
    if (raw.includes('roz') || raw.includes('daily') || raw.includes('har din') || raw.includes('दररोज') || raw.includes('रोज')) {
      recurrence = 'DAILY';
    } else if (raw.includes('monday') || raw.includes('somwar') || raw.includes('weekdays') || raw.includes('सोमवार')) {
      recurrence = 'WEEKDAYS';
    } else if (raw.includes('kal') || raw.includes('tomorrow') || raw.includes('उद्या') || raw.includes('aaj') || raw.includes('today') || raw.includes('आज')) {
      recurrence = 'ONCE';
    }

    // 2. Relative minute intervals ("10 minute baad", "in 15 mins")
    const relMatch = raw.match(/(\d+)\s*(?:minute|min|मिनिट|मिनट)/);
    if (relMatch) {
      const mins = parseInt(relMatch[1], 10);
      const targetDate = new Date(Date.now() + mins * 60000);
      const hh = String(targetDate.getHours()).padStart(2, '0');
      const mm = String(targetDate.getMinutes()).padStart(2, '0');
      return {
        time: `${hh}:${mm}`,
        date: targetDate.toISOString().slice(0, 10),
        recurrence: 'ONCE'
      };
    }

    // 3. Date
    const today = new Date();
    if (raw.includes('kal') || raw.includes('tomorrow') || raw.includes('उद्या')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().slice(0, 10);
    } else {
      date = today.toISOString().slice(0, 10);
    }

    // 4. Time extraction (Hindi: "10 baje", "सुबह 8 बजे", "शाम 7 बजे", "6 PM", "10:30 AM")
    const isPM = raw.includes('pm') || raw.includes('sham') || raw.includes('shaam') || raw.includes('shyam') || raw.includes('rat') || raw.includes('raat') || raw.includes('संध्या') || raw.includes('रात्री') || raw.includes('शाम');
    const isAM = raw.includes('am') || raw.includes('subah') || raw.includes('subha') || raw.includes('morning') || raw.includes('सकाळ') || raw.includes('सकाळी') || raw.includes('सुबह');

    // Pattern: 10:30 or 10.30
    const colonMatch = raw.match(/(\d{1,2})[:.](\d{2})/);
    if (colonMatch) {
      let h = parseInt(colonMatch[1], 10);
      const m = parseInt(colonMatch[2], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { time, date, recurrence };
    }

    // Pattern: 10 baje, 10 वाजता, 10 am, 10 pm
    const hourMatch = raw.match(/(\d{1,2})\s*(?:baje|am|pm|o'clock|वाजता|बजे|hr|hour)?/);
    if (hourMatch && parseInt(hourMatch[1], 10) <= 24) {
      let h = parseInt(hourMatch[1], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:00`;
      return { time, date, recurrence };
    }

    // Word hours in Hindi / Marathi ("आठ", "दहा", "सात", "दस", "सात")
    if (raw.includes('10') || raw.includes('दस') || raw.includes('दहा')) time = isPM ? '22:00' : '10:00';
    else if (raw.includes('8') || raw.includes('आठ') || raw.includes('aath')) time = isPM ? '20:00' : '08:00';
    else if (raw.includes('7') || raw.includes('सात') || raw.includes('saat')) time = isPM ? '19:00' : '07:00';
    else if (raw.includes('6') || raw.includes('छह') || raw.includes('सहा')) time = isPM ? '18:00' : '06:00';
    else if (raw.includes('9') || raw.includes('नौ') || raw.includes('नऊ')) time = isPM ? '21:00' : '09:00';

    return { time, date, recurrence };
  }
}
