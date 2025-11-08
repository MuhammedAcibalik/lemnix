/**
 * Lemnix Application Configuration
 * Domain ve brand ayarları
 */

export interface AppConfig {
  domain: string;
  protocol: string;
  apiUrl: string;
  brandName: string;
  brandTagline: string;
  supportEmail: string;
  companyName: string;
  version: string;
}

// Development vs Production ayarları
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const appConfig: AppConfig = {
  // Domain ayarları
  domain: isDevelopment ? 'localhost:3000' : 'www.lemnix.com',
  protocol: isDevelopment ? 'http' : 'https',
  
  // API ayarları
  apiUrl: isDevelopment ? 'http://localhost:5000' : 'https://api.lemnix.com',
  
  // Brand ayarları
  brandName: 'LEMNİX',
  brandTagline: 'Alüminyum Profil Kesim Optimizasyonu Sistemi',
  
  // İletişim bilgileri
  supportEmail: 'destek@lemnix.com',
  companyName: 'Lemnix Teknoloji',
  
  // Versiyon
  version: '1.0.0'
};

// URL helper fonksiyonları
export const getFullDomain = (): string => {
  return `${appConfig.protocol}://${appConfig.domain}`;
};

export const getApiUrl = (endpoint: string = ''): string => {
  return `${appConfig.apiUrl}${endpoint}`;
};

export const getAssetUrl = (path: string): string => {
  return `${getFullDomain()}/assets${path}`;
};

// Meta tag'ler için
export const getMetaTags = () => ({
  title: `${appConfig.brandName} - ${appConfig.brandTagline}`,
  description: `${appConfig.brandTagline}. Profesyonel alüminyum profil kesim optimizasyonu ve iş emri yönetim sistemi.`,
  keywords: 'alüminyum, profil, kesim, optimizasyon, iş emri, yönetim, sistem',
  url: getFullDomain(),
  image: getAssetUrl('/images/lemnix-og-image.jpg'),
  siteName: appConfig.brandName
});
