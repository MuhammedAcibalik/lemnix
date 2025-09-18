import fs from 'fs';
import path from 'path';

/**
 * Enterprise-Grade Smart Suggestion Service
 * 
 * Bu servis geçmiş verilere dayalı olarak akıllı öneriler sunar:
 * - Auto-complete önerileri
 * - Confidence scoring ile güvenilirlik
 * - Frequency analysis ile popülerlik
 * - Pattern matching ile tutarlılık
 * - Real-time learning ile güncelleme
 */

interface SmartDatabase {
    metadata: {
        createdAt: string;
        totalLists: number;
        totalItems: number;
        totalProfiles: number;
        analysisVersion: string;
        uniqueProducts: number;
        uniqueSizes: number;
        uniqueProfiles: number;
        uniqueColors: number;
        highConfidenceSuggestions: number;
        mediumConfidenceSuggestions: number;
        lowConfidenceSuggestions: number;
    };
    productSuggestions: Record<string, ProductSuggestion>;
    sizeSuggestions: Record<string, SizeSuggestion>;
    profileSuggestions: Record<string, ProfileSuggestion>;
    combinationSuggestions: Record<string, CombinationSuggestion>;
    colorSuggestions: Record<string, ColorSuggestion>;
    workOrderPatterns: Record<string, WorkOrderPattern>;
    measurementPatterns: Record<string, MeasurementPattern>;
    autoComplete: AutoCompleteDatabase;
    confidence: ConfidenceDatabase;
}

interface ProductSuggestion {
    totalOccurrences: number;
    sizes: Record<string, number>;
    profiles: Record<string, number>;
    colors: Record<string, number>;
    measurements: Record<string, number>;
    workOrders: string[];
    averageOrderQuantity: number;
    commonSizes: string[];
    commonProfiles: string[];
    commonColors: string[];
}

interface SizeSuggestion {
    products: Record<string, number>;
    profiles: Record<string, number>;
    totalUsage: number;
}

interface ProfileSuggestion {
    products: Record<string, number>;
    sizes: Record<string, number>;
    measurements: Record<string, number>;
    totalUsage: number;
    averageQuantity: number;
}

interface CombinationSuggestion {
    product: string;
    size: string;
    profiles: Record<string, number>;
    colors: Record<string, number>;
    measurements: Record<string, number>;
    totalUsage: number;
    averageOrderQuantity: number;
}

interface ColorSuggestion {
    products: Record<string, number>;
    totalUsage: number;
}

interface WorkOrderPattern {
    product: string;
    size: string;
    orderQuantity: number;
    profileCounts: Record<number, number>;
    totalOccurrences: number;
}

interface MeasurementPattern {
    products: Record<string, number>;
    profiles: Record<string, number>;
    totalUsage: number;
}

interface AutoCompleteDatabase {
    products: Record<string, AutoCompleteItem>;
    sizes: Record<string, AutoCompleteItem>;
    profiles: Record<string, AutoCompleteItem>;
    colors: Record<string, AutoCompleteItem>;
    measurements: Record<string, AutoCompleteItem>;
}

interface AutoCompleteItem {
    frequency: number;
    commonSizes?: string[];
    commonProfiles?: string[];
    commonColors?: string[];
    commonProducts?: string[];
    averageQuantity?: number;
}

interface ConfidenceDatabase {
    high: ConfidenceSuggestion[];
    medium: ConfidenceSuggestion[];
    low: ConfidenceSuggestion[];
}

interface ConfidenceSuggestion {
    key: string;
    product: string;
    size: string;
    confidence: number;
    totalUsage: number;
    suggestedProfiles: SuggestedProfile[];
}

interface SuggestedProfile {
    profile: string;
    frequency: number;
    confidence: number;
}

// Smart Suggestion Response Types
export interface SmartSuggestionResponse {
    success: boolean;
    data: SmartSuggestion[];
    confidence: 'high' | 'medium' | 'low';
    totalSuggestions: number;
    message?: string;
}

export interface SmartSuggestion {
    type: 'product' | 'size' | 'profile' | 'color' | 'measurement';
    value: string;
    confidence: number;
    frequency: number;
    context?: {
        relatedProducts?: string[];
        relatedSizes?: string[];
        relatedProfiles?: string[];
        relatedColors?: string[];
        averageQuantity?: number;
    };
    reasoning: string;
}

