import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import enJson from '../locales/en.json';
import hiJson from '../locales/hi.json';
import mrJson from '../locales/mr.json';
import bnJson from '../locales/bn.json';
import asJson from '../locales/as.json';

const translationsMap: Record<string, Record<string, string>> = {
  hi: hiJson as Record<string, string>,
  mr: mrJson as Record<string, string>,
  bn: bnJson as Record<string, string>,
  as: asJson as Record<string, string>,
  en: enJson as Record<string, string>
};

// Universal fallback translations dictionary for essential terms
const universalExtraDict: Record<string, Record<string, string>> = {
  hi: {
    'Dashboard': 'डैशबोर्ड',
    'Games': 'दिमागी खेल',
    'Reminders': 'रिमाइंडर',
    'My Reports': 'मेरी रिपोर्ट्स',
    'Aabha Chat': 'आभा चैट',
    'AABHA Chat': 'आभा चैट',
    'Memory Passport': 'मेमोरी पासपोर्ट',
    'Medicine Store': 'दवा दुकान',
    'Caregiver Portal': 'केयरगिवर पोर्टल',
    'Admin Portal': 'व्यवस्थापक पोर्टल',
    'Settings': 'सेटिंग्स',
    'Sign In': 'साइन इन करें',
    'Log Out': 'लॉग आउट',
    'Logout': 'लॉग आउट',
    'Emergency SOS': 'आपातकालीन SOS',
    'Quick Actions': 'त्वरित कार्य',
    'Recent Activity': 'हालिया गतिविधियां',
    'Today': 'आज',
    'Completed': 'पूर्ण',
    'Pending': 'लंबित',
    'Taken': 'ले ली गई',
    'Overdue': 'समय बीत गया',
    'Score': 'अंक',
    'Accuracy': 'सटीकता',
    'Time': 'समय',
    'Level': 'स्तर',
    'Easy': 'सरल',
    'Medium': 'मध्यम',
    'Hard': 'कठिन',
    'Hydration': 'जल सेवन',
    'Memory': 'याददाश्त',
    'Attention': 'एकाग्रता',
    'Speed': 'गति',
    'Assist Mode': 'मदद मोड',
    'Notifications': 'सूचनाएं',
    'Start Game': 'खेल प्रारंभ करें',
    'Play Again': 'फिर से खेलें',
    'Exit to Hub': 'खेल हब पर लौटें',
    'Demo Login': 'डेमो लॉगिन',
    'Get Started': 'शुरू करें',
    'Explore AABHA': 'आभा को जानें'
  },
  mr: {
    'Dashboard': 'डॅशबोर्ड',
    'Games': 'मेंदूचे खेळ',
    'Reminders': 'स्मरणपत्रे',
    'My Reports': 'माझे अहवाल',
    'Aabha Chat': 'आभा चॅट',
    'AABHA Chat': 'आभा चॅट',
    'Memory Passport': 'मेमरी पासपोर्ट',
    'Medicine Store': 'औषध दुकान',
    'Caregiver Portal': 'केयरगिव्हर पोर्टल',
    'Admin Portal': 'प्रशासक पोर्टल',
    'Settings': 'सेटिंग्ज',
    'Sign In': 'साइन इन करा',
    'Log Out': 'लॉग आउट',
    'Logout': 'लॉग आउट',
    'Emergency SOS': 'आणीबाणी SOS',
    'Quick Actions': 'जलद कृती',
    'Recent Activity': 'अलीकडील उपक्रम',
    'Today': 'आज',
    'Completed': 'पूर्ण',
    'Pending': 'प्रलंबित',
    'Taken': 'घेतले',
    'Overdue': 'वेळ टळली',
    'Score': 'गुण',
    'Accuracy': 'अचूकता',
    'Time': 'वेळ',
    'Level': 'पातळी',
    'Easy': 'सोपे',
    'Medium': 'मध्यम',
    'Hard': 'कठिन',
    'Hydration': 'पाणी पिणे',
    'Memory': 'स्मरणशक्ती',
    'Attention': 'एकाग्रता',
    'Speed': 'गती',
    'Assist Mode': 'मदत मोड',
    'Notifications': 'सूचना',
    'Start Game': 'खेळ सुरू करा',
    'Play Again': 'पुन्हा खेळा',
    'Exit to Hub': 'गेम्स हबवर परत जा',
    'Demo Login': 'डेमो लॉगिन',
    'Get Started': 'खेळ सुरू करा',
    'Explore AABHA': 'आभा एक्सप्लोर करा'
  },
  bn: {
    'Dashboard': 'ড্যাশবোর্ড',
    'Games': 'মস্তিষ্কের খেলা',
    'Reminders': 'অনুস্মারক',
    'My Reports': 'আমার রিপোর্ট',
    'Aabha Chat': 'আভা চ্যাট',
    'AABHA Chat': 'আভা চ্যাট',
    'Memory Passport': 'স্মৃতি পাসপোর্ট',
    'Medicine Store': 'ওষুধের দোকান',
    'Caregiver Portal': 'কেয়ারগিভার পোর্টাল',
    'Admin Portal': 'অ্যাডমিন পোর্টাল',
    'Settings': 'সেটিংস',
    'Sign In': 'সাইন ইন করুন',
    'Log Out': 'লগ আউট',
    'Logout': 'লগ আউট',
    'Emergency SOS': 'জরুরী SOS',
    'Quick Actions': 'দ্রুত পদক্ষেপ',
    'Recent Activity': 'সাম্প্রতিক কার্যকলাপ',
    'Today': 'আজ',
    'Completed': 'সম্পন্ন',
    'Pending': 'মুলতুবি',
    'Taken': 'নেওয়া হয়েছে',
    'Overdue': 'বিলম্বিত',
    'Score': 'স্কোর',
    'Accuracy': 'নির্ভুলতা',
    'Time': 'সময়',
    'Level': 'স্তর',
    'Easy': 'সহজ',
    'Medium': 'মাঝারি',
    'Hard': 'কঠিন',
    'Hydration': 'জলপান',
    'Memory': 'স্মৃতিশক্তি',
    'Attention': 'মনোযোগ',
    'Speed': 'গতি',
    'Assist Mode': 'সহায়তা মোড',
    'Notifications': 'বিজ্ঞপ্তি',
    'Start Game': 'খেলা শুরু করুন',
    'Play Again': 'আবার খেলুন',
    'Exit to Hub': 'গেমস হাবে ফিরে যান',
    'Demo Login': 'ডেমো লগইন',
    'Get Started': 'শুরু করুন',
    'Explore AABHA': 'আভাকে জানুন'
  },
  as: {
    'Dashboard': 'ডেশ্বৰ্ড',
    'Games': 'মগজুৰ খেল',
    'Reminders': 'সোঁৱৰণী',
    'My Reports': 'মোৰ প্ৰতিবেদন',
    'Aabha Chat': 'আভা চেট',
    'AABHA Chat': 'আভা চেট',
    'Memory Passport': 'স্মৃতি পাছপ’ৰ্ট',
    'Medicine Store': 'ঔষধৰ দোকান',
    'Caregiver Portal': 'কেয়াৰগিভাৰ প’ৰ্টেল',
    'Admin Portal': 'এডমিন প’ৰ্টেল',
    'Settings': 'ছেটিংছ',
    'Sign In': 'ছাইন ইন কৰক',
    'Log Out': 'লগ আউট',
    'Logout': 'লগ আউট',
    'Emergency SOS': 'জৰুৰীকালীন SOS',
    'Quick Actions': 'দ্ৰুত পদক্ষেপ',
    'Recent Activity': 'শেহতীয়া কাম-কাজ',
    'Today': 'আজি',
    'Completed': 'সম্পূৰ্ণ',
    'Pending': 'বাকী থকা',
    'Taken': 'খোৱা হ’ল',
    'Overdue': 'সময় পাৰ হ’ল',
    'Score': 'স্ক’ৰ',
    'Accuracy': 'শুদ্ধতা',
    'Time': 'সময়',
    'Level': 'স্তৰ',
    'Easy': 'সহজ',
    'Medium': 'মধ্যম',
    'Hard': 'কঠিন',
    'Hydration': 'পানী খোৱা',
    'Memory': 'স্মৃতিশক্তি',
    'Attention': 'মনোযোগ',
    'Speed': 'গতি',
    'Assist Mode': 'সহায় ম’ড',
    'Notifications': 'জাননী',
    'Start Game': 'খেল আৰম্ভ কৰক',
    'Play Again': 'পুনৰ খেলক',
    'Exit to Hub': 'গেমছ হাবলৈ ঘূৰি যাওক',
    'Demo Login': 'ডেমো লগইন',
    'Get Started': 'আৰম্ভ কৰক',
    'Explore AABHA': 'আভাক জানক'
  }
};

