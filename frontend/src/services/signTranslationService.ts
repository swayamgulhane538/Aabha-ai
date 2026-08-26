/**
 * SignBridge – Indian Sign Language (ISL) Translation & Vocabulary Service
 * 
 * Complete Medical ISL Vocabulary for Two-Way Clinical Communication:
 * - Patient -> Doctor Vocabulary (21 Comprehensive Signs)
 * - Doctor -> Patient Vocabulary (16 Clinical Signs)
 * - Multilingual translation mappings (English, Hindi, Marathi, Bengali, Assamese)
 */

export interface ISLSign {
  id: string;
  role: 'PATIENT' | 'DOCTOR';
  label: string;
  hindi: string;
  marathi: string;
  bengali: string;
  assamese: string;
  category: 'SYMPTOM' | 'URGENCY' | 'RESPONSE' | 'INSTRUCTION' | 'QUESTION' | 'NEED' | 'GENERAL';
  isEmergency?: boolean;
  handPattern: 'UP_DOWN' | 'CIRCULAR' | 'SIDE_TO_SIDE' | 'HOLD_STATIC' | 'CROSS_CHEST' | 'TOUCH_HEAD' | 'TOUCH_STOMACH';
  icon: string;
  description: string;
}

// ─── 1. PATIENT → DOCTOR ISL MEDICAL DICTIONARY (21 SIGNS) ────────────────────
export const PATIENT_ISL_DICTIONARY: ISLSign[] = [
  {
    id: 'p_hello',
    role: 'PATIENT',
    label: 'Hello / Namaste',
    hindi: 'नमस्ते डॉक्टर',
    marathi: 'नमस्ते डॉक्टर',
    bengali: 'নমস্কার ডাক্তার',
    assamese: 'নমস্কাৰ চিকিৎসক',
    category: 'GENERAL',
    handPattern: 'HOLD_STATIC',
    icon: '🙏',
    description: 'Palms pressed together gently in front of chest'
  },
  {
    id: 'p_yes',
    role: 'PATIENT',
    label: 'Yes / Agreed',
    hindi: 'हाँ / समझ गया',
    marathi: 'होय / समजले',
    bengali: 'হ্যাঁ / বুঝেছি',
    assamese: 'হয় / বুজি পালোঁ',
    category: 'RESPONSE',
    handPattern: 'UP_DOWN',
    icon: '👍',
    description: 'Fist nodding up and down like head movement'
  },
  {
    id: 'p_no',
    role: 'PATIENT',
    label: 'No / Disagree',
    hindi: 'नहीं / ऐसा नहीं है',
    marathi: 'नाही / असे नाही',
    bengali: 'না / এমন নয়',
    assamese: 'নহয় / এনে নহয়',
    category: 'RESPONSE',
    handPattern: 'SIDE_TO_SIDE',
    icon: '👎',
    description: 'Index and middle fingers tapping thumb horizontally'
  },
  {
    id: 'p_help',
    role: 'PATIENT',
    label: 'I need help / Assistance',
    hindi: 'मुझे तुरंत मदद चाहिए',
    marathi: 'मला त्वरित मदत हवी आहे',
    bengali: 'আমার সাহায্য প্রয়োজন',
    assamese: 'মোক তৎকালীন সহায় লাগে',
    category: 'NEED',
    handPattern: 'UP_DOWN',
    icon: '🆘',
    description: 'Thumb pointing upward on flat supporting palm lifted upwards'
  },
  {
    id: 'p_emergency',
    role: 'PATIENT',
    label: 'EMERGENCY! Need Immediate Care!',
    hindi: 'आपातकाल! तुरंत डॉक्टर बुलाएं!',
    marathi: 'आणीबाणी! तातडीने डॉक्टर बोलवा!',
    bengali: 'জরুরি অবস্থা! ডাক্তার ডাকুন!',
    assamese: 'জৰুৰীকালীন অৱস্থা! চিকিৎসকক মাতক!',
    category: 'URGENCY',
    isEmergency: true,
    handPattern: 'CIRCULAR',
    icon: '🚨',
    description: 'Both open hands waving rapidly across upper chest & head'
  },
  {
    id: 'p_pain',
    role: 'PATIENT',
    label: 'I have pain',
    hindi: 'मुझे दर्द हो रहा है',
    marathi: 'मला खूप वेदना होत आहेत',
    bengali: 'আমার প্রচণ্ড ব্যথা হচ্ছে',
    assamese: 'মোৰ বিষ হৈ আছে',
    category: 'SYMPTOM',
    handPattern: 'HOLD_STATIC',
    icon: '😣',
    description: 'Fist clenched with trembling motion near affected area'
  },
  {
    id: 'p_severe_pain',
    role: 'PATIENT',
    label: 'Severe acute pain',
    hindi: 'असहनीय तेज दर्द है',
    marathi: 'खूप जास्त तीव्र वेदना आहेत',
    bengali: 'অসহ্য তীব্র যন্ত্রণা',
    assamese: 'অসহ্যকৰ তীব্ৰ বিষ',
    category: 'URGENCY',
    isEmergency: true,
    handPattern: 'CROSS_CHEST',
    icon: '⚡',
    description: 'Both hands clutching chest tightly with head shaking'
  },
  {
    id: 'p_mild_pain',
    role: 'PATIENT',
    label: 'Mild / Slight pain',
    hindi: 'हल्का सा दर्द है',
    marathi: 'किंचित दुखत आहे',
    bengali: 'সামান্য ব্যথা আছে',
    assamese: 'সামান্য বিষ আছে',
    category: 'SYMPTOM',
    handPattern: 'HOLD_STATIC',
    icon: '🤏',
    description: 'Thumb and index pinch gesture with gentle nod'
  },
  {
    id: 'p_chest_pain',
    role: 'PATIENT',
    label: 'Chest pain / Pressure',
    hindi: 'छाती में दर्द / भारीपन',
    marathi: 'छातीत तीव्र वेदना / जडपणा',
    bengali: 'বুকে তীব্র ব্যথা / চাপ',
    assamese: 'বুকুত তীব্ৰ বিষ / চাপ',
    category: 'URGENCY',
    isEmergency: true,
    handPattern: 'CROSS_CHEST',
    icon: '🫀',
    description: 'Open hand placed firmly over center chest with tight grip'
  },
  {
    id: 'p_headache',
    role: 'PATIENT',
    label: 'Headache / Head pain',
    hindi: 'सिर में तेज दर्द है',
    marathi: 'डोके खूप दुखत आहे',
    bengali: 'মাথায় তীব্র যন্ত্রণা হচ্ছে',
    assamese: 'মূৰৰ তীব্ৰ বিষ হৈছে',
    category: 'SYMPTOM',
    handPattern: 'TOUCH_HEAD',
    icon: '🤕',
    description: 'Both index fingers tapping temple / forehead region'
  },
  {
    id: 'p_stomach_pain',
    role: 'PATIENT',
    label: 'Stomach / Abdominal pain',
    hindi: 'पेट में दर्द है',
    marathi: 'पोटात खूप दुखत आहे',
    bengali: 'পেটে তীব্র যন্ত্রণা',
    assamese: 'পেটৰ বিষ হৈছে',
    category: 'SYMPTOM',
    handPattern: 'TOUCH_STOMACH',
    icon: '🤢',
    description: 'Hands holding lower abdomen with inward circular pressure'
  },
  {
    id: 'p_back_pain',
    role: 'PATIENT',
    label: 'Back / Spine pain',
    hindi: 'कमर व पीठ में दर्द है',
    marathi: 'पाठीत व कंबरेत वेदना आहेत',
    bengali: 'পিঠে ও কোমরে ব্যথা',
    assamese: 'পিঠি আৰু কঁকালৰ বিষ',
    category: 'SYMPTOM',
    handPattern: 'CROSS_CHEST',
    icon: '🧍',
    description: 'Thumb reaching towards lower back with wincing expression'
  },
  {
    id: 'p_fever',
    role: 'PATIENT',
    label: 'I have fever / Hot chills',
    hindi: 'मुझे बुखार है / शरीर गर्म है',
    marathi: 'मला ताप आला आहे',
    bengali: 'আমার জ্বর ও গায়ে উত্তাপ',
    assamese: 'মোৰ জ্বৰ আৰু দেহ গৰম',
    category: 'SYMPTOM',
    handPattern: 'TOUCH_HEAD',
    icon: '🌡️',
    description: 'Back of palm touching forehead then shaking outward'
  },
  {
    id: 'p_dizzy',
    role: 'PATIENT',
    label: 'I feel dizzy / Giddiness',
    hindi: 'चक्कर आ रहे हैं',
    marathi: 'मला चक्कर येत आहे',
    bengali: 'মাথা ঘুরছে ও দুর্বল লাগছে',
    assamese: 'ঘূৰণী লাগিছে আৰু দুৰ্বল অনুভৱ',
    category: 'SYMPTOM',
    handPattern: 'CIRCULAR',
    icon: '💫',
    description: 'Index finger moving in circular swirl above head'
  },
  {
    id: 'p_breathe',
    role: 'PATIENT',
    label: 'Breathing difficulty / Asthma',
    hindi: 'सांस लेने में बहुत तकलीफ है',
    marathi: 'श्वास घेण्यास त्रास होत आहे',
    bengali: 'শ্বাসকষ্ট হচ্ছে',
    assamese: 'উশাহ লোৱাত কষ্ট হৈছে',
    category: 'URGENCY',
    isEmergency: true,
    handPattern: 'CROSS_CHEST',
    icon: '🫁',
    description: 'Both hands clutching upper throat and gasping'
  },
  {
    id: 'p_water',
    role: 'PATIENT',
    label: 'I need water / Thirsty',
    hindi: 'मुझे पानी चाहिए / प्यास लगी है',
    marathi: 'मला पाणी हवे आहे',
    bengali: 'আমার জল দরকার / তৃষ্ণার্ত',
    assamese: 'মোক পানী লাগে / পিয়াহ লাগিছে',
    category: 'NEED',
    handPattern: 'HOLD_STATIC',
    icon: '💧',
    description: 'Three fingers (W sign) touching chin / lips twice'
  },
  {
    id: 'p_medicine',
    role: 'PATIENT',
    label: 'I need medicine / Time for pill',
    hindi: 'दवाई का समय / दवा चाहिए',
    marathi: 'औषधाची वेळ / औषध हवे',
    bengali: 'ওষুধের সময় / ওষুধ দিন',
    assamese: 'ঔষধৰ সময় / ঔষধ লাগে',
    category: 'NEED',
    handPattern: 'UP_DOWN',
    icon: '💊',
    description: 'Thumb and index finger placing imaginary pill into mouth'
  },
  {
    id: 'p_feel_better',
    role: 'PATIENT',
    label: 'I feel better today',
    hindi: 'आज बेहतर महसूस हो रहा है',
    marathi: 'आज बरे वाटत आहे',
    bengali: 'আজ কিছুটা ভালো লাগছে',
    assamese: 'আজি কিছু ভাল লাগিছে',
    category: 'RESPONSE',
    handPattern: 'UP_DOWN',
    icon: '😊',
    description: 'Thumb up gesture with gentle smile and chest nod'
  },
  {
    id: 'p_feel_worse',
    role: 'PATIENT',
    label: 'I feel worse today',
    hindi: 'तबीयत और खराब लग रही है',
    marathi: 'तब्येत अधिक बिघडली आहे',
    bengali: 'শরীর আরও খারাপ লাগছে',
    assamese: 'স্বাস্থ্য অধিক বেয়া লাগিছে',
    category: 'SYMPTOM',
    handPattern: 'SIDE_TO_SIDE',
    icon: '😞',
    description: 'Thumb down gesture with slow downward hand movement'
  },
  {
    id: 'p_pain_here',
    role: 'PATIENT',
    label: 'Pain is exactly here',
    hindi: 'दर्द ठीक इसी जगह है',
    marathi: 'वेदना नक्की याच ठिकाणी आहेत',
    bengali: 'ব্যথা ঠিক এইখানেই হচ্ছে',
    assamese: 'বিষ ঠিক এইখিনিতেই হৈছে',
    category: 'SYMPTOM',
    handPattern: 'HOLD_STATIC',
    icon: '🎯',
    description: 'Index finger pointing directly at specific painful zone'
  },
  {
    id: 'p_need_help',
    role: 'PATIENT',
    label: 'Please call caregiver / nurse',
    hindi: 'कृपया नर्स या सहायक को बुलाएं',
    marathi: 'कृपया नर्स किंवा सहाय्यकाला बोलवा',
    bengali: 'দয়া করে সেবিকা বা সহায়তাকারীকে ডাকুন',
    assamese: 'অনুগ্ৰহ কৰি নাৰ্ছ বা সহায়কক মাতক',
    category: 'NEED',
    handPattern: 'UP_DOWN',
    icon: '👩‍⚕️',
    description: 'Hand raised waving towards door/side'
  }
];

