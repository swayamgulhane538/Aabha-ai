import { speechService } from './speechService';
import { api } from './api';

export interface PrescribedMeal {
  id: string;
  mealType: 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER' | 'BEDTIME';
  time: string;
  name: string;
  nameHindi: string;
  nameMarathi: string;
  items: string[];
  itemsHindi: string[];
  itemsMarathi: string[];
  caloriesKcal: number;
  doctorNote: string;
  doctorNoteHindi: string;
  doctorNoteMarathi: string;
  brainNutrients: string[]; // e.g. "Omega-3 DHA", "Curcumin", "Folate"
  textureCategory: 'SOFT' | 'REGULAR' | 'PUREED' | 'LIQUID';
  completed: boolean;
}

export interface DoctorDietProfile {
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital: string;
  dietName: string;
  dietDescription: string;
  dailyCalorieTarget: number;
  dailyWaterTargetLiters: number;
  sodiumLimitMg: number;
  lastPrescribedDate: string;
  meals: PrescribedMeal[];
  foodsToAvoid: { item: string; reason: string }[];
  superfoods: { name: string; benefit: string; emoji: string }[];
}

const STORAGE_KEY = 'aabha_doctor_diet_v2';

const DEFAULT_DOCTOR_DIET: DoctorDietProfile = {
  doctorName: 'Dr. Anita Verma, MD (Neurology)',
  doctorSpecialty: 'Cognitive Neuro-Geriatric Specialist',
  doctorHospital: 'AIIMS & PBCOE Neuro Cognitive Care Unit',
  dietName: 'MIND & Medhya Rasayana Neuro-Protective Clinical Diet',
  dietDescription: 'Evidence-based cognitive nutrition designed to reduce beta-amyloid accumulation, lower neuro-inflammation, and enhance neurotransmitter synthesis in seniors.',
  dailyCalorieTarget: 1750,
  dailyWaterTargetLiters: 2.5,
  sodiumLimitMg: 1500,
  lastPrescribedDate: '2026-08-28',
  meals: [
    {
      id: 'meal-1',
      mealType: 'BREAKFAST',
      time: '08:30 AM',
      name: 'Brain Fuel Oatmeal with Walnuts & Berries',
      nameHindi: 'अखरोट, बादाम और जामुन के साथ दलिया / ओट्स',
      nameMarathi: 'अक्रोड, बदाम आणि बेरीसह पौष्टिक ओट्स',
      items: [
        'Steel-cut Rolled Oats cooked in Almond Milk (1.5 cups)',
        'Crushed Walnuts (Akhrot) (4 halves)',
        'Chia Seeds & Flaxseeds (1 tsp)',
        'Fresh Blueberries or Indian Jamun (1/2 cup)'
      ],
      itemsHindi: [
        'बादाम के दूध में पका हुआ दलिया / ओट्स (1.5 कटोरी)',
        'बारीक कटे अखरोट (4 टुकड़े)',
        'अलसी और चिया के बीज (1 चम्मच)',
        'ताजा जामुन या ब्लूबेरी (आधा कटोरी)'
      ],
      itemsMarathi: [
        'बदाम दुधात शिजवलेले ओट्स (१.५ वाटी)',
        'अक्रोडाचे बारीक तुकडे (४ नग)',
        'जवस आणि चिया बिया (१ चमचा)',
        'ताजी जांभळे किंवा बेरी'
      ],
      caloriesKcal: 380,
      doctorNote: 'Rich in Omega-3 Alpha-Linolenic Acid (ALA) and anthocyanins to protect synaptic membranes.',
      doctorNoteHindi: 'ओमेगा-3 और एंटीऑक्सीडेंट से भरपूर जो मस्तिष्क की याददाश्त कोशिकाओं को मजबूत करते हैं।',
      doctorNoteMarathi: 'ओमेगा-३ आणि अँटिऑक्सिडंट्स मेंदूच्या पेशींना बळकट करतात.',
      brainNutrients: ['Omega-3 ALA', 'Anthocyanins', 'Fiber', 'Vitamin E'],
      textureCategory: 'SOFT',
      completed: true
    },
    {
      id: 'meal-2',
      mealType: 'MID_MORNING',
      time: '11:00 AM',
      name: 'Hydration & Medhya Herbal Elixir',
      nameHindi: 'ब्राह्मी शंखपुष्पी अर्क एवं 4 भीगे बादाम',
      nameMarathi: 'ब्राह्मी-शंखपुष्पी काढा आणि ४ भिजवलेले बदाम',
      items: [
        'Fresh Tender Coconut Water (1 glass)',
        '4 Overnight Soaked and Peeled Almonds (Badam)',
        'Mild Brahmi / Shankhpushpi Herbal Infusion (100ml)'
      ],
      itemsHindi: [
        'ताजा नारियल पानी (1 गिलास)',
        'रातभर भीगे और छिले हुए 4 बादाम',
        'हल्का ब्राह्मी या शंखपुष्पी काढ़ा (100 मिली)'
      ],
      itemsMarathi: [
        'ताजे शहाळ्याचे पाणी (१ ग्लास)',
        'रात्रभर भिजवलेले ४ सोललेले बदाम',
        'हलका ब्राह्मी काढा'
      ],
      caloriesKcal: 120,
      doctorNote: 'Electrolyte balance prevents sudden confusion episodes (delirium) caused by dehydration.',
      doctorNoteHindi: 'इलेक्ट्रोलाइट संतुलन डिहाइड्रेशन के कारण होने वाले भ्रम और सिरदर्द को रोकता है।',
      doctorNoteMarathi: 'शरीरातील पाण्याचे प्रमाण मेंदूला ताजेतवाने ठेवते.',
      brainNutrients: ['Bacosides (Brahmi)', 'Magnesium', 'Electrolytes'],
      textureCategory: 'LIQUID',
      completed: true
    },
    {
      id: 'meal-3',
      mealType: 'LUNCH',
      time: '01:30 PM',
      name: 'Anti-Inflammatory Mindful Thali',
      nameHindi: 'पालक दाल, ज्वार की रोटी, हल्दी लौकी सब्जी और दही',
      nameMarathi: 'पालक डाळ, ज्वारीची भाकरी, दुधी भोपळा आणि ताजे दही',
      items: [
        'Steamed Palak Moong Dal (Spinach Lentil Curry) (1 large bowl)',
        '2 Soft Jowar / Multigrain Rotis with light A2 cow ghee',
        'Turmeric-spiced Bottle Gourd (Lauki) & Carrot Sabzi',
        'Fresh Homemade Probiotic Curd (1 cup)'
      ],
      itemsHindi: [
        'पालक और मूंग दाल (1 बड़ी कटोरी)',
        '2 नरम ज्वार या मल्टीग्रेन रोटियां (हल्के देसी घी के साथ)',
        'हल्दी से पकी लौकी और गाजर की सब्जी',
        'ताजा घर का बना प्रोबायोटिक दही (1 कटोरी)'
      ],
      itemsMarathi: [
        'पालक आणि मुगाची डाळ (१ मोठी वाटी)',
        '२ मऊ ज्वारीच्या भाकऱ्या (साजूक तूप)',
        'हळद घातलेली दुधीची भाजी',
        'ताजे दही (१ वाटी)'
      ],
      caloriesKcal: 560,
      doctorNote: 'High Folate, Lutein and Curcumin from turmeric reduce cerebral neuro-inflammation.',
      doctorNoteHindi: 'पालक का फोलेट और हल्दी का करक्यूमिन मस्तिष्क में सूजन और तनाव कम करते हैं।',
      doctorNoteMarathi: 'पालक आणि हळद मेंदूतील ऑक्सिडेटिव्ह ताण कमी करतात.',
      brainNutrients: ['Curcumin', 'Folate', 'Lutein', 'Probiotics', 'Iron'],
      textureCategory: 'SOFT',
      completed: false
    },
    {
      id: 'meal-4',
      mealType: 'EVENING_SNACK',
      time: '05:00 PM',
      name: 'Roasted Makhana & Golden Turmeric Latte',
      nameHindi: 'भुना हुआ मखाना और हल्का केसर-हल्दी दूध',
      nameMarathi: 'भाजलेले मखाने आणि हळद-दूध',
      items: [
        'Gently Roasted Makhana (Fox Nuts) with Rock Salt & Cumin (1 cup)',
        'Warm Turmeric Almond/Cow Milk with a pinch of Cinnamon (1 small cup)'
      ],
      itemsHindi: [
        'सेंधा नमक और जीरा के साथ भुने मखाने (1 कटोरी)',
        'दालचीनी और हल्दी वाला गुनगुना दूध (1 कप)'
      ],
      itemsMarathi: [
        'जिरे आणि सैंधव मिठात भाजलेले मखाने (१ वाटी)',
        'कोमट हळदीचे दूध (१ कप)'
      ],
      caloriesKcal: 180,
      doctorNote: 'Prevents sunset syndrome / sundowning anxiety by providing steady sustained glucose.',
      doctorNoteHindi: 'शाम के समय चिड़चिड़ापन (Sundowning) रोकने के लिए स्थिर ऊर्जा प्रदान करता है।',
      doctorNoteMarathi: 'संध्याकाळच्या वेळी मेंदूला ऊर्जा आणि शांतता मिळते.',
      brainNutrients: ['Zinc', 'Calcium', 'Curcuminoids'],
      textureCategory: 'REGULAR',
      completed: false
    },
    {
      id: 'meal-5',
      mealType: 'DINNER',
      time: '07:45 PM',
      name: 'Digestive Comfort Moong Khichdi & Soup',
      nameHindi: 'सुपाच्य मूंग दाल खिचड़ी, कद्दू सूप और उबली सब्जियां',
      nameMarathi: 'पचायला हलकी मुगाची खिचडी आणि लाल भोपळ्याचे सूप',
      items: [
        'Soft Moong Dal & Brown Rice Khichdi with Pure Ghee (1.5 cups)',
        'Warm Pumpkin / Tomato Soup with Roasted Cumin (1 bowl)',
        'Steamed Steamed Green Beans & Carrots (1/2 cup)'
      ],
      itemsHindi: [
        'देसी घी के साथ नरम मूंग दाल खिचड़ी (1.5 कटोरी)',
        'भुने जीरे वाला कद्दू / टमाटर का सूप (1 कटोरी)',
        'भाप में पकी बीन्स और गाजर (आधा कटोरी)'
      ],
      itemsMarathi: [
        'साजूक तुपातील मऊ मुगाची खिचडी (१.५ वाटी)',
        'टोमॅटो किंवा भोपळ्याचे गरम सूप',
        'उकडलेल्या भाज्या'
      ],
      caloriesKcal: 420,
      doctorNote: 'Light early dinner ensures restful deep REM sleep, which allows the brain to flush metabolic toxins.',
      doctorNoteHindi: 'हल्का और जल्दी डिनर लेने से गहरी नींद आती है, जिससे दिमाग टॉक्सिन्स बाहर निकालता है।',
      doctorNoteMarathi: 'हलके जेवण रात्री शांत झोप येण्यास मदत करते.',
      brainNutrients: ['Tryptophan', 'Beta-Carotene', 'Complex Carbohydrates'],
      textureCategory: 'SOFT',
      completed: false
    },
    {
      id: 'meal-6',
      mealType: 'BEDTIME',
      time: '09:30 PM',
      name: 'Nutmeg & Saffron Restorative Tonic',
      nameHindi: 'जायफल और केसर वाला गुनगुना दूध',
      nameMarathi: 'जायफळ आणि केशरयुक्त कोमट दूध',
      items: [
        '100ml Warm Milk with a tiny pinch of Nutmeg (Jaiphal) and Saffron (Kesar)'
      ],
      itemsHindi: [
        'चुटकीभर जायफल और 2 धागे केसर वाला गुनगुना दूध (100 मिली)'
      ],
      itemsMarathi: [
        'चिमूटभर जायफळ आणि केशर घातलेले कोमट दूध'
      ],
      caloriesKcal: 90,
      doctorNote: 'Nutmeg stimulates natural GABA neurotransmitters for sound sleep and reduced night-time wandering.',
      doctorNoteHindi: 'जायफल प्राकृतिक नींद लाने में मदद करता है और रात में बेचैनी रोकता है।',
      doctorNoteMarathi: 'जायफळ मेंदूला शांत करून गाढ झोप देते.',
      brainNutrients: ['Myristicin (Nutmeg)', 'Crocin (Saffron)', 'Melatonin Precursors'],
      textureCategory: 'LIQUID',
      completed: false
    }
  ],
  foodsToAvoid: [
    { item: 'Refined White Sugar & Sweet Confectionery', reason: 'Causes rapid insulin spikes and accelerates neuro-inflammation.' },
    { item: 'Deep-Fried & Trans Fat Snacks (Samosa, Pakora)', reason: 'Clogs micro-cerebral blood vessels and impairs cognitive agility.' },
    { item: 'High Sodium Pickles & Canned Foods', reason: 'Raises blood pressure and increases vascular dementia risk.' },
    { item: 'Caffeinated Beverages after 04:00 PM', reason: 'Disrupts sleep architecture and aggravates evening wandering (sundowning).' }
  ],
  superfoods: [
    { name: 'Walnuts (अखरोट)', benefit: 'Highest plant-based Omega-3 DHA for neuron protection.', emoji: '🌰' },
    { name: 'Turmeric & Black Pepper (हल्दी)', benefit: 'Curcumin dissolves cognitive amyloid plaques and calms brain inflammation.', emoji: '🌿' },
    { name: 'Spinach & Greens (पालक)', benefit: 'Rich in Folate, Vitamin K, and Lutein to maintain memory agility.', emoji: '🥬' },
    { name: 'Brahmi & Shankhpushpi (ब्राह्मी)', benefit: 'Ancient Medhya Rasayana herbs proven to enhance synaptic transmission.', emoji: '🌱' },
    { name: 'Blueberries & Jamun (जामुन)', benefit: 'Powerful anthocyanin antioxidants that cross the blood-brain barrier.', emoji: '🫐' },
    { name: 'Pure A2 Cow Ghee (देसी घी)', benefit: 'Carries fat-soluble neuro-nutrients deep into brain tissue.', emoji: '🧈' }
  ]
};

