import { db } from './src/store/persistentDatabase';
import bcrypt from 'bcryptjs';

async function runSIHSuite() {
  console.log('========================================================================');
  console.log('🏥 RUNNING COMPREHENSIVE SMART INDIA HACKATHON (SIH) TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`✅ [TEST ${total}] PASSED: ${title}`);
      passed++;
    } else {
      console.error(`❌ [TEST ${total}] FAILED: ${title}`);
      process.exit(1);
    }
  }

  // 1. UNIQUE PERMANENT PATIENT IDENTITIES
  const anita1 = db.getUserById('uuid-anita-01');
  const anita2 = db.getUserById('uuid-anita-02');
  const rajesh = db.getUserById('uuid-rajesh-03');

  assert(!!anita1 && anita1.patientId === 'PAT-2026-000001', 'Anita Devi #1 has permanent ID PAT-2026-000001');
  assert(!!anita2 && anita2.patientId === 'PAT-2026-000002', 'Anita Devi #2 has permanent ID PAT-2026-000002');
  assert(!!rajesh && rajesh.patientId === 'PAT-2026-000003', 'Rajesh Kumar has permanent ID PAT-2026-000003');
  assert(anita1?.id !== anita2?.id, 'Anita Devi #1 and #2 have separate internal UUIDs');

  // 2. REPORT ISOLATION STRICTLY LINKED BY UUID
  const anita1Reports = db.getReportsByPatientUserId('uuid-anita-01');
  const anita2Reports = db.getReportsByPatientUserId('uuid-anita-02');
  const rajeshReports = db.getReportsByPatientUserId('uuid-rajesh-03');

  assert(anita1Reports.length === 3, `Anita Devi #1 has 3 reports (found ${anita1Reports.length})`);
  assert(anita2Reports.length === 2, `Anita Devi #2 has 2 reports (found ${anita2Reports.length})`);
  assert(rajeshReports.length === 2, `Rajesh Kumar has 2 reports (found ${rajeshReports.length})`);
  assert(!anita1Reports.some(r => r.patientUserId === 'uuid-anita-02'), 'Anita #1 NEVER sees Anita #2 reports');

  // 3. CAREGIVER AUTHORIZATION ISOLATION
  const priyaLinkedIds = db.getLinkedPatientIdsForCaregiver('uuid-caregiver-priya');
  assert(priyaLinkedIds.includes('uuid-anita-01'), 'Caregiver Priya is linked to Anita Devi #1');
  assert(priyaLinkedIds.includes('uuid-rajesh-03'), 'Caregiver Priya is linked to Rajesh Kumar');
  assert(!priyaLinkedIds.includes('uuid-anita-02'), 'Caregiver Priya has ZERO access to Anita Devi #2');

  // 4. MEDICATIONS MANAGEMENT & ADHERENCE
  const anita1Meds = db.getMedications('uuid-anita-01');
  assert(anita1Meds.length >= 3, `Anita #1 has scheduled medications (found ${anita1Meds.length})`);
  assert(anita1Meds.some(m => m.name.includes('Donepezil')), 'Donepezil is in prescription list');

  // 5. APPOINTMENTS MANAGEMENT
  const anita1Apts = db.getAppointments('uuid-anita-01');
  assert(anita1Apts.length >= 2, `Anita #1 has scheduled appointments (found ${anita1Apts.length})`);
  assert(anita1Apts.some(a => a.doctorName.includes('Verma')), 'Consultation with Dr. Anita Verma scheduled');

  // 6. MOOD CHECK-IN LOGS
  const anita1Moods = db.getMoodLogs('uuid-anita-01');
  assert(anita1Moods.length >= 1, `Anita #1 has mood check-in history (found ${anita1Moods.length})`);

  // 7. COGNITIVE GAMES & ADAPTIVE DIFFICULTY
  const adaptiveDiff = db.getAdaptiveDifficulty('uuid-anita-01', 'memory-match');
  assert(['BEGINNER', 'NORMAL', 'ADVANCED'].includes(adaptiveDiff), `Calculated adaptive difficulty: ${adaptiveDiff}`);

  const newGameResult = db.saveGameResult({
    id: 'gr-test-' + Date.now(),
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    gameType: 'memory-match',
    gameName: 'Memory Match Pairs',
    score: 95,
    maxScore: 100,
    accuracy: 95,
    timeTaken: 35,
    difficulty: 'ADVANCED',
    completedAt: new Date().toISOString()
  });
  assert(newGameResult.score === 95, 'Game result saved with score & completion stats');

  // 8. EMERGENCY SOS ALERT DISPATCH
  const sosAlert = db.createAlert({
    id: 'alt-sos-' + Date.now(),
    patientUserId: 'uuid-anita-01',
    patientId: 'PAT-2026-000001',
    patientName: 'Anita Devi',
    severity: 'HIGH',
    alertType: 'EMERGENCY_SOS',
    title: '🚨 EMERGENCY SOS TRIGGERED BY ANITA DEVI',
    message: 'Immediate assistance requested by Anita Devi (PAT-2026-000001)',
    isRead: false,
    createdAt: new Date().toISOString()
  });
  assert(sosAlert.severity === 'HIGH', 'Emergency SOS alert generated with HIGH priority');

  // 9. AUDIT TRAIL LOGGING
  const auditLogs = db.getAuditLogs();
  assert(auditLogs.length > 0, `Audit logs present in persistent database (found ${auditLogs.length})`);

  // 10. AI CONVERSATION PERSISTENCE
  const aiLog = db.logAiConversation({
    id: 'conv-test-1',
    patientUserId: 'uuid-anita-01',
    userMessage: 'Abha, meri medicine kab hai?',
    assistantResponse: 'Aapki next medicine Amlodipine 5mg raat ko 8:00 PM par scheduled hai.',
    language: 'hi',
    intent: 'MEDICATION_QUERY',
    timestamp: new Date().toISOString()
  });
  assert(aiLog.intent === 'MEDICATION_QUERY', 'AI conversation logged with detected intent');

  console.log(`\n========================================================================`);
  console.log(`🎉 ALL ${passed}/${total} SMART INDIA HACKATHON (SIH) TEST CASES PASSED!`);
  console.log(`========================================================================\n`);
}

runSIHSuite();