export interface AutoCompleteSuggestion {
    value: string;
    type: 'product' | 'size' | 'profile' | 'color' | 'measurement';
    frequency: number;
    confidence: number;
    preview?: string;
}

export interface ProfileSuggestionResponse {
    success: boolean;
    data: ProfileSuggestionItem[];
    totalSuggestions: number;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
}

export interface ProfileSuggestionItem {
    profile: string;
    suggestedQuantity: number;
    confidence: number;
    frequency: number;
    reasoning: string;
}

class SmartSuggestionService {
    private database: SmartDatabase | null = null;
    private readonly databasePath = path.join(__dirname, '../../../smart_suggestion_database.json');
    private lastLoadTime = 0;
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 dakika cache

    /**
     * Veritabanını yükle (cache ile)
     */
    private loadDatabase(): SmartDatabase {
        const now = Date.now();
        
        // Cache kontrolü
        if (this.database && (now - this.lastLoadTime) < this.cacheTimeout) {
            return this.database;
        }
        
        try {
            if (!fs.existsSync(this.databasePath)) {
                throw new Error('Smart suggestion database not found');
            }
            
            const data = fs.readFileSync(this.databasePath, 'utf-8');
            this.database = JSON.parse(data);
            this.lastLoadTime = now;
            
            console.log('[SMART-SUGGESTION] Database loaded:', {
                products: this.database?.metadata.uniqueProducts,
                items: this.database?.metadata.totalItems,
                profiles: this.database?.metadata.totalProfiles
            });
            
            return this.database!;
            
        } catch (error) {
            console.error('[SMART-SUGGESTION] Database load error:', error);
            throw new Error('Failed to load smart suggestion database');
        }
    }

    /**
     * Ürün bazlı akıllı öneriler
     */
    public getProductSuggestions(
        query: string = '',
        limit: number = 10
    ): SmartSuggestionResponse {
        try {
            const db = this.loadDatabase();
            const suggestions: SmartSuggestion[] = [];
            
            const queryUpper = query.toUpperCase();
            
            // Exact match'ler önce
            const exactMatches = Object.entries(db.autoComplete.products)
                .filter(([product]) => product.includes(queryUpper))
                .sort((a, b) => b[1].frequency - a[1].frequency)
                .slice(0, limit);
            
            exactMatches.forEach(([product, data]) => {
                const confidence = this.calculateProductConfidence(product, data.frequency, db);
                
                suggestions.push({
                    type: 'product',
                    value: product,
                    confidence,
                    frequency: data.frequency,
                    context: {
                        ...(data.commonSizes && { relatedSizes: data.commonSizes }),
                        ...(data.commonProfiles && { relatedProfiles: data.commonProfiles }),
                        ...(data.commonColors && { relatedColors: data.commonColors })
                    },
                    reasoning: `${data.frequency} kez kullanıldı, %${confidence} güven skoru`
                });
            });
            
            // Fuzzy match'ler sonra
            if (suggestions.length < limit && queryUpper.length > 2) {
                const fuzzyMatches = Object.entries(db.autoComplete.products)
                    .filter(([product]) => 
                        !exactMatches.find(([p]) => p === product) &&
                        this.fuzzyMatch(product, queryUpper)
                    )
                    .sort((a, b) => b[1].frequency - a[1].frequency)
                    .slice(0, limit - suggestions.length);
                
                fuzzyMatches.forEach(([product, data]) => {
                    const confidence = this.calculateProductConfidence(product, data.frequency, db);
                    
                    suggestions.push({
                        type: 'product',
                        value: product,
                        confidence,
                        frequency: data.frequency,
                        context: {
                            ...(data.commonSizes && { relatedSizes: data.commonSizes }),
                            ...(data.commonProfiles && { relatedProfiles: data.commonProfiles }),
                            ...(data.commonColors && { relatedColors: data.commonColors })
                        },
                        reasoning: `Benzer ürün, ${data.frequency} kez kullanıldı`
                    });
                });
            }
            
            const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
            const confidenceLevel = avgConfidence >= 80 ? 'high' : avgConfidence >= 60 ? 'medium' : 'low';
            
            return {
                success: true,
                data: suggestions,
                confidence: confidenceLevel,
                totalSuggestions: suggestions.length
            };
            
        } catch (error) {
            console.error('[SMART-SUGGESTION] Product suggestion error:', error);
            return {
                success: false,
                data: [],
                confidence: 'low',
                totalSuggestions: 0,
                message: 'Ürün önerisi alınamadı'
            };
        }
    }