class DietService {
  private profile: DoctorDietProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): DoctorDietProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DOCTOR_DIET;
    } catch {
      return DEFAULT_DOCTOR_DIET;
    }
  }

  private saveProfile(profile: DoctorDietProfile) {
    try {
      this.profile = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-diet-updated', { detail: profile }));
      }
    } catch {}
  }

  public getDietProfile(): DoctorDietProfile {
    return this.profile;
  }

  public toggleMealCompletion(mealId: string): DoctorDietProfile {
    const updatedMeals = this.profile.meals.map(m => {
      if (m.id === mealId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const updated = { ...this.profile, meals: updatedMeals };
    this.saveProfile(updated);
    this.syncDietWithBackend(updated);
    return updated;
  }

  public getCompletionPercentage(): number {
    const total = this.profile.meals.length;
    if (total === 0) return 100;
    const completed = this.profile.meals.filter(m => m.completed).length;
    return Math.round((completed / total) * 100);
  }

  public speakDietSummary(lang: string = 'hi') {
    const nextUncompleted = this.profile.meals.find(m => !m.completed) || this.profile.meals[0];
    let text = '';

    if (lang === 'hi') {
      text = `डॉक्टर अनिता वर्मा द्वारा निर्धारित डाइट प्लान के अनुसार, आपका अगला भोजन ${nextUncompleted.time} पर ${nextUncompleted.nameHindi} है। ${nextUncompleted.doctorNoteHindi}`;
    } else if (lang === 'mr') {
      text = `डॉक्टरांच्या सल्ल्यानुसार, तुमचे पुढील जेवण ${nextUncompleted.time} वाजता ${nextUncompleted.nameMarathi} आहे. ${nextUncompleted.doctorNoteMarathi}`;
    } else {
      text = `According to Dr. Anita Verma's prescribed MIND Diet, your next meal is scheduled for ${nextUncompleted.time}: ${nextUncompleted.name}. ${nextUncompleted.doctorNote}`;
    }

    speechService.speak(text, lang as any);
  }

  private async syncDietWithBackend(profile: DoctorDietProfile) {
    try {
      await api.post('/patient/diet', {
        dietProfile: profile,
        completionPct: this.getCompletionPercentage(),
        timestamp: new Date().toISOString()
      });
    } catch {}
  }
}

export const dietService = new DietService();