// Global map to store initial original text for each DOM text node
const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

export const DOMTranslationObserver: React.FC = () => {
  const { i18n } = useTranslation();
  const [activeLang, setActiveLang] = useState<string>(
    () => (i18n.language || 'en').split('-')[0].toLowerCase()
  );

  useEffect(() => {
    const handleLangChange = () => {
      const current = (i18n.language || localStorage.getItem('aabha_lang') || 'en')
        .split('-')[0]
        .toLowerCase();
      setActiveLang(current);
    };

    window.addEventListener('aabha_language_changed', handleLangChange);
    window.addEventListener('storage', handleLangChange);
    i18n.on('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('aabha_language_changed', handleLangChange);
      window.removeEventListener('storage', handleLangChange);
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dict = {
      ...(translationsMap[activeLang] || {}),
      ...(universalExtraDict[activeLang] || {})
    };

    // Sort entries by length descending so longer sentences match first
    const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    const translateText = (originalText: string): string => {
      if (activeLang === 'en') return originalText;
      let result = originalText;
      for (const [enKey, localizedVal] of entries) {
        if (!enKey || !localizedVal || enKey.length < 2) continue;
        const trimmed = result.trim();
        if (trimmed === enKey) {
          result = result.replace(enKey, localizedVal);
        } else if (result.includes(enKey)) {
          const regex = new RegExp(`\\b${enKey.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'g');
          result = result.replace(regex, localizedVal);
        }
      }
      return result;
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 1) {
        const parentTag = node.parentElement?.tagName?.toLowerCase();
        if (parentTag === 'script' || parentTag === 'style' || parentTag === 'code' || parentTag === 'pre') return;

        // Remember original English baseline
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, node.nodeValue);
        }

        const baseline = originalTextMap.get(node) || node.nodeValue;
        if (activeLang === 'en') {
          if (node.nodeValue !== baseline) {
            node.nodeValue = baseline;
          }
        } else {
          const translated = translateText(baseline);
          if (translated !== node.nodeValue) {
            node.nodeValue = translated;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
          if (!originalPlaceholderMap.has(el)) {
            const currentPh = el.getAttribute('placeholder') || '';
            if (currentPh) originalPlaceholderMap.set(el, currentPh);
          }
          const basePh = originalPlaceholderMap.get(el);
          if (basePh) {
            if (activeLang === 'en') {
              el.setAttribute('placeholder', basePh);
            } else if (dict[basePh]) {
              el.setAttribute('placeholder', dict[basePh]);
            }
          }
        }

        for (let i = 0; i < node.childNodes.length; i++) {
          processNode(node.childNodes[i]);
        }
      }
    };

    // Initial translation pass
    processNode(document.body);

    // Mutation observer for dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          processNode(addedNode);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
    };
  }, [activeLang]);

  return null;
};
