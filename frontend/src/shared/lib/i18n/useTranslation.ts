/**
 * useTranslation Hook
 *
 * React hook for translations with reactive language changes.
 *
 * @module shared/lib/i18n/useTranslation
 */

import { useState, useEffect } from "react";
import { t, getCurrentLanguage, setLanguage, type Language } from "./index";

/**
 * Translation hook return type
 */
interface UseTranslationReturn {
  t: typeof t;
  language: Language;
  setLanguage: (lang: Language) => void;
}

/**
 * useTranslation Hook
 *
 * @returns Translation utilities and current language
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { t, language, setLanguage } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t('common.title')}</h1>
 *       <button onClick={() => setLanguage('en')}>English</button>
 *       <button onClick={() => setLanguage('tr')}>Türkçe</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(): UseTranslationReturn {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = (event: Event): void => {
      const customEvent = event as CustomEvent<{ language: Language }>;
      setLanguageState(customEvent.detail.language);
    };

    window.addEventListener("languagechange", handleLanguageChange);

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange);
    };
  }, []);

  const handleSetLanguage = (lang: Language): void => {
    setLanguage(lang);
    setLanguageState(lang);
  };

  return {
    t,
    language,
    setLanguage: handleSetLanguage,
  };
}
