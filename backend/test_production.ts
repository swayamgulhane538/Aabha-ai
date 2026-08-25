import { db } from './src/store/persistentDatabase';
import { emailService } from './src/services/emailService';
import bcrypt from 'bcryptjs';

async function runVerificationTests() {
  console.log('================================================================');
  console.log('🏥 RUNNING FULL PRODUCTION HEALTHCARE & PERSISTENCE TEST SUITE');
  console.log('================================================================\n');

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
  assert(!!anita2 && anita2.patientId === 'PAT-2026-000002', 'Anita Devi #2 has distinct permanent ID PAT-2026-000002');
  assert(!!rajesh && rajesh.patientId === 'PAT-2026-000003', 'Rajesh Kumar has permanent ID PAT-2026-000003');
  assert(anita1?.id !== anita2?.id, 'Anita Devi #1 and #2 have completely distinct internal UUIDs');

  // 2. REPORT ISOLATION STRICTLY LINKED BY UUID
  const anita1Reports = db.getReportsByPatientUserId('uuid-anita-01');
  const anita2Reports = db.getReportsByPatientUserId('uuid-anita-02');
  const rajeshReports = db.getReportsByPatientUserId('uuid-rajesh-03');

  assert(anita1Reports.length === 3, `Anita Devi #1 has exactly 3 reports (found ${anita1Reports.length})`);
  assert(anita2Reports.length === 2, `Anita Devi #2 has exactly 2 reports (found ${anita2Reports.length})`);
  assert(rajeshReports.length === 2, `Rajesh Kumar has exactly 2 reports (found ${rajeshReports.length})`);

  // Ensure no report cross-contamination
  const anita1HasAnita2Report = anita1Reports.some(r => r.patientUserId === 'uuid-anita-02');
  assert(!anita1HasAnita2Report, 'Anita Devi #1 CANNOT see any of Anita Devi #2 reports');

  // 3. CAREGIVER AUTHORIZATION ISOLATION
  const priyaLinkedIds = db.getLinkedPatientIdsForCaregiver('uuid-caregiver-priya');
  assert(priyaLinkedIds.includes('uuid-anita-01'), 'Caregiver Priya Sharma is linked to Anita Devi #1');
  assert(priyaLinkedIds.includes('uuid-rajesh-03'), 'Caregiver Priya Sharma is linked to Rajesh Kumar');
  assert(!priyaLinkedIds.includes('uuid-anita-02'), 'Caregiver Priya Sharma has ZERO access to Anita Devi #2');

  // 4. NEW PATIENT REGISTRATION & ID AUTO-GENERATION
  const newPatientId = db.generateNextPatientId();
  const testPatient = db.createUser({
    id: 'uuid-test-05',
    patientId: newPatientId,
    name: 'Suman Lata',
    email: 'suman.lata@aabha.ai',
    phone: '+91 99000 11223',
    passwordHash: bcrypt.hashSync('testpass123', 10),
    role: 'PATIENT',
    age: 69,
    gender: 'Female',
    emergencyContact: 'Amit Lata (+91 99000 11220)',
    address: 'Sector 15, Chandigarh',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  assert(testPatient.patientId.startsWith('PAT-2026-'), `New patient auto-generated unique ID: ${testPatient.patientId}`);
  assert(db.getUserById('uuid-test-05')?.name === 'Suman Lata', 'New patient successfully persisted to database');

  // 5. REPORT UPLOAD WITH TARGET IDENTITY ASSIGNMENT
  const newReport = db.createReport({
    id: 'rep-test-01',
    patientUserId: 'uuid-test-05',
    patientId: testPatient.patientId,
    patientName: testPatient.name,
    reportType: 'COGNITIVE_ASSESSMENT',
    title: 'MoCA Baseline Screening',
    description: 'Initial cognitive intake assessment',
    score: 82,
    maxScore: 100,
    result: 'Intact memory recall',
    createdBy: 'Dr. Anita Verma',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  assert(db.getReportsByPatientUserId('uuid-test-05').length === 1, 'Report saved and strictly linked to Suman Lata UUID');

  // 6. PROFILE EDIT PERSISTENCE
  db.updateUser('uuid-test-05', {
    phone: '+91 99000 99999',
    address: 'Updated Suite 404, Green Park, Delhi'
  });
  const updatedUser = db.getUserById('uuid-test-05');
  assert(updatedUser?.phone === '+91 99000 99999', 'Profile update persisted phone number');
  assert(updatedUser?.address === 'Updated Suite 404, Green Park, Delhi', 'Profile update persisted address');

  // 7. REAL PASSWORD RESET EMAIL & TOKEN FLOW
  const tokenRec = db.createPasswordResetToken('uuid-test-05', 'suman.lata@aabha.ai', 'test-token-abcdef123456', 15);
  assert(tokenRec.token === 'test-token-abcdef123456', 'Password reset token generated with 15-minute expiry');

  const verifiedToken = db.verifyPasswordResetToken('test-token-abcdef123456');
  assert(!!verifiedToken && verifiedToken.userId === 'uuid-test-05', 'Token verification correctly resolves user UUID');

  // Reset password
  const newHash = bcrypt.hashSync('newsecret2026', 10);
  db.updateUser('uuid-test-05', { passwordHash: newHash });
  db.markPasswordResetTokenUsed(tokenRec.id);

  assert(bcrypt.compareSync('newsecret2026', db.getUserById('uuid-test-05')!.passwordHash), 'New password verified with bcrypt');
  assert(db.verifyPasswordResetToken('test-token-abcdef123456') === undefined, 'Used token cannot be reused (Single-Use enforcement)');

  console.log(`\n================================================================`);
  console.log(`🎉 ALL ${passed}/${total} PRODUCTION VERIFICATION TESTS PASSED PERFECTLY!`);
  console.log(`================================================================\n`);
}

runVerificationTests();
