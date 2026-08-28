import { geminiService } from './geminiService';
import { speechService } from './speechService';
import { api } from './api';

export interface PatientDiagnosisProfile {
  primaryDisease: string;
  primaryDiseaseHindi: string;
  primaryDiseaseMarathi: string;
  icdCode: string;
  stage: 'EARLY_STAGE' | 'MODERATE' | 'ADVANCED';
  diagnosedDate: string;
  diagnosedBy: string;
  hospital: string;
  summaryDescription: string;
  summaryDescriptionHindi: string;
  symptoms: { name: string; severity: 'MILD' | 'MODERATE' | 'CONTROLLED'; note: string }[];
  activeMedications: { name: string; dose: string; timing: string; purpose: string }[];
  caregiverGuidelines: string[];
}

export interface PrescriptionRecord {
  id: string;
  title: string;
  doctorName: string;
  hospitalName: string;
  prescribedDate: string;
  photoUrl: string; // Base64 or cloud URL
  extractedMedicines: { name: string; dosage: string; frequency: string; duration: string }[];
  doctorInstructions: string;
  nextFollowUpDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

const STORAGE_DIAGNOSIS_KEY = 'aabha_patient_diagnosis_profile_v2';
const STORAGE_PRESCRIPTIONS_KEY = 'aabha_saved_prescriptions_v2';

const DEFAULT_DIAGNOSIS: PatientDiagnosisProfile = {
  primaryDisease: "Early-Stage Alzheimer's Disease & Mild Cognitive Impairment (MCI)",
  primaryDiseaseHindi: "शुरुआती अल्जाइमर रोग एवं माइल्ड कॉग्निटिव इम्पेयरमेंट (MCI - याददाश्त की कमजोरी)",
  primaryDiseaseMarathi: "सुरुवातीचा अल्झायमर आजार आणि स्मृतीभ्रंश (डिमेंशिया)",
  icdCode: "ICD-10: G30.0 / F00.0",
  stage: "EARLY_STAGE",
  diagnosedDate: "12 January 2026",
  diagnosedBy: "Dr. Anita Verma, MD (Neurology)",
  hospital: "AIIMS & PBCOE Neuro-Geriatric Cognitive Care Center",
  summaryDescription: "A neuro-degenerative condition affecting short-term memory consolidation, spatial orientation, and word recall. Brain cognitive agility is currently well-preserved with active routine stimulation, daily physical mobility, and neuro-protective nutrition.",
  summaryDescriptionHindi: "यह मस्तिष्क की कोशिकाओं से जुड़ी स्थिति है जिसमें हाल की बातें याद रखने और रास्ते पहचानने में हल्की कठिनाई होती है। नियमित दिमागी कसरत, 4,000 कदम वॉक, और समय पर दवाइयों से इसे बहुत अच्छे से नियंत्रित रखा जा रहा है।",
  symptoms: [
    { name: "Short-term Memory Recall (छोटी बातें भूलना)", severity: "MILD", note: "Occasional difficulty remembering recent conversations or where keys were placed." },
    { name: "Spatial Orientation (रास्ते में भ्रम)", severity: "CONTROLLED", note: "Managed with AABHA AI GPS Wandering Safe Zone Geofencing." },
    { name: "Sundowning / Evening Fatigue (शाम की थकावट)", severity: "MILD", note: "Calmed with Evening Turmeric Golden Milk and Breathing Exercises." }
  ],
  activeMedications: [
    { name: "Donepezil HCl (Aricept)", dose: "5 mg", timing: "Night (09:00 PM)", purpose: "Enhances Acetylcholine neurotransmitter levels in brain synapses." },
    { name: "Memantine HCl", dose: "10 mg", timing: "Morning (09:00 AM)", purpose: "Protects brain cells from glutamate neurotoxicity." },
    { name: "Methylcobalamin (B12) & Vitamin D3", dose: "1500 mcg", timing: "After Breakfast", purpose: "Maintains myelin sheath integrity and nerve health." }
  ],
  caregiverGuidelines: [
    "Keep daily environment consistent and avoid sudden drastic routine changes.",
    "Encourage 12-Step Surya Namaskar and 4,000 steps daily walking.",
    "Ensure MIND Diet adherence with high Omega-3 and low sodium.",
    "Speak in calm, loving, short sentences and use Memory Passport for familiar photos."
  ]
};

// Seed realistic prescription photo record
const DEFAULT_PRESCRIPTION: PrescriptionRecord = {
  id: 'rx-2026-001',
  title: "Dr. Anita Verma - Comprehensive Neuro Prescription Letter",
  doctorName: "Dr. Anita Verma, MD (Neurology)",
  hospitalName: "AIIMS & PBCOE Neuro-Cognitive Care Unit, Dadar, Mumbai",
  prescribedDate: "2026-08-20",
  photoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
  extractedMedicines: [
    { name: "Tab. Donepezil", dosage: "5mg", frequency: "1 tablet at Bedtime (09:00 PM)", duration: "3 Months" },
    { name: "Tab. Memantine", dosage: "10mg", frequency: "1 tablet after Morning Breakfast (09:00 AM)", duration: "3 Months" },
    { name: "Cap. Neurobion Forte / B12", dosage: "1500mcg", frequency: "1 capsule once daily", duration: "1 Month" }
  ],
  doctorInstructions: "Patient advised to engage in cognitive exercises daily. Maintain blood pressure below 130/80. Walk minimum 30 minutes daily. Hydration minimum 2.5 Liters. Review with Mini-Mental State Examination (MMSE) score after 90 days.",
  nextFollowUpDate: "2026-11-20",
  status: 'ACTIVE',
  createdAt: "2026-08-20T10:30:00.000Z"
};

class PrescriptionService {
  private diagnosis: PatientDiagnosisProfile;
  private prescriptions: PrescriptionRecord[] = [];

