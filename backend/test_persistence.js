const path = require('path');
const fs = require('fs');

console.log('=== PHASE 3: AABHA AI DATABASE HEALTH & PERSISTENCE TEST ===\n');

// 1. Check database file
const dbPath = path.resolve(__dirname, 'data/aabha_database.json');
console.log('Checking database file on disk:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('ERROR: Database file does not exist at path:', dbPath);
  process.exit(1);
}

const rawData = fs.readFileSync(dbPath, 'utf8');
let dbJson;
try {
  dbJson = JSON.parse(rawData);
  console.log('✓ Database JSON parsed successfully.');
  console.log(`  - Users in DB: ${dbJson.users ? dbJson.users.length : 0}`);
  console.log(`  - Reminders in DB: ${dbJson.reminders ? dbJson.reminders.length : 0}`);
  console.log(`  - Game Results in DB: ${dbJson.gameResults ? dbJson.gameResults.length : 0}`);
  console.log(`  - Caregiver Relationships in DB: ${dbJson.caregiverRelationships ? dbJson.caregiverRelationships.length : 0}`);
} catch (e) {
  console.error('ERROR: Database JSON is corrupt:', e.message);
  process.exit(1);
}

// 2. Perform CRUD on persistent database
console.log('\n--- TESTING CRUD OPERATIONS ---');

const testPatientUserId = 'test-patient-uuid-' + Date.now();
const testPatientId = 'PAT-2026-999999';

// 2a. CREATE USER
const testUser = {
  id: testPatientUserId,
  patientId: testPatientId,
  name: 'Test Persistent Patient',
  email: `persistent.test.${Date.now()}@aabha.ai`,
  role: 'PATIENT',
  createdAt: new Date().toISOString()
};
dbJson.users.push(testUser);
console.log(`1. CREATE USER: Written user ${testUser.name} (${testUser.patientId})`);

// 2b. CREATE REMINDER
const testReminderId = 'rem-test-' + Date.now();
const testReminder = {
  id: testReminderId,
  userId: testPatientUserId,
  type: 'MEDICINE',
  title: 'Call family at 7 PM',
  scheduledAt: new Date().toISOString(),
  status: 'ACTIVE',
  recurrence: 'DAILY',
  createdAt: new Date().toISOString()
};
if (!dbJson.reminders) dbJson.reminders = [];
dbJson.reminders.push(testReminder);
console.log(`2. CREATE REMINDER: Written reminder "${testReminder.title}" for user ${testPatientUserId}`);

// 2c. CREATE GAME RESULT
const testGameResult = {
  id: 'gr-test-' + Date.now(),
  patientUserId: testPatientUserId,
  patientId: testPatientId,
  gameType: 'memory-match',
  gameName: 'Memory Match',
  score: 95,
  maxScore: 100,
  accuracy: 95,
  timeTaken: 42,
  completedAt: new Date().toISOString()
};
if (!dbJson.gameResults) dbJson.gameResults = [];
dbJson.gameResults.push(testGameResult);
console.log(`3. CREATE GAME RESULT: Written score ${testGameResult.score}/${testGameResult.maxScore} for user ${testPatientUserId}`);

// 2d. WRITE TO DISK
fs.writeFileSync(dbPath, JSON.stringify(dbJson, null, 2), 'utf8');
console.log('✓ Successfully flushed changes to disk file.');

// 3. READ BACK FROM DISK (Simulating server restart / page refresh)
console.log('\n--- SIMULATING REFRESH / SERVER RESTART (READ BACK FROM DISK) ---');
const reloadedRaw = fs.readFileSync(dbPath, 'utf8');
const reloadedJson = JSON.parse(reloadedRaw);

const readUser = reloadedJson.users.find(u => u.id === testPatientUserId);
if (!readUser) {
  console.error('FAILED: User not found after disk reload!');
  process.exit(1);
}
console.log(`✓ READ USER VERIFIED: Found ${readUser.name} (${readUser.patientId})`);

const readReminder = reloadedJson.reminders.find(r => r.id === testReminderId && r.userId === testPatientUserId);
if (!readReminder) {
  console.error('FAILED: Reminder not found after disk reload!');
  process.exit(1);
}
console.log(`✓ READ REMINDER VERIFIED: Found "${readReminder.title}" (Status: ${readReminder.status})`);

const readGame = reloadedJson.gameResults.find(g => g.patientUserId === testPatientUserId);
if (!readGame) {
  console.error('FAILED: Game result not found after disk reload!');
  process.exit(1);
}
console.log(`✓ READ GAME RESULT VERIFIED: Found Score ${readGame.score} on ${readGame.gameName}`);

// 4. UPDATE REMINDER STATUS (Mark as Completed)
console.log('\n--- TESTING STATUS UPDATE ---');
readReminder.status = 'COMPLETED';
fs.writeFileSync(dbPath, JSON.stringify(reloadedJson, null, 2), 'utf8');

const updatedJson = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const verifyUpdatedRem = updatedJson.reminders.find(r => r.id === testReminderId);
if (verifyUpdatedRem.status !== 'COMPLETED') {
  console.error('FAILED: Reminder status did not persist as COMPLETED!');
  process.exit(1);
}
console.log('✓ UPDATE STATUS VERIFIED: Reminder is now COMPLETED and persisted to disk.');

// 5. CLEANUP TEST RECORD
console.log('\n--- CLEANING UP TEST RECORD ---');
updatedJson.users = updatedJson.users.filter(u => u.id !== testPatientUserId);
updatedJson.reminders = updatedJson.reminders.filter(r => r.id !== testReminderId);
updatedJson.gameResults = updatedJson.gameResults.filter(g => g.patientUserId !== testPatientUserId);
fs.writeFileSync(dbPath, JSON.stringify(updatedJson, null, 2), 'utf8');
console.log('✓ Test records cleaned up. Database in pristine state.');

console.log('\n=== PERSISTENCE & CRUD VERIFICATION 100% PASSED ===');