    /**
     * Size bazlı akıllı öneriler
     */
    public getSizeSuggestions(
        productName?: string,
        query: string = '',
        limit: number = 10
    ): SmartSuggestionResponse {
        try {
            const db = this.loadDatabase();
            const suggestions: SmartSuggestion[] = [];
            
            const queryUpper = query.toUpperCase();
            
            if (productName) {
                // Belirli ürün için size önerileri
                const productUpper = productName.toUpperCase();
                const productData = db.productSuggestions[productUpper];
                
                if (productData) {
                    const sortedSizes = Object.entries(productData.sizes)
                        .filter(([size]) => size.includes(queryUpper))
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, limit);
                    
                    sortedSizes.forEach(([size, frequency]) => {
                        const confidence = Math.min(100, (frequency / productData.totalOccurrences) * 100);
                        
                        suggestions.push({
                            type: 'size',
                            value: size,
                            confidence,
                            frequency,
                            context: {
                                relatedProducts: [productUpper]
                            },
                            reasoning: `${productUpper} için ${frequency} kez kullanıldı`
                        });
                    });
                }
            } else {
                // Genel size önerileri
                const sizeMatches = Object.entries(db.autoComplete.sizes)
                    .filter(([size]) => size.includes(queryUpper))
                    .sort((a, b) => b[1].frequency - a[1].frequency)
                    .slice(0, limit);
                
                sizeMatches.forEach(([size, data]) => {
                    const confidence = this.calculateSizeConfidence(size, data.frequency, db);
                    
                    suggestions.push({
                        type: 'size',
                        value: size,
                        confidence,
                        frequency: data.frequency,
                        context: {
                            ...(data.commonProducts && { relatedProducts: data.commonProducts }),
                            ...(data.commonProfiles && { relatedProfiles: data.commonProfiles })
                        },
                        reasoning: `${data.frequency} kez kullanıldı, popüler size`
                    });
                });
            }
            
            const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
            const confidenceLevel = avgConfidence >= 80 ? 'high' : avgConfidence >= 60 ? 'medium' : 'low';
            
            return {
                success: true,
                data: suggestions,
                confidence: confidenceLevel,
                totalSuggestions: suggestions.length
            };
            
        } catch (error) {
            console.error('[SMART-SUGGESTION] Size suggestion error:', error);
            return {
                success: false,
                data: [],
                confidence: 'low',
                totalSuggestions: 0,
                message: 'Size önerisi alınamadı'
            };
        }
    }

    /**
     * Profil bazlı akıllı öneriler
     */
    public getProfileSuggestions(
        productName?: string,
        size?: string,
        query: string = '',
        limit: number = 15
    ): ProfileSuggestionResponse {
        try {
            const db = this.loadDatabase();
            const suggestions: ProfileSuggestionItem[] = [];
            
            const queryUpper = query.toUpperCase();
            
            if (productName && size) {
                // Kombinasyon bazlı öneri (en yüksek güven)
                const comboKey = `${productName.toUpperCase()}|${size.toUpperCase()}`;
                const comboData = db.combinationSuggestions[comboKey];
                
                if (comboData) {
                    const sortedProfiles = Object.entries(comboData.profiles)
                        .filter(([profile]) => queryUpper === '' || profile.includes(queryUpper))
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, limit);
                    
                    sortedProfiles.forEach(([profile, frequency]) => {
                        const confidence = Math.min(100, (frequency / comboData.totalUsage) * 100);
                        const avgQuantity = db.profileSuggestions[profile]?.averageQuantity || 1;
                        
                        suggestions.push({
                            profile,
                            suggestedQuantity: Math.round(avgQuantity),
                            confidence,
                            frequency,
                            reasoning: `${productName} + ${size} kombinasyonunda ${frequency} kez kullanıldı`
                        });
                    });
                }
            } else if (productName) {
                // Ürün bazlı öneri
                const productUpper = productName.toUpperCase();
                const productData = db.productSuggestions[productUpper];
                
                if (productData) {
                    const sortedProfiles = Object.entries(productData.profiles)
                        .filter(([profile]) => queryUpper === '' || profile.includes(queryUpper))
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, limit);
                    
                    sortedProfiles.forEach(([profile, frequency]) => {
                        const confidence = Math.min(100, (frequency / productData.totalOccurrences) * 100);
                        const avgQuantity = db.profileSuggestions[profile]?.averageQuantity || 1;
                        
                        suggestions.push({
                            profile,
                            suggestedQuantity: Math.round(avgQuantity),
                            confidence,
                            frequency,
                            reasoning: `${productName} için ${frequency} kez kullanıldı`
                        });
                    });
                }
            } else {
                // Genel profil önerileri
                const profileMatches = Object.entries(db.autoComplete.profiles)
                    .filter(([profile]) => queryUpper === '' || profile.includes(queryUpper))
                    .sort((a, b) => b[1].frequency - a[1].frequency)
                    .slice(0, limit);
                
                profileMatches.forEach(([profile, data]) => {
                    const confidence = this.calculateProfileConfidence(profile, data.frequency, db);
                    
                    suggestions.push({
                        profile,
                        suggestedQuantity: data.averageQuantity || 1,
                        confidence,
                        frequency: data.frequency,
                        reasoning: `${data.frequency} kez kullanıldı, popüler profil`
                    });
                });
            }
            
            const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
            const confidenceLevel = avgConfidence >= 80 ? 'high' : avgConfidence >= 60 ? 'medium' : 'low';
            
            return {
                success: true,
                data: suggestions,
                totalSuggestions: suggestions.length,
                confidence: confidenceLevel,
                reasoning: productName && size 
                    ? `${productName} + ${size} kombinasyonu için özelleştirilmiş öneriler`
                    : productName 
                    ? `${productName} için özelleştirilmiş öneriler`
                    : 'Genel popüler profiller'
            };
            
        } catch (error) {
            console.error('[SMART-SUGGESTION] Profile suggestion error:', error);
            return {
                success: false,
                data: [],
                totalSuggestions: 0,
                confidence: 'low',
                reasoning: 'Profil önerisi alınamadı'
            };
        }
    }

    /**
     * Auto-complete önerileri
     */
    public getAutoCompleteSuggestions(
        type: 'product' | 'size' | 'profile' | 'color' | 'measurement',
        query: string,
        limit: number = 5
    ): AutoCompleteSuggestion[] {
        try {
            const db = this.loadDatabase();
            const suggestions: AutoCompleteSuggestion[] = [];
            
            const queryUpper = query.toUpperCase();
            const targetDb = db.autoComplete[`${type}s`] || {};
            
            // Başlangıç match'leri önce
            const startMatches = Object.entries(targetDb)
                .filter(([value]) => value.startsWith(queryUpper))
                .sort((a, b) => b[1].frequency - a[1].frequency)
                .slice(0, Math.ceil(limit / 2));
            
            startMatches.forEach(([value, data]) => {
                const confidence = this.calculateAutoCompleteConfidence(type, value, data.frequency, db);
                
                suggestions.push({
                    value,
                    type,
                    frequency: data.frequency,
                    confidence,
                    preview: this.generatePreview(type, value, data)
                });
            });
            
            // Contains match'leri sonra
            if (suggestions.length < limit) {
                const containsMatches = Object.entries(targetDb)
                    .filter(([value]) => 
                        !startMatches.find(([v]) => v === value) &&
                        value.includes(queryUpper)
                    )
                    .sort((a, b) => b[1].frequency - a[1].frequency)
                    .slice(0, limit - suggestions.length);
                
                containsMatches.forEach(([value, data]) => {
                    const confidence = this.calculateAutoCompleteConfidence(type, value, data.frequency, db);
                    
                    suggestions.push({
                        value,
                        type,
                        frequency: data.frequency,
                        confidence,
                        preview: this.generatePreview(type, value, data)
                    });
                });
            }
            
            return suggestions.sort((a, b) => b.confidence - a.confidence);
            
        } catch (error) {
            console.error('[SMART-SUGGESTION] Auto-complete error:', error);
            return [];
        }
    }

    /**
     * Veritabanı istatistikleri
     */
    public getDatabaseStats() {
        try {
            const db = this.loadDatabase();
            return {
                success: true,
                data: {
                    metadata: db.metadata,
                    topProducts: Object.entries(db.productSuggestions)
                        .sort((a, b) => b[1].totalOccurrences - a[1].totalOccurrences)
                        .slice(0, 10)
                        .map(([product, data]) => ({
                            product,
                            occurrences: data.totalOccurrences,
                            avgOrderQuantity: Math.round(data.averageOrderQuantity)
                        })),
                    topSizes: Object.entries(db.sizeSuggestions)
                        .sort((a, b) => b[1].totalUsage - a[1].totalUsage)
                        .slice(0, 10)
                        .map(([size, data]) => ({
                            size,
                            usage: data.totalUsage
                        })),
                    topProfiles: Object.entries(db.profileSuggestions)
                        .sort((a, b) => b[1].totalUsage - a[1].totalUsage)
                        .slice(0, 10)
                        .map(([profile, data]) => ({
                            profile,
                            usage: data.totalUsage,
                            avgQuantity: Math.round(data.averageQuantity)
                        }))
                }
            };
        } catch (error) {
            console.error('[SMART-SUGGESTION] Stats error:', error);
            return {
                success: false,
                message: 'İstatistikler alınamadı'
            };
        }
    }

    // Yardımcı metodlar
    private calculateProductConfidence(_product: string, frequency: number, db: SmartDatabase): number {
        const relativeFrequency = frequency / db.metadata.totalItems;
        return Math.min(100, relativeFrequency * 1000);
    }

    private calculateSizeConfidence(_size: string, frequency: number, db: SmartDatabase): number {
        const relativeFrequency = frequency / db.metadata.totalItems;
        return Math.min(100, relativeFrequency * 500);
    }

    private calculateProfileConfidence(_profile: string, frequency: number, db: SmartDatabase): number {
        const relativeFrequency = frequency / db.metadata.totalProfiles;
        return Math.min(100, relativeFrequency * 200);
    }

    private calculateAutoCompleteConfidence(
        type: string, 
        _value: string, 
        frequency: number, 
        db: SmartDatabase
    ): number {
        const totalItems = type === 'profile' ? db.metadata.totalProfiles : db.metadata.totalItems;
        const relativeFrequency = frequency / totalItems;
        const multiplier = type === 'product' ? 1000 : type === 'size' ? 500 : 200;
        return Math.min(100, relativeFrequency * multiplier);
    }

    private fuzzyMatch(text: string, query: string): boolean {
        const words = query.split(' ').filter(w => w.length > 1);
        return words.some(word => text.includes(word));
    }

    private generatePreview(type: string, _value: string, data: AutoCompleteItem): string {
        switch (type) {
            case 'product':
                return `${data.frequency} kez kullanıldı`;
            case 'size':
                return `${data.commonProducts?.slice(0, 2).join(', ')} için`;
            case 'profile':
                return `Ort. ${data.averageQuantity} adet`;
            case 'color':
                return `${data.frequency} kez`;
            case 'measurement':
                return `${data.frequency} kez`;
            default:
                return '';
        }
    }

    /**
     * Cache temizle
     */
    public clearCache(): void {
        this.database = null;
        this.lastLoadTime = 0;
        console.log('[SMART-SUGGESTION] Cache cleared');
    }

    /**
     * Veritabanını yeniden yükle
     */
    public reloadDatabase(): boolean {
        try {
            this.clearCache();
            this.loadDatabase();
            return true;
        } catch (error) {
            console.error('[SMART-SUGGESTION] Reload error:', error);
            return false;
        }
    }
}

// Singleton instance
const smartSuggestionService = new SmartSuggestionService();
export default smartSuggestionService;
