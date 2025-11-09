/**
 * Internationalization (i18n) - Simple Translation System
 *
 * Lightweight i18n implementation without external dependencies.
 * Supports Turkish and English with context-based translations.
 *
 * @module shared/lib/i18n
 */

/**
 * Supported languages
 */
export type Language = "tr" | "en";

/**
 * Translation dictionary
 */
export type Translations = Record<string, string | Record<string, string>>;

/**
 * Current language (can be managed by state management)
 */
let currentLanguage: Language = "tr";

/**
 * Get current language
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;

  // Save to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("app-language", lang);
  }

  // Trigger custom event for components to react
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("languagechange", { detail: { language: lang } }),
    );
  }
}

/**
 * Initialize language from localStorage or browser
 */
export function initLanguage(): Language {
  if (typeof window !== "undefined") {
    // Check localStorage first
    const saved = localStorage.getItem("app-language");
    if (saved === "tr" || saved === "en") {
      currentLanguage = saved;
      return saved;
    }

    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("tr")) {
      currentLanguage = "tr";
    } else {
      currentLanguage = "en";
    }
  }

  return currentLanguage;
}

/**
 * Translation function
 *
 * @param key - Translation key (dot-notation supported)
 * @param variables - Optional variables for interpolation
 * @returns Translated string
 *
 * @example
 * ```typescript
 * t('common.save') // => 'Kaydet' or 'Save'
 * t('errors.notFound', { item: 'User' }) // => 'User bulunamadı' or 'User not found'
 * ```
 */
export function t(
  key: string,
  variables?: Record<string, string | number>,
): string {
  const translations = getTranslations(currentLanguage);

  // Get nested translation
  const value = key.split(".").reduce<unknown>((obj, k) => {
    if (obj && typeof obj === "object") {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, translations);

  let text = typeof value === "string" ? value : key;

  // Interpolate variables
  if (variables) {
    Object.entries(variables).forEach(([varKey, varValue]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue));
    });
  }

  return text;
}

/**
 * Get translations for a language
 */
function getTranslations(lang: Language): Translations {
  return lang === "tr" ? translationsTR : translationsEN;
}

/**
 * Turkish translations
 */
const translationsTR: Translations = {
  common: {
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    add: "Ekle",
    search: "Ara",
    filter: "Filtrele",
    export: "Dışa Aktar",
    import: "İçe Aktar",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    warning: "Uyarı",
    info: "Bilgi",
    close: "Kapat",
    back: "Geri",
    next: "İleri",
    previous: "Önceki",
    submit: "Gönder",
    reset: "Sıfırla",
    confirm: "Onayla",
  },
  errors: {
    generic: "Bir hata oluştu",
    notFound: "{item} bulunamadı",
    unauthorized: "Bu işlem için yetkiniz yok",
    validation: "Lütfen tüm alanları doğru doldurun",
    network: "Bağlantı hatası",
    server: "Sunucu hatası",
  },
  optimization: {
    title: "Kesim Optimizasyonu",
    start: "Optimizasyonu Başlat",
    stop: "Durdur",
    results: "Sonuçlar",
    algorithm: "Algoritma",
    stockLength: "Stok Uzunluğu",
    wastePercentage: "Fire Oranı",
    efficiency: "Verimlilik",
  },
  cuttingList: {
    title: "Kesim Listesi",
    create: "Yeni Liste Oluştur",
    items: "Ürünler",
    sections: "Bölümler",
    workOrders: "İş Emirleri",
  },
};

/**
 * English translations
 */
const translationsEN: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    reset: "Reset",
    confirm: "Confirm",
  },
  errors: {
    generic: "An error occurred",
    notFound: "{item} not found",
    unauthorized: "You are not authorized for this action",
    validation: "Please fill all fields correctly",
    network: "Network error",
    server: "Server error",
  },
  optimization: {
    title: "Cutting Optimization",
    start: "Start Optimization",
    stop: "Stop",
    results: "Results",
    algorithm: "Algorithm",
    stockLength: "Stock Length",
    wastePercentage: "Waste Percentage",
    efficiency: "Efficiency",
  },
  cuttingList: {
    title: "Cutting List",
    create: "Create New List",
    items: "Items",
    sections: "Sections",
    workOrders: "Work Orders",
  },
};

// Initialize on module load
if (typeof window !== "undefined") {
  initLanguage();
}
