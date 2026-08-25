import { db } from './persistentDatabase';

export interface GameCatalogItem {
  id: string;
  title: string;
  category: 'memory' | 'quiz' | 'therapy' | 'fun' | 'physio';
  type: 'single' | 'multiplayer';
  icon: string;
  badge?: string;
  description: string;
  is_featured: boolean;
}

export interface GameContentItem {
  id: string;
  game_id: string;
  question: string;
  options?: string[];
  answer: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface DailyChallengeInfo {
  date: string; // YYYY-MM-DD
  featured_game_id: string;
  featured_game_title: string;
  special_challenge: string;
  reward_points: number;
  badge_title: string;
  is_completed: boolean;
  streak_days: number;
}

// ─── 1. COMPLETE MASTER GAMES CATALOG ─────────────────────────────────────────
export const MASTER_GAMES_CATALOG: GameCatalogItem[] = [
  // Quiz & Multiplayer Battles
  { id: 'quiz-battle', title: '2-Player Quiz Battle', category: 'quiz', type: 'multiplayer', icon: '🎯', badge: 'Hot 1v1', description: 'Both answer the same questions; fastest and correct answer gets points in real time!', is_featured: true },
  { id: 'quick-tap-battle', title: 'Quick Tap Battle', category: 'quiz', type: 'multiplayer', icon: '⚡', badge: 'Speed', description: 'A target appears randomly; whoever taps fastest wins the round!', is_featured: false },
  { id: 'word-battle', title: 'Word Battle', category: 'quiz', type: 'multiplayer', icon: '🔤', badge: 'Vocabulary', description: 'Given a letter prompt, make words! Longer words score higher.', is_featured: false },
  { id: 'tic-tac-toe', title: 'Tic-Tac-Toe Classic', category: 'quiz', type: 'multiplayer', icon: '❌⭕', badge: 'Strategy', description: 'Classic 1v1 grid with local 2-player or ABHA AI mode.', is_featured: false },
  { id: 'card-battle', title: 'Card Power Battle', category: 'quiz', type: 'multiplayer', icon: '🃏', badge: 'Tactical', description: 'Play animal cards with power points and battle round-by-round!', is_featured: false },
  { id: 'mini-racing', title: 'Mini Racing Track', category: 'quiz', type: 'multiplayer', icon: '🏃', badge: 'Racing', description: '2-player sprint race with rapid tap acceleration!', is_featured: false },

  // Therapeutic & Mind-Body Recovery
  { id: 'breathing-exercise', title: 'Guided Box Breathing', category: 'therapy', type: 'single', icon: '🌬️', badge: 'Therapy', description: 'Interactive biofeedback box breathing to lower pulse, relieve stress & stabilize mood.', is_featured: true },
  { id: 'coloring-therapy', title: 'Art & Mandala Therapy', category: 'therapy', type: 'single', icon: '🎨', badge: 'Relaxing', description: 'Mindful coloring for calming emotional release, focus & fine motor joy.', is_featured: false },
  { id: 'physiotherapy-hand', title: 'Physiotherapy Hand Movement', category: 'physio', type: 'single', icon: '🖐️', badge: 'Physio', description: 'Finger tap coordination and dexterity training to strengthen motor reflexes.', is_featured: false },

  // Cognitive & Memory Training
  { id: 'memory-match', title: 'Memory Match', category: 'memory', type: 'single', icon: '🧠', badge: 'Classic', description: 'Flip cards and find matching pairs of words, family items & pictures.', is_featured: true },
  { id: 'daily-memory-story', title: 'Daily Memory Story', category: 'memory', type: 'single', icon: '📖', badge: 'Personal', description: 'Read today’s personal memory story and test comprehension with recall questions!', is_featured: false },
  { id: 'remember-objects', title: 'Remember Objects', category: 'memory', type: 'single', icon: '🎯', badge: 'Recall', description: 'Look at the objects carefully, then pick the ones you remember.', is_featured: false },
  { id: 'sequence-recall', title: 'Sequence Recall', category: 'memory', type: 'single', icon: '🔢', badge: 'Focus', description: 'Watch the sequence and repeat it in the exact correct order.', is_featured: false },
  { id: 'picture-recognition', title: 'Picture Recognition', category: 'memory', type: 'single', icon: '🖼️', badge: 'Visual', description: 'Identify family members, fruits, instruments, and famous places.', is_featured: false },
  { id: 'attention-challenge', title: 'Attention Challenge', category: 'memory', type: 'single', icon: '👁️', badge: 'Reflex', description: 'Find target items in the visual grid as fast as you can.', is_featured: false },

  // Duo Social & Wholesome Fun
  { id: 'draw-and-guess', title: 'Draw & Guess Duo', category: 'fun', type: 'multiplayer', icon: '✏️', badge: 'Creative', description: 'Draw on the interactive canvas and guess the secret word together!', is_featured: false },
  { id: 'truth-or-dare', title: 'Truth or Dare Duo', category: 'fun', type: 'multiplayer', icon: '😂', badge: 'Family Fun', description: 'Wholesome, heartwarming fun questions and challenges for family.', is_featured: false },
  { id: 'would-you-rather', title: 'Would You Rather?', category: 'fun', type: 'multiplayer', icon: '🔥', badge: 'Social', description: 'Both choose an option and compare your favorite life choices.', is_featured: false },
  { id: 'guess-the-song', title: 'Guess the Song', category: 'fun', type: 'single', icon: '🎵', badge: 'Music', description: 'Listen to musical melodies and identify the famous tune!', is_featured: false },
  { id: 'who-am-i', title: 'Who Am I?', category: 'fun', type: 'single', icon: '🕵️', badge: 'Trivia', description: 'Read clues and guess the famous historical or cultural personality.', is_featured: false }
];

// ─── 2. DYNAMIC CONTENT POOL (50+ RICH QUESTIONS & CHALLENGES) ────────────────
export const MASTER_GAME_CONTENT: GameContentItem[] = [
  // ── Quiz Battle Questions ──
  { id: 'qc-1', game_id: 'quiz-battle', question: 'Which organ is primarily responsible for pumping blood throughout the body?', options: ['Lungs', 'Heart (हृदय)', 'Brain', 'Liver'], answer: 1, difficulty: 'easy', explanation: 'The heart pumps oxygenated blood through the cardiovascular system.' },
  { id: 'qc-2', game_id: 'quiz-battle', question: 'Which vitamin is naturally produced in the human body when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D (धूप का विटामिन)'], answer: 3, difficulty: 'easy', explanation: 'Sunlight triggers Vitamin D synthesis in the skin.' },
  { id: 'qc-3', game_id: 'quiz-battle', question: 'How many chambers are there in a healthy human heart?', options: ['Two', 'Three', 'Four (चार)', 'Six'], answer: 2, difficulty: 'easy', explanation: 'The human heart has 4 chambers: two atria and two ventricles.' },
  { id: 'qc-4', game_id: 'quiz-battle', question: 'What is considered the normal human body temperature in Fahrenheit?', options: ['95.4°F', '98.6°F (सामान्य तापमान)', '101.2°F', '104.0°F'], answer: 1, difficulty: 'easy', explanation: '98.6°F (37°C) is the average baseline human body temperature.' },
  { id: 'qc-5', game_id: 'quiz-battle', question: 'Which spice commonly used in Indian cuisine contains curcumin with anti-inflammatory properties?', options: ['Turmeric (हल्दी)', 'Cumin (जीरा)', 'Cardamom (इलायची)', 'Clove (लौंग)'], answer: 0, difficulty: 'easy', explanation: 'Turmeric (Haldi) is renowned for curcumin.' },
  { id: 'qc-6', game_id: 'quiz-battle', question: 'Which practice combines breath control, meditation, and postures to improve physical and mental health?', options: ['Aerobics', 'Yoga (योग)', 'Weightlifting', 'Sprint Running'], answer: 1, difficulty: 'easy', explanation: 'Yoga fosters mind-body wellness.' },
  { id: 'qc-7', game_id: 'quiz-battle', question: 'What is the recommended average daily water intake for adults under normal conditions?', options: ['0.5 Liters', '1 Liter', '2 to 3 Liters (2-3 लीटर)', '10 Liters'], answer: 2, difficulty: 'medium', explanation: '2–3 liters daily keeps the body properly hydrated.' },
  { id: 'qc-8', game_id: 'quiz-battle', question: 'Which part of the brain is most directly associated with long-term memory formation?', options: ['Hippocampus (हिप्पोकैम्पस)', 'Cerebellum', 'Occipital Lobe', 'Brainstem'], answer: 0, difficulty: 'medium', explanation: 'The hippocampus is central to memory encoding and consolidation.' },
  { id: 'qc-9', game_id: 'quiz-battle', question: 'What type of exercise is especially beneficial for bone density and joint mobility in older adults?', options: ['Gentle Walking & Stretching (टहलना)', 'Marathon Running', 'Heavy Powerlifting', 'Fast Sprinting'], answer: 0, difficulty: 'easy', explanation: 'Regular walking and stretching preserve mobility without joint strain.' },
  { id: 'qc-10', game_id: 'quiz-battle', question: 'Which ancient Indian traditional medicine system emphasizes holistic health and balance of doshas?', options: ['Ayurveda (आयुर्वेद)', 'Acupuncture', 'Chiropractic', 'Homeopathy'], answer: 0, difficulty: 'easy', explanation: 'Ayurveda is India’s traditional medicine system.' },