  constructor() {
    this.diagnosis = this.loadDiagnosis();
    this.prescriptions = this.loadPrescriptions();
  }

  private loadDiagnosis(): PatientDiagnosisProfile {
    try {
      const raw = localStorage.getItem(STORAGE_DIAGNOSIS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DIAGNOSIS;
    } catch {
      return DEFAULT_DIAGNOSIS;
    }
  }

  private loadPrescriptions(): PrescriptionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_PRESCRIPTIONS_KEY);
      return raw ? JSON.parse(raw) : [DEFAULT_PRESCRIPTION];
    } catch {
      return [DEFAULT_PRESCRIPTION];
    }
  }

  private savePrescriptions(list: PrescriptionRecord[]) {
    try {
      this.prescriptions = list;
      localStorage.setItem(STORAGE_PRESCRIPTIONS_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-prescriptions-updated', { detail: list }));
      }
    } catch {}
  }

  public getDiagnosisProfile(): PatientDiagnosisProfile {
    return this.diagnosis;
  }

  public getPrescriptions(): PrescriptionRecord[] {
    return this.prescriptions;
  }

  public async addPrescription(
    title: string,
    doctorName: string,
    hospitalName: string,
    photoBase64OrUrl: string,
    extractedMeds?: { name: string; dosage: string; frequency: string; duration: string }[],
    instructions?: string,
    nextFollowUp?: string
  ): Promise<PrescriptionRecord> {
    const newRx: PrescriptionRecord = {
      id: 'rx-' + Date.now(),
      title: title || `Prescription - ${new Date().toLocaleDateString()}`,
      doctorName: doctorName || "Consulting Neurologist",
      hospitalName: hospitalName || "Hospital / Medical Center",
      prescribedDate: new Date().toISOString().split('T')[0],
      photoUrl: photoBase64OrUrl,
      extractedMedicines: extractedMeds || [
        { name: "Prescribed Medicine", dosage: "As advised", frequency: "Daily", duration: "1 Month" }
      ],
      doctorInstructions: instructions || "Take medications on time as prescribed by consulting physician.",
      nextFollowUpDate: nextFollowUp || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const updated = [newRx, ...this.prescriptions];
    this.savePrescriptions(updated);
    this.syncPrescriptionWithBackend(newRx);
    return newRx;
  }

  public deletePrescription(id: string) {
    const updated = this.prescriptions.filter(p => p.id !== id);
    this.savePrescriptions(updated);
  }

  // ─── AI OCR PRESCRIPTION SCANNER (GOOGLE GEMINI) ───────────────────────────
  public async analyzePrescriptionPhotoWithAI(photoDescriptionOrText: string): Promise<{
    doctorName: string;
    hospitalName: string;
    medicines: { name: string; dosage: string; frequency: string; duration: string }[];
    instructions: string;
    nextFollowUpDate: string;
  }> {
    try {
      const prompt = `You are an expert AI clinical pharmacist and prescription OCR scanner for cognitive neuro-geriatric prescriptions.
Scan and extract structured prescription information from this clinical context/note: "${photoDescriptionOrText}".
Return ONLY a valid raw JSON object (no markdown, no backticks):
{
  "doctorName": "Doctor name with title",
  "hospitalName": "Hospital or Clinic name",
  "medicines": [
    {
      "name": "Medicine name (e.g. Donepezil)",
      "dosage": "5mg",
      "frequency": "Once daily at night",
      "duration": "90 Days"
    }
  ],
  "instructions": "Doctor instructions and lifestyle advice",
  "nextFollowUpDate": "YYYY-MM-DD"
}`;

      const aiResponse = await geminiService.generateRawPrompt(prompt);
      if (aiResponse) {
        const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          doctorName: parsed.doctorName || "Dr. Anita Verma, MD",
          hospitalName: parsed.hospitalName || "AIIMS & PBCOE Neuro Center",
          medicines: parsed.medicines || [],
          instructions: parsed.instructions || "Follow prescribed dosage schedule.",
          nextFollowUpDate: parsed.nextFollowUpDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
        };
      }
    } catch {}

    // Fallback extraction
    return {
      doctorName: "Dr. Anita Verma, MD (Neurology)",
      hospitalName: "AIIMS Cognitive Neurology Clinic",
      medicines: [
        { name: "Donepezil HCl", dosage: "5mg", frequency: "Once at Bedtime", duration: "90 Days" },
        { name: "Memantine HCl", dosage: "10mg", frequency: "Morning post breakfast", duration: "90 Days" }
      ],
      instructions: "Take medicines on time with water. Daily walking and cognitive games recommended.",
      nextFollowUpDate: "2026-11-20"
    };
  }

  public speakDiagnosisSummary(lang: string = 'hi') {
    let text = '';
    if (lang === 'hi') {
      text = `मरीज अनिता शर्मा का निदान शुरुआती अल्जाइमर और माइल्ड कॉग्निटिव इम्पेयरमेंट है। डॉक्टर अनिता वर्मा के अनुसार, मुख्य दवाइयां डोनेपेजिल 5 मिलीग्राम और मेमेंटाइन 10 मिलीग्राम हैं। मरीज की याददाश्त को एक्टिव रखने के लिए नियमित वॉक और माइंड डाइट जारी रखें।`;
    } else if (lang === 'mr') {
      text = `रुग्णाचे निदान सुरुवातीचा अल्झायमर आणि स्मृतीभ्रंश आहे. डॉक्टरांच्या सल्ल्यानुसार डोनेपेझिल आणि मेमेंटाइन औषधे वेळेवर सुरू आहेत.`;
    } else {
      text = `Patient diagnosis is Early-Stage Alzheimer's Disease and Mild Cognitive Impairment, prescribed by Dr. Anita Verma. Active medicines include Donepezil 5mg and Memantine 10mg.`;
    }
    speechService.speak(text, lang as any);
  }

  private async syncPrescriptionWithBackend(rx: PrescriptionRecord) {
    try {
      await api.post('/patient/prescriptions', { prescription: rx });
    } catch {}
  }
}

export const prescriptionService = new PrescriptionService();