// ─── 2. DOCTOR → PATIENT ISL CLINICAL DICTIONARY (16 SIGNS) ──────────────────
export const DOCTOR_ISL_DICTIONARY: ISLSign[] = [
  {
    id: 'd_hello',
    role: 'DOCTOR',
    label: 'Hello / Namaste',
    hindi: 'नमस्ते, मैं आपकी डॉक्टर हूँ',
    marathi: 'नमस्ते, मी तुमची डॉक्टर आहे',
    bengali: 'নমস্কার, আমি আপনার চিকিৎসক',
    assamese: 'নমস্কাৰ, মই আপোনাৰ চিকিৎসক',
    category: 'GENERAL',
    handPattern: 'HOLD_STATIC',
    icon: '👋',
    description: 'Open right palm waving gently with warm eye contact'
  },
  {
    id: 'd_wait',
    role: 'DOCTOR',
    label: 'Please wait a moment',
    hindi: 'कृपया एक क्षण प्रतीक्षा करें',
    marathi: 'कृपया थोडा वेळ थांबा',
    bengali: 'দয়া করে কিছুক্ষণ অপেক্ষা করুন',
    assamese: 'অনুগ্ৰহ কৰি অলপ সময় ৰওক',
    category: 'INSTRUCTION',
    handPattern: 'HOLD_STATIC',
    icon: '⏳',
    description: 'Open palm facing forward with steady hold'
  },
  {
    id: 'd_where_pain',
    role: 'DOCTOR',
    label: 'Where is the pain?',
    hindi: 'दर्द किस जगह पर हो रहा है?',
    marathi: 'वेदना नेमक्या कोठे होत आहेत?',
    bengali: 'ব্যথা ঠিক কোথায় হচ্ছে?',
    assamese: 'বিষ ঠিক কʼত হৈছে?',
    category: 'QUESTION',
    handPattern: 'CIRCULAR',
    icon: '📍',
    description: 'Index finger pointing and circling outward with questioning look'
  },
  {
    id: 'd_show_pain',
    role: 'DOCTOR',
    label: 'Show me where it hurts',
    hindi: 'मुझे दिखाएं कहाँ दर्द है',
    marathi: 'मला दाखवा कोठे दुखत आहे',
    bengali: 'আমাকে আঙুল দিয়ে দেখিয়ে দিন',
    assamese: 'মোক আঙুলিৰে দেখুৱাই দিয়ক',
    category: 'INSTRUCTION',
    handPattern: 'UP_DOWN',
    icon: '👉',
    description: 'Both index fingers pointing towards camera then towards chest'
  },
  {
    id: 'd_how_long',
    role: 'DOCTOR',
    label: 'How long have you had this?',
    hindi: 'यह समस्या कितने समय से है?',
    marathi: 'हा त्रास किती काळापासून आहे?',
    bengali: 'কতদিন ধরে এই সমস্যা হচ্ছে?',
    assamese: 'কিমান দিনৰ পৰা এই সমস্যা হৈছে?',
    category: 'QUESTION',
    handPattern: 'SIDE_TO_SIDE',
    icon: '⏱️',
    description: 'Tapping wrist watch area followed by spread fingers'
  },
  {
    id: 'd_fever_q',
    role: 'DOCTOR',
    label: 'Do you have fever?',
    hindi: 'क्या आपको बुखार लग रहा है?',
    marathi: 'तुम्हाला ताप आला आहे का?',
    bengali: 'আপনার কি জ্বর আছে?',
    assamese: 'আপোনাৰ জ্বৰ উঠিছে নেকি?',
    category: 'QUESTION',
    handPattern: 'TOUCH_HEAD',
    icon: '🌡️',
    description: 'Back of hand on forehead with inquiring nod'
  },
  {
    id: 'd_headache_q',
    role: 'DOCTOR',
    label: 'Do you have headache?',
    hindi: 'क्या सिर में दर्द है?',
    marathi: 'डोके दुखत आहे का?',
    bengali: 'মাথায় কি যন্ত্রণা হচ্ছে?',
    assamese: 'মূৰৰ বিষ হৈছে নেকি?',
    category: 'QUESTION',
    handPattern: 'TOUCH_HEAD',
    icon: '🤕',
    description: 'Tapping temples with questioning raised eyebrows'
  },
  {
    id: 'd_chest_q',
    role: 'DOCTOR',
    label: 'Do you have chest pain?',
    hindi: 'क्या छाती में दर्द या भारीपन है?',
    marathi: 'छातीत दुखत किंवा जड वाटत आहे का?',
    bengali: 'বুকে কি ব্যথা বা অস্বস্তি হচ্ছে?',
    assamese: 'বুকুত বিষ বা টান অনুভৱ হৈছে নেকি?',
    category: 'QUESTION',
    handPattern: 'CROSS_CHEST',
    icon: '🫀',
    description: 'Palm over center chest with questioning expression'
  },
  {
    id: 'd_better_q',
    role: 'DOCTOR',
    label: 'Are you feeling better?',
    hindi: 'क्या आप पहले से बेहतर हैं?',
    marathi: 'तुम्हाला आता बरे वाटत आहे का?',
    bengali: 'আপনি কি এখন কিছুটা ভালো আছেন?',
    assamese: 'আপুনি এতিয়া ভাল অনুভৱ কৰিছেনে?',
    category: 'QUESTION',
    handPattern: 'UP_DOWN',
    icon: '👍',
    description: 'Thumb up with raised eyebrows in questioning expression'
  },
  {
    id: 'd_worse_q',
    role: 'DOCTOR',
    label: 'Are you feeling worse?',
    hindi: 'क्या तबीयत ज्यादा खराब है?',
    marathi: 'त्रास जास्त वाढला आहे का?',
    bengali: 'শারীরিক কষ্ট কি বেড়েছে?',
    assamese: 'কষ্ট অধিক বাঢ়িছে নেকি?',
    category: 'QUESTION',
    handPattern: 'SIDE_TO_SIDE',
    icon: '👎',
    description: 'Thumb down with tilted head in inquiring gesture'
  },
  {
    id: 'd_take_med',
    role: 'DOCTOR',
    label: 'Take your prescribed medicine',
    hindi: 'अपनी निर्धारित दवाई समय पर लें',
    marathi: 'तुमचे विहित औषध वेळेवर घ्या',
    bengali: 'আপনার নির্দিষ্ট ওষুধ সময়মতো খান',
    assamese: 'আপোনাৰ নিৰ্দিষ্ট ঔষধ নিয়মমতে খাওক',
    category: 'INSTRUCTION',
    handPattern: 'UP_DOWN',
    icon: '💊',
    description: 'Imitating pill ingestion followed by nodding approval'
  },
  {
    id: 'd_drink_water',
    role: 'DOCTOR',
    label: 'Drink plenty of water',
    hindi: 'पर्याप्त मात्रा में पानी पिएं',
    marathi: 'भरपूर पाणी प्या',
    bengali: 'প্রচুর জল পান করুন',
    assamese: 'প্ৰচুৰ পৰিমাণে পানী খাওক',
    category: 'INSTRUCTION',
    handPattern: 'HOLD_STATIC',
    icon: '🥤',
    description: 'Holding imaginary glass and tipping towards mouth'
  },
  {
    id: 'd_rest',
    role: 'DOCTOR',
    label: 'Please take complete rest',
    hindi: 'कृपया पूरा आराम करें',
    marathi: 'कृपया पूर्ण विश्रांती घ्या',
    bengali: 'দয়া করে পর্যাপ্ত বিশ্রাম নিন',
    assamese: 'অনুগ্ৰহ কৰি সম্পূৰ্ণ জিৰণি লওক',
    category: 'INSTRUCTION',
    handPattern: 'CROSS_CHEST',
    icon: '🛌',
    description: 'Both hands palms together resting against side of cheek'
  },
  {
    id: 'd_call_caregiver',
    role: 'DOCTOR',
    label: 'Call your caregiver now',
    hindi: 'अपने केयरगिवर / नर्स को बुलाएं',
    marathi: 'तुमच्या केअरगिव्हर / नर्सला बोलवा',
    bengali: 'আপনার কেয়ারগিভারকে ডাকুন',
    assamese: 'আপোনাৰ কেয়াৰগিভাৰক মাতক',
    category: 'INSTRUCTION',
    handPattern: 'HOLD_STATIC',
    icon: '📞',
    description: 'Making phone shape near ear while pointing outwards'
  },
  {
    id: 'd_come_hospital',
    role: 'DOCTOR',
    label: 'Please visit the hospital',
    hindi: 'कृपया जांच के लिए अस्पताल आएं',
    marathi: 'कृपया तपासणीसाठी रुग्णालयात या',
    bengali: 'দয়া করে ক্লিনিকে আসুন',
    assamese: 'অনুগ্ৰহ কৰি চিকিৎসালয়লৈ আহক',
    category: 'INSTRUCTION',
    handPattern: 'UP_DOWN',
    icon: '🏥',
    description: 'Drawing cross symbol on upper arm with index finger'
  },
  {
    id: 'd_emergency',
    role: 'DOCTOR',
    label: 'This is an emergency!',
    hindi: 'यह आपातकालीन स्थिति है!',
    marathi: 'ही आणीबाणीची परिस्थिती आहे!',
    bengali: 'এটি একটি জরুরি চিকিৎসা অবস্থা!',
    assamese: 'ই এটি জৰুৰীকালীন অৱস্থা!',
    category: 'URGENCY',
    isEmergency: true,
    handPattern: 'CIRCULAR',
    icon: '🚨',
    description: 'Both hands raised in urgent flashing wave gesture'
  }
];

class SignTranslationService {
  public getPatientDictionary(): ISLSign[] {
    return PATIENT_ISL_DICTIONARY;
  }

  public getDoctorDictionary(): ISLSign[] {
    return DOCTOR_ISL_DICTIONARY;
  }

  public findSignById(id: string): ISLSign | undefined {
    return (
      PATIENT_ISL_DICTIONARY.find(s => s.id === id) ||
      DOCTOR_ISL_DICTIONARY.find(s => s.id === id)
    );
  }

  public getLocalizedLabel(sign: ISLSign, language = 'en'): string {
    const cleanLang = language.split('-')[0].toLowerCase();
    switch (cleanLang) {
      case 'hi': return sign.hindi;
      case 'mr': return sign.marathi;
      case 'bn': return sign.bengali;
      case 'as': return sign.assamese;
      default: return sign.label;
    }
  }
}

export const signTranslationService = new SignTranslationService();