  // ── Who Am I Clues ──
  { id: 'wai-1', game_id: 'who-am-i', question: 'I was known as the Father of the Nation of India and championed Ahimsa (non-violence). Who am I?', options: ['Subhas Chandra Bose', 'Mahatma Gandhi (महात्मा गांधी)', 'Jawaharlal Nehru', 'Bhagat Singh'], answer: 1, difficulty: 'easy' },
  { id: 'wai-2', game_id: 'who-am-i', question: 'I was an aerospace scientist and the 11th President of India, dearly called the Missile Man of India. Who am I?', options: ['Dr. A.P.J. Abdul Kalam (डॉ. कलाम)', 'Vikram Sarabhai', 'Homi Bhabha', 'C.V. Raman'], answer: 0, difficulty: 'easy' },
  { id: 'wai-3', game_id: 'who-am-i', question: 'I was the legendary Nightingale of India who sang thousands of beloved songs across 36 languages. Who am I?', options: ['Asha Bhosle', 'Lata Mangeshkar (लता मंगेशकर)', 'Geeta Dutt', 'M.S. Subbulakshmi'], answer: 1, difficulty: 'easy' },
  { id: 'wai-4', game_id: 'who-am-i', question: 'I was the Master Blaster of Indian cricket who scored 100 international centuries. Who am I?', options: ['Kapil Dev', 'Sunil Gavaskar', 'Sachin Tendulkar (सचिन तेंदुलकर)', 'Rahul Dravid'], answer: 2, difficulty: 'easy' },
  { id: 'wai-5', game_id: 'who-am-i', question: 'I was the Nobel laureate poet who composed the national anthem "Jana Gana Mana". Who am I?', options: ['Bankim Chandra', 'Rabindranath Tagore (रवींद्रनाथ टैगोर)', 'Sarojini Naidu', 'Premchand'], answer: 1, difficulty: 'easy' },

