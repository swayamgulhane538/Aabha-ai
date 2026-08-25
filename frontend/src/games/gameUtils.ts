export interface WordItem {
  id: string;
  emoji: string;
  en: string;
  hi: string;
  mr: string;
}

export const MATCH_ITEMS: WordItem[] = [
  { id: 'apple', emoji: '🍎', en: 'Apple', hi: 'सेब (Apple)', mr: 'सफरचंद (Apple)' },
  { id: 'elephant', emoji: '🐘', en: 'Elephant', hi: 'हाथी (Elephant)', mr: 'हत्ती (Elephant)' },
  { id: 'sun', emoji: '☀️', en: 'Sun', hi: 'सूरज (Sun)', mr: 'सूर्य (Sun)' },
  { id: 'flower', emoji: '🌸', en: 'Flower', hi: 'फूल (Flower)', mr: 'फूल (Flower)' },
  { id: 'tea', emoji: '☕', en: 'Tea', hi: 'चाय (Tea)', mr: 'चहा (Tea)' },
  { id: 'tree', emoji: '🌳', en: 'Tree', hi: 'पेड़ (Tree)', mr: 'झाड (Tree)' },
  { id: 'bird', emoji: '🐦', en: 'Bird', hi: 'चिड़िया (Bird)', mr: 'पक्षी (Bird)' },
  { id: 'book', emoji: '📖', en: 'Book', hi: 'किताब (Book)', mr: 'पुस्तक (Book)' },
  { id: 'house', emoji: '🏠', en: 'House', hi: 'घर (House)', mr: 'घर (House)' },
  { id: 'car', emoji: '🚗', en: 'Car', hi: 'गाड़ी (Car)', mr: 'गाडी (Car)' },
  { id: 'water', emoji: '💧', en: 'Water', hi: 'पानी (Water)', mr: 'पाणी (Water)' },
  { id: 'star', emoji: '⭐', en: 'Star', hi: 'तारा (Star)', mr: 'चांदणी (Star)' },
];

export const EMOJI_SETS = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
  fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
  objects: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼'],
  nature: ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏐', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑']
};

export const DIFFICULTY_CONFIG = {
  memoryMatch: (level: number) => {
    if (level <= 3) return { rows: 2, cols: 3, pairs: 3 };
    if (level <= 7) return { rows: 3, cols: 4, pairs: 6 };
    return { rows: 4, cols: 4, pairs: 8 };
  },
  rememberObjects: (level: number) => {
    if (level <= 3) return { objects: 3, distractors: 3, timeLimit: 10 };
    if (level <= 7) return { objects: 5, distractors: 5, timeLimit: 8 };
    return { objects: 8, distractors: 8, timeLimit: 5 };
  },
  sequenceRecall: (level: number) => {
    if (level <= 3) return { items: 3 };
    if (level <= 7) return { items: 5 };
    return { items: 8 };
  },
  attentionChallenge: (level: number) => {
    if (level <= 3) return { grid: 3, targets: 2, timeLimit: 20 };
    if (level <= 7) return { grid: 4, targets: 3, timeLimit: 15 };
    return { grid: 5, targets: 5, timeLimit: 10 };
  },
  pictureRecognition: (level: number) => {
    if (level <= 3) return { questions: 5 };
    if (level <= 7) return { questions: 7 };
    return { questions: 10 };
  }
};

export const calculateScore = (correct: number, total: number, timeTaken: number, maxTime: number = 60) => {
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const timeBonus = Math.max(0, maxTime - timeTaken) * 10;
  const score = (correct * 100) + timeBonus;
  
  return {
    score: Math.round(score),
    maxScore: (total * 100) + (maxTime * 10),
    accuracy: Math.round(accuracy)
  };
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getRandomEmojis = (count: number, category?: keyof typeof EMOJI_SETS): string[] => {
  let allEmojis: string[] = [];
  if (category && EMOJI_SETS[category]) {
    allEmojis = [...EMOJI_SETS[category]];
  } else {
    Object.values(EMOJI_SETS).forEach(set => {
      allEmojis = [...allEmojis, ...set];
    });
  }
  
  const shuffled = shuffleArray(allEmojis);
  return shuffled.slice(0, count);
};

export const getRandomWordItems = (count: number): WordItem[] => {
  const shuffled = shuffleArray(MATCH_ITEMS);
  return shuffled.slice(0, count);
};
