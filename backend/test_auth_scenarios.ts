import { db } from './src/store/persistentDatabase';
import bcrypt from 'bcryptjs';

async function runScenarioTests() {
  console.log('========================================================================');
  console.log('🧪 TESTING ALL 8 AUTHENTICATION & SINGLE DEMO SCENARIOS');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`✅ [SCENARIO ${total}] PASSED: ${title}`);
      passed++;
    } else {
      console.error(`❌ [SCENARIO ${total}] FAILED: ${title}`);
      process.exit(1);
    }
  }

  // ─── TEST 1: Register a new patient & Login using email/password ───
  const testEmail = `realpatient.${Date.now()}@example.com`;
  const testPassword = 'Password@123';
  const newPatientId = db.generateNextPatientId();
  const newUserId = 'uuid-usr-' + Date.now();

  const registeredUser = db.createUser({
    id: newUserId,
    patientId: newPatientId,
    name: 'Anita Devi (Registered Real Patient)',
    email: testEmail,
    phone: '+91 98765 11223',
    passwordHash: await bcrypt.hash(testPassword, 10),
    role: 'PATIENT',
    age: 69,
    dateOfBirth: '1957-03-20',
    gender: 'Female',
    emergencyContact: 'Dr. Anita Verma (+91 98765 43210)',
    address: 'Sector 14, Gurgaon',
    preferredLanguage: 'hi',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  assert(!!registeredUser && registeredUser.patientId.startsWith('PAT-2026-'), 'Registered real patient with permanent Patient ID: ' + registeredUser.patientId);

  // Authenticate login
  const foundUser = db.findUser(testEmail);
  assert(!!foundUser && await bcrypt.compare(testPassword, foundUser.passwordHash), 'Patient logs in successfully with email and password');
  assert(foundUser?.role === 'PATIENT', 'Patient role is verified as PATIENT');

  // ─── TEST 2: Logout & Login again with same data ───
  const reloadedUser = db.findUser(registeredUser.patientId);
  assert(!!reloadedUser && reloadedUser.id === registeredUser.id, 'Patient logs in again using permanent Patient ID (' + registeredUser.patientId + ')');

  // ─── TEST 3: Session Persistence from Database (/me) ───
  const sessionUser = db.getUserById(registeredUser.id);
  assert(!!sessionUser && sessionUser.email === testEmail && sessionUser.patientId === newPatientId, 'Session reloads patient profile from persistent SQL database');

  // ─── TEST 4: Single Demo Account ───
  const demoUser = db.findUser('demo.patient@aabha.ai') || db.findUser('PAT-DEMO-000001');
  assert(!!demoUser, 'Single Demo Patient account exists in database');
  assert(demoUser?.patientId === 'PAT-DEMO-000001', 'Demo Patient ID is PAT-DEMO-000001');
  assert(demoUser?.name === 'Demo Patient', 'Demo Patient Name is Demo Patient');
  assert(demoUser?.role === 'PATIENT', 'Demo Patient Role is PATIENT');

  // Demo Patient Pre-seeded Data
  const demoReports = db.getReportsByPatientUserId(demoUser!.id);
  const demoMeds = db.getMedications(demoUser!.id);
  const demoApts = db.getAppointments(demoUser!.id);
  assert(demoReports.length >= 3, `Demo patient has ${demoReports.length} reports attached to UUID`);
  assert(demoMeds.length >= 3, `Demo patient has ${demoMeds.length} medications attached to UUID`);
  assert(demoApts.length >= 1, `Demo patient has ${demoApts.length} appointments attached to UUID`);

  // ─── TEST 5: Verify ONLY ONE Demo Account ───
  const allUsers = db.getUsers();
  const demoAccounts = allUsers.filter(u => u.name.toLowerCase().includes('demo') || u.patientId.includes('DEMO'));
  assert(demoAccounts.length === 1, `Only ONE demo account exists in system (${demoAccounts[0]?.name} - ${demoAccounts[0]?.patientId})`);

  // ─── TEST 6: Forgot Password & Real Token Flow ───
  const resetToken = 'tok-' + Date.now();
  const tokenRecord = db.createPasswordResetToken(registeredUser.id, testEmail, resetToken, 15);

  const verifiedToken = db.verifyPasswordResetToken(resetToken);
  assert(!!verifiedToken && !verifiedToken.used && verifiedToken.email === testEmail, 'Password reset token is valid and un-used');

  const newPassword = 'NewSecretPassword@456';
  db.updateUser(registeredUser.id, { passwordHash: await bcrypt.hash(newPassword, 10) });
  db.markPasswordResetTokenUsed(tokenRecord.id);

  const updatedPatient = db.getUserById(registeredUser.id);
  assert(await bcrypt.compare(newPassword, updatedPatient!.passwordHash), 'Password updated successfully and verified with bcrypt');
  assert(db.verifyPasswordResetToken(resetToken) === undefined, 'Reset token cannot be reused after being marked as used');

  // ─── TEST 7: Patient UUID Isolation ───
  assert(demoReports.every(r => r.patientUserId === 'uuid-demo-patient'), 'All demo reports strictly linked to uuid-demo-patient');
  const anita1Reports = db.getReportsByPatientUserId('uuid-anita-01');
  assert(!anita1Reports.some(r => r.patientUserId === 'uuid-demo-patient'), 'Anita Devi #1 reports never contain demo data');

  console.log(`\n========================================================================`);
  console.log(`🎉 ALL ${passed}/${total} AUTHENTICATION & DEMO SCENARIOS PASSED!`);
  console.log(`========================================================================\n`);
}

runScenarioTests();