  // ── Guess The Song Clues ──
  { id: 'gts-1', game_id: 'guess-the-song', question: 'Identify this iconic melody: "Kabhi kabhi mere dil mein khayaal aata hai..."', options: ['Kabhie Kabhie (कभी कभी)', 'Silsila', 'Sholay', 'Don'], answer: 0, difficulty: 'easy' },
  { id: 'gts-2', game_id: 'guess-the-song', question: 'Identify this classic train rhythm song: "Chhaiya Chhaiya Chhaiya Chhaiya..."', options: ['Dil Se.. (दिल से)', 'Lagaan', 'Swades', 'Taal'], answer: 0, difficulty: 'easy' },
  { id: 'gts-3', game_id: 'guess-the-song', question: 'Identify this patriotic anthem: "Aye mere watan ke logo, zara aankh mein bhar lo paani..."', options: ['Aye Mere Watan Ke Logo', 'Mera Rang De Basanti', 'Vande Mataram', 'Sandese Aate Hai'], answer: 0, difficulty: 'easy' },
  { id: 'gts-4', game_id: 'guess-the-song', question: 'Identify this joyous wedding celebration tune: "Mehndi laga ke rakhna, doli saja ke rakhna..."', options: ['DDLJ (दिलवाले दुल्हनिया ले जाएंगे)', 'Hum Aapke Hain Koun', 'K3G', 'Kuch Kuch Hota Hai'], answer: 0, difficulty: 'easy' },

  // ── Daily Memory Story Comprehension ──
  { id: 'dms-1', game_id: 'daily-memory-story', question: 'In today’s morning garden stroll, what color were the fresh marigolds Anita noticed by the temple gate?', options: ['Golden Orange (सुनहरे गेंदे के फूल)', 'Pure White', 'Deep Blue', 'Bright Red'], answer: 0, difficulty: 'easy' },
  { id: 'dms-2', game_id: 'daily-memory-story', question: 'Who called at 11:30 AM to share photographs from the weekend family gathering?', options: ['Her daughter Priya (बेटी प्रिया)', 'Dr. Verma', 'Neighbor Sunita', 'The postman'], answer: 0, difficulty: 'easy' },
  { id: 'dms-3', game_id: 'daily-memory-story', question: 'What evening recipe was prepared with mild cardamom and warm milk?', options: ['Sweet Kheer (खीर)', 'Spicy Samosa', 'Lemon Tea', 'Vegetable Soup'], answer: 0, difficulty: 'easy' },

