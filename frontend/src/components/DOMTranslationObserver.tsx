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

// Global map to store baseline English text for each DOM text node & input placeholder
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

    const dict = translationsMap[activeLang] || {};

    const translateText = (originalText: string): string => {
      if (activeLang === 'en') return originalText;
      const trimmed = originalText.trim();
      if (!trimmed) return originalText;

      // 1. Exact full phrase match
      if (dict[trimmed]) {
        return originalText.replace(trimmed, dict[trimmed]);
      }

      return originalText;
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 0) {
        const parentTag = node.parentElement?.tagName?.toLowerCase();
        if (parentTag === 'script' || parentTag === 'style' || parentTag === 'code' || parentTag === 'pre') return;

        // Save original baseline
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