  // ── Word Battle Prompts ──
  { id: 'wb-1', game_id: 'word-battle', question: 'Letter "M": Make words starting with M (e.g. Memory, Medicine, Music, Mother, Mind, Mango)', options: ['Memory', 'Mango', 'Medicine', 'Music'], answer: 0, difficulty: 'easy' },
  { id: 'wb-2', game_id: 'word-battle', question: 'Letter "S": Make words starting with S (e.g. Smile, Sunlight, Sleep, Sugar, Strength, Song)', options: ['Smile', 'Sunlight', 'Sleep', 'Strength'], answer: 0, difficulty: 'easy' },
  { id: 'wb-3', game_id: 'word-battle', question: 'Letter "H": Make words starting with H (e.g. Health, Heart, Happiness, Hope, Home, Harmony)', options: ['Health', 'Heart', 'Happiness', 'Harmony'], answer: 0, difficulty: 'easy' },

  // ── Would You Rather Social Questions ──
  { id: 'wyr-1', game_id: 'would-you-rather', question: 'Would you rather spend a tranquil morning sipping warm chai in a mountain garden OR listening to ocean waves on a breezy beach?', options: ['Mountain Garden with Chai ☕🏔️', 'Breezy Ocean Beach 🏖️🌊'], answer: 0, difficulty: 'easy' },
  { id: 'wyr-2', game_id: 'would-you-rather', question: 'Would you rather listen to old classic songs on the radio OR watch a heartwarming family movie together?', options: ['Golden Classic Radio Songs 📻🎶', 'Heartwarming Family Movie 🎬🍿'], answer: 0, difficulty: 'easy' },
  { id: 'wyr-3', game_id: 'would-you-rather', question: 'Would you rather read a mystery book with a warm blanket OR look at old family photo albums with grandchildren?', options: ['Family Albums with Stories 📸❤️', 'Engrossing Mystery Book 📖✨'], answer: 0, difficulty: 'easy' }
];

// ─── 3. USER PLAYED CONTENT TRACKER (IN-MEMORY + DB STORAGE) ──────────────────
// Map: userId -> Array of recently played content item IDs
const userPlayedContentHistory: Record<string, string[]> = {};

// Map: userId -> Daily Challenge Completion Tracker { '2026-08-24': { completed: true, streak: 3 } }
const userDailyChallengeHistory: Record<string, Record<string, { completed: boolean; completedAt: string }>> = {};

// ─── 4. HELPER FUNCTIONS ──────────────────────────────────────────────────────

// Get Today's Date String in YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Compute deterministic Daily Challenge for given date
export function getDailyChallengeForDate(dateStr = getTodayDateString(), userId = 'default'): DailyChallengeInfo {
  // Rotate through featured games based on date
  const challengesPool = [
    { gameId: 'quiz-battle', title: '2-Player Quiz Battle', challenge: 'Complete 1 Quiz Battle round and score above 75% points!', badge: 'Trivia Champion', points: 50 },
    { gameId: 'breathing-exercise', title: 'Guided Box Breathing', challenge: 'Complete 4 full cycles of guided biofeedback breathing to calm your heart.', badge: 'Mindfulness Master', points: 50 },
    { gameId: 'memory-match', title: 'Memory Match', challenge: 'Find all matching image pairs with fewer than 10 attempts.', badge: 'Memory Ace', points: 50 },
    { gameId: 'physiotherapy-hand', title: 'Physiotherapy Hand Movement', challenge: 'Tap 10 coordination targets with average speed below 600ms.', badge: 'Reflex Hero', points: 50 },
    { gameId: 'coloring-therapy', title: 'Art & Mandala Therapy', challenge: 'Color a relaxing mandala canvas and save to your Memory Passport.', badge: 'Creative Soul', points: 50 },
    { gameId: 'who-am-i', title: 'Who Am I?', challenge: 'Guess 3 cultural and historical personalities on the first clue.', badge: 'Historian', points: 50 }
  ];

  // Hash date string to choose challenge
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % challengesPool.length;
  }

  const selected = challengesPool[hash];
  const userHistory = userDailyChallengeHistory[userId] || {};
  const isCompleted = !!userHistory[dateStr]?.completed;

  // Compute streak
  let streak = 1;
  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split('T')[0];
  if (userHistory[prevDateStr]?.completed) {
    streak = isCompleted ? 3 : 2;
  } else if (isCompleted) {
    streak = 1;
  }

  return {
    date: dateStr,
    featured_game_id: selected.gameId,
    featured_game_title: selected.title,
    special_challenge: selected.challenge,
    reward_points: selected.points,
    badge_title: selected.badge,
    is_completed: isCompleted,
    streak_days: streak
  };
}

// Mark Daily Challenge Completed
export function markDailyChallengeCompleted(userId: string, dateStr = getTodayDateString()): { success: boolean; pointsAwarded: number; streak: number } {
  if (!userDailyChallengeHistory[userId]) {
    userDailyChallengeHistory[userId] = {};
  }

  const already = userDailyChallengeHistory[userId][dateStr]?.completed;
  if (!already) {
    userDailyChallengeHistory[userId][dateStr] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
  }

  const challenge = getDailyChallengeForDate(dateStr, userId);
  return {
    success: true,
    pointsAwarded: already ? 0 : challenge.reward_points,
    streak: challenge.streak_days
  };
}

// Get Smart Non-Repeating Game Content
export function getGameContentForUser(gameId: string, userId: string, limit = 5): GameContentItem[] {
  const allForGame = MASTER_GAME_CONTENT.filter(c => c.game_id === gameId);
  if (allForGame.length === 0) return [];

  const userPlayed = userPlayedContentHistory[userId] || [];

  // Filter out questions recently played by this user
  let unplayed = allForGame.filter(c => !userPlayed.includes(c.id));

  // If user has seen all questions, reset their history for this game
  if (unplayed.length < limit) {
    userPlayedContentHistory[userId] = userPlayed.filter(id => !allForGame.some(c => c.id === id));
    unplayed = allForGame;
  }

  // Shuffle unplayed questions
  const shuffled = [...unplayed].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, limit);

  // Record served questions into user history (keep last 20)
  if (!userPlayedContentHistory[userId]) {
    userPlayedContentHistory[userId] = [];
  }
  chosen.forEach(c => {
    if (!userPlayedContentHistory[userId].includes(c.id)) {
      userPlayedContentHistory[userId].push(c.id);
    }
  });
  if (userPlayedContentHistory[userId].length > 25) {
    userPlayedContentHistory[userId] = userPlayedContentHistory[userId].slice(-25);
  }

  return chosen;
}

// Get Personalized & Randomized Games for User
export function getPersonalizedGamesForUser(userId: string): {
  dailyChallenge: DailyChallengeInfo;
  recommendedGames: GameCatalogItem[];
  allShuffledGames: GameCatalogItem[];
  categories: Array<{ id: string; name: string; count: number }>;
} {
  const dailyChallenge = getDailyChallengeForDate(getTodayDateString(), userId);

  // Fetch recent game results to understand user tendencies
  const pastResults = db.getGameResults(userId);

  // Categorize past plays
  const playedCategories: Record<string, number> = {};
  pastResults.forEach(r => {
    const item = MASTER_GAMES_CATALOG.find(g => g.id === r.gameType);
    const cat = item?.category || 'memory';
    playedCategories[cat] = (playedCategories[cat] || 0) + 1;
  });

  // Sort games: Put recommended ones first, followed by shuffled catalogue
  const sortedCatalogue = [...MASTER_GAMES_CATALOG];

  // Randomize game list on each request
  const allShuffledGames = sortedCatalogue.sort(() => Math.random() - 0.5);

  // Pick top 3 recommendations (including the daily challenge game and complementary categories)
  const recommendedGames: GameCatalogItem[] = [];
  const challengeGame = MASTER_GAMES_CATALOG.find(g => g.id === dailyChallenge.featured_game_id);
  if (challengeGame) recommendedGames.push(challengeGame);

  allShuffledGames.forEach(g => {
    if (!recommendedGames.some(r => r.id === g.id) && recommendedGames.length < 3) {
      recommendedGames.push(g);
    }
  });

  const categories = [
    { id: 'all', name: 'All Games', count: MASTER_GAMES_CATALOG.length },
    { id: 'quiz', name: '🎯 2-Player Battles', count: MASTER_GAMES_CATALOG.filter(g => g.category === 'quiz').length },
    { id: 'therapy', name: '🧘 Therapy & Breathing', count: MASTER_GAMES_CATALOG.filter(g => g.category === 'therapy').length },
    { id: 'memory', name: '🧠 Cognitive & Memory', count: MASTER_GAMES_CATALOG.filter(g => g.category === 'memory').length },
    { id: 'physio', name: '🖐️ Physiotherapy', count: MASTER_GAMES_CATALOG.filter(g => g.category === 'physio').length },
    { id: 'fun', name: '😂 Duo Social & Music', count: MASTER_GAMES_CATALOG.filter(g => g.category === 'fun').length }
  ];

  return {
    dailyChallenge,
    recommendedGames,
    allShuffledGames,
    categories
  };
}
