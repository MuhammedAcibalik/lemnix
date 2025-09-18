/**
 * @fileoverview Enterprise Grade Profile Suggestion Service
 * @module EnterpriseProfileSuggestionService
 * @version 2.0.0
 * @description Advanced AI-powered profile suggestion system with context awareness
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
}

interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ============================================================================
// ENTERPRISE SUGGESTION INTERFACES
// ============================================================================

interface ContextKey {
  productName: string;
  size: string;
  note?: string | undefined;
  version?: string | undefined;
  color?: string | undefined;
  orderQuantity?: number | undefined;
}

// Use existing interfaces from above

interface ProfilePattern {
  profile: string;
  measurement: string;
  quantity: number;
  frequency: number;
  confidence: number;
  contexts: ContextKey[];
  lastUsed: string;
  averageQuantity: number;
  variations: string[];
}

interface SmartSuggestion {
  profile: string;
  measurement: string;
  suggestedQuantity: number;
  confidence: number;
  reasoning: string;
  frequency: number;
  contextMatch: number;
  alternatives: AlternativeSuggestion[];
}

interface AlternativeSuggestion {
  profile: string;
  measurement: string;
  quantity: number;
  confidence: number;
  reason: string;
}

interface AnalysisResult {
  suggestions: SmartSuggestion[];
  contextualInsights: string[];
  patternAnalysis: {
    mostCommonProfiles: string[];
    typicalMeasurements: string[];
    quantityPatterns: number[];
    seasonalTrends?: string[];
  };
}

// ============================================================================
// ENTERPRISE PROFILE SUGGESTION SERVICE
// ============================================================================

export class EnterpriseProfileSuggestionService {
  private profilePatterns: Map<string, ProfilePattern[]> = new Map();
  private contextDatabase: Map<string, ContextKey[]> = new Map();
  private readonly storageFile: string;
  private lastAnalysisTime: number = 0;
  private readonly cacheTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    const storageDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.storageFile = path.join(storageDir, 'cutting-lists.json');
    this.initializeService();
  }

  /**
   * Initialize the service and analyze existing data
   */
  private initializeService(): void {
    try {
      this.analyzeExistingData();
      const stats = this.getStatistics();
      console.log('[ENTERPRISE-PROFILE] Service initialized successfully');
      console.log(`[ENTERPRISE-PROFILE] Patterns: ${stats.totalPatterns}, Groups: ${stats.contextGroups}`);
      
      if (stats.totalPatterns === 0) {
        console.log('[ENTERPRISE-PROFILE] No patterns found - will analyze when data is available');
      }
    } catch (error) {
      console.error('[ENTERPRISE-PROFILE] Initialization error:', error);
    }
  }

  /**
   * Analyze existing cutting list data to build patterns
   */
  private analyzeExistingData(): void {
    try {
      if (!fs.existsSync(this.storageFile)) {
        console.log('[ENTERPRISE-PROFILE] No existing data found');
        return;
      }

      const jsonData = fs.readFileSync(this.storageFile, 'utf8');
      const data = JSON.parse(jsonData);
      
      let cuttingLists: CuttingList[] = [];
      
      // Handle different data formats
      if (Array.isArray(data)) {
        if (data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) {
          // Map format: [[id, cuttingList], ...]
          cuttingLists = data.map(([, list]) => list).filter(list => list && list.id);
          console.log('[ENTERPRISE-PROFILE] Parsed Map format:', cuttingLists.length, 'lists');
        } else {
          // Direct array format
          cuttingLists = data.filter(item => item && item.id);
          console.log('[ENTERPRISE-PROFILE] Parsed Array format:', cuttingLists.length, 'lists');
        }
      } else {
        console.log('[ENTERPRISE-PROFILE] Unknown data format:', typeof data, Array.isArray(data));
      }

      // Debug: Log first cutting list structure
      if (cuttingLists.length > 0) {
        const firstList = cuttingLists[0];
        if (firstList) {
          console.log('[ENTERPRISE-PROFILE] First list sample:');
          console.log('- ID:', firstList.id);
          console.log('- Week:', firstList.weekNumber);
          console.log('- Sections:', firstList.sections?.length || 0);
          if (firstList.sections && firstList.sections[0]) {
            console.log('- First section items:', firstList.sections[0].items?.length || 0);
          }
        }
      }

      this.buildProfilePatterns(cuttingLists);
      this.lastAnalysisTime = Date.now();
      
      console.log(`[ENTERPRISE-PROFILE] Analyzed ${cuttingLists.length} cutting lists`);
      console.log(`[ENTERPRISE-PROFILE] Built ${this.profilePatterns.size} pattern groups`);
      
    } catch (error) {
      console.error('[ENTERPRISE-PROFILE] Data analysis error:', error);
    }
  }

  /**
   * Build profile patterns from cutting list data
   */
  private buildProfilePatterns(cuttingLists: CuttingList[]): void {
    const patternMap = new Map<string, ProfilePattern>();
    
    console.log('[ENTERPRISE-PROFILE] Building patterns from', cuttingLists.length, 'cutting lists');
    
    cuttingLists.forEach((list, listIndex) => {
      if (!list.sections || !Array.isArray(list.sections)) {
        console.log(`[ENTERPRISE-PROFILE] List ${listIndex} has no sections`);
        return;
      }
      
      list.sections.forEach((section, sectionIndex) => {
        if (!section.items || !Array.isArray(section.items)) {
          console.log(`[ENTERPRISE-PROFILE] Section ${sectionIndex} has no items`);
          return;
        }
        
        console.log(`[ENTERPRISE-PROFILE] Processing section "${section.productName}" with ${section.items.length} items`);
        
        section.items.forEach((item: CuttingListItem) => {
          const contextKey: ContextKey = {
            productName: section.productName.toUpperCase(),
            size: item.size?.toUpperCase() || '',
            note: item.note?.toUpperCase(),
            version: item.version?.toUpperCase(),
            color: item.color?.toUpperCase(),
            orderQuantity: item.orderQuantity || 0
          };

          item.profiles?.forEach((profile: ProfileItem) => {
            if (profile.profile && profile.measurement) {
              const patternKey = this.createPatternKey(
                contextKey.productName,
                contextKey.size,
                profile.profile,
                profile.measurement
              );

              if (patternMap.has(patternKey)) {
                const existing = patternMap.get(patternKey)!;
                existing.frequency += 1;
                existing.contexts.push(contextKey);
                existing.averageQuantity = (existing.averageQuantity + profile.quantity) / 2;
                existing.lastUsed = list.updatedAt || list.createdAt;
                
                // Add measurement variations
                if (!existing.variations.includes(profile.measurement)) {
                  existing.variations.push(profile.measurement);
                }
              } else {
                patternMap.set(patternKey, {
                  profile: profile.profile.toUpperCase(),
                  measurement: profile.measurement,
                  quantity: profile.quantity,
                  frequency: 1,
                  confidence: 0, // Will be calculated later
                  contexts: [contextKey],
                  lastUsed: list.updatedAt || list.createdAt,
                  averageQuantity: profile.quantity,
                  variations: [profile.measurement]
                });
              }
            }
          });
        });
      });
    });

    // Calculate confidence scores and group patterns
    this.calculateConfidenceScores(patternMap);
    this.groupPatternsByContext(patternMap);
  }

  /**
   * Calculate confidence scores based on frequency and recency
   */
  private calculateConfidenceScores(patternMap: Map<string, ProfilePattern>): void {
    const maxFrequency = Math.max(...Array.from(patternMap.values()).map(p => p.frequency));
    const now = Date.now();

    patternMap.forEach(pattern => {
      // Frequency score (0-70)
      const frequencyScore = (pattern.frequency / maxFrequency) * 70;
      
      // Recency score (0-20)
      const daysSinceLastUse = (now - new Date(pattern.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 20 - (daysSinceLastUse / 30) * 20);
      
      // Context variety score (0-10)
      const contextScore = Math.min(10, pattern.contexts.length * 2);
      
      pattern.confidence = Math.round(frequencyScore + recencyScore + contextScore);
    });
  }

  /**
   * Group patterns by context for efficient lookup
   */
  private groupPatternsByContext(patternMap: Map<string, ProfilePattern>): void {
    this.profilePatterns.clear();
    this.contextDatabase.clear();

    patternMap.forEach(pattern => {
      pattern.contexts.forEach(context => {
        const contextKey = this.createContextKey(context.productName, context.size);
        
        if (!this.profilePatterns.has(contextKey)) {
          this.profilePatterns.set(contextKey, []);
          this.contextDatabase.set(contextKey, []);
        }
        
        this.profilePatterns.get(contextKey)!.push(pattern);
        this.contextDatabase.get(contextKey)!.push(context);
      });
    });

    // Sort patterns by confidence
    this.profilePatterns.forEach(patterns => {
      patterns.sort((a, b) => b.confidence - a.confidence);
    });
  }

  /**
   * Get smart profile suggestions based on context
   */
  public getSmartSuggestions(
    productName: string,
    size: string,
    note?: string,
    version?: string,
    color?: string,
    limit: number = 15
  ): AnalysisResult {
    // Refresh data if cache expired
    if (Date.now() - this.lastAnalysisTime > this.cacheTimeout) {
      this.analyzeExistingData();
    }

    const contextKey = this.createContextKey(productName.toUpperCase(), size.toUpperCase());
    const exactPatterns = this.profilePatterns.get(contextKey) || [];
    
    // Get fuzzy matches for similar contexts
    const fuzzyPatterns = this.getFuzzyMatches(productName, size, note);
    
    // Combine and deduplicate patterns
    const allPatterns = [...exactPatterns, ...fuzzyPatterns];
    const uniquePatterns = this.deduplicatePatterns(allPatterns);
    
    // Generate smart suggestions
    const suggestions = this.generateSmartSuggestions(
      uniquePatterns,
      { productName, size, note, version, color },
      limit
    );

    // Generate contextual insights
    const insights = this.generateContextualInsights(uniquePatterns, productName, size);
    
    // Pattern analysis
    const patternAnalysis = this.analyzePatterns(uniquePatterns);

    return {
      suggestions,
      contextualInsights: insights,
      patternAnalysis
    };
  }

  /**
   * Get fuzzy matches for similar contexts
   */
  private getFuzzyMatches(productName: string, size: string, _note?: string): ProfilePattern[] {
    const fuzzyPatterns: ProfilePattern[] = [];
    const productUpper = productName.toUpperCase();
    const sizeUpper = size.toUpperCase();

    this.profilePatterns.forEach((patterns, contextKey) => {
      const [storedProduct, storedSize] = contextKey.split('|');
      
      // Product name similarity
      const productSimilarity = this.calculateStringSimilarity(productUpper, storedProduct || '');
      
      // Size similarity
      const sizeSimilarity = this.calculateStringSimilarity(sizeUpper, storedSize || '');
      
      // If similar enough, include patterns with reduced confidence
      if (productSimilarity > 0.7 || sizeSimilarity > 0.8) {
        patterns.forEach(pattern => {
          const adjustedPattern = {
            ...pattern,
            confidence: Math.round(pattern.confidence * (productSimilarity + sizeSimilarity) / 2)
          };
          fuzzyPatterns.push(adjustedPattern);
        });
      }
    });

    return fuzzyPatterns;
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0]![i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j]![0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,
          matrix[j - 1]![i]! + 1,
          matrix[j - 1]![i - 1]! + cost
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length]![str1.length]!) / maxLength;
  }

  /**
   * Deduplicate patterns based on profile and measurement
   */
  private deduplicatePatterns(patterns: ProfilePattern[]): ProfilePattern[] {
    const seen = new Set<string>();
    return patterns.filter(pattern => {
      const key = `${pattern.profile}|${pattern.measurement}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate smart suggestions with ML-like scoring
   */
  private generateSmartSuggestions(
    patterns: ProfilePattern[],
    context: ContextKey,
    limit: number
  ): SmartSuggestion[] {
    return patterns
      .slice(0, limit)
      .map(pattern => {
        const contextMatch = this.calculateContextMatch(pattern.contexts, context);
        const alternatives = this.generateAlternatives(pattern, patterns);
        
        return {
          profile: pattern.profile,
          measurement: pattern.measurement,
          suggestedQuantity: Math.round(pattern.averageQuantity),
          confidence: Math.min(100, pattern.confidence + contextMatch),
          reasoning: this.generateReasoning(pattern, contextMatch),
          frequency: pattern.frequency,
          contextMatch,
          alternatives
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate context matching score
   */
  private calculateContextMatch(contexts: ContextKey[], targetContext: ContextKey): number {
    let totalScore = 0;
    let matches = 0;

    contexts.forEach(ctx => {
      let score = 0;
      
      // Product name match
      if (ctx.productName === targetContext.productName.toUpperCase()) score += 30;
      
      // Size match
      if (ctx.size === targetContext.size.toUpperCase()) score += 25;
      
      // Note match (if provided)
      if (targetContext.note && ctx.note && ctx.note.includes(targetContext.note.toUpperCase())) {
        score += 20;
      }
      
      // Version match
      if (targetContext.version && ctx.version === targetContext.version.toUpperCase()) {
        score += 15;
      }
      
      // Color match
      if (targetContext.color && ctx.color === targetContext.color.toUpperCase()) {
        score += 10;
      }
      
      totalScore += score;
      matches++;
    });

    return matches > 0 ? Math.round(totalScore / matches) : 0;
  }

  /**
   * Generate reasoning for suggestion
   */
  private generateReasoning(pattern: ProfilePattern, contextMatch: number): string {
    const reasons: string[] = [];
    
    if (pattern.frequency > 5) {
      reasons.push(`${pattern.frequency} kez kullanıldı`);
    }
    
    if (contextMatch > 70) {
      reasons.push('yüksek context eşleşmesi');
    }
    
    if (pattern.confidence > 80) {
      reasons.push('yüksek güven skoru');
    }
    
    const daysSinceLastUse = (Date.now() - new Date(pattern.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse < 30) {
      reasons.push('yakın zamanda kullanıldı');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'geçmiş verilere dayanarak';
  }

  /**
   * Generate alternative suggestions
   */
  private generateAlternatives(pattern: ProfilePattern, allPatterns: ProfilePattern[]): AlternativeSuggestion[] {
    return allPatterns
      .filter(p => p.profile === pattern.profile && p.measurement !== pattern.measurement)
      .slice(0, 3)
      .map(p => ({
        profile: p.profile,
        measurement: p.measurement,
        quantity: Math.round(p.averageQuantity),
        confidence: Math.round(p.confidence * 0.8),
        reason: 'Aynı profil, farklı ölçü'
      }));
  }

  /**
   * Generate contextual insights
   */
  private generateContextualInsights(patterns: ProfilePattern[], _productName: string, _size: string): string[] {
    const insights: string[] = [];
    
    if (patterns.length === 0) {
      insights.push('Bu ürün-ebat kombinasyonu için geçmiş veri bulunamadı');
      return insights;
    }
    
    const profileTypes = [...new Set(patterns.map(p => p.profile))];
    if (profileTypes.length > 1) {
      insights.push(`${profileTypes.length} farklı profil türü kullanılmış: ${profileTypes.slice(0, 3).join(', ')}`);
    }
    
    const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
    if (avgFrequency > 3) {
      insights.push('Bu kombinasyon sıklıkla kullanılıyor');
    }
    
    const recentPatterns = patterns.filter(p => {
      const daysSince = (Date.now() - new Date(p.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 60;
    });
    
    if (recentPatterns.length > 0) {
      insights.push(`Son 2 ay içinde ${recentPatterns.length} benzer iş emri yapıldı`);
    }
    
    return insights;
  }

  /**
   * Analyze patterns for statistical insights
   */
  private analyzePatterns(patterns: ProfilePattern[]): any {
    if (patterns.length === 0) {
      return {
        mostCommonProfiles: [],
        typicalMeasurements: [],
        quantityPatterns: []
      };
    }
    
    // Most common profiles
    const profileFreq = new Map<string, number>();
    patterns.forEach(p => {
      profileFreq.set(p.profile, (profileFreq.get(p.profile) || 0) + p.frequency);
    });
    
    const mostCommonProfiles = Array.from(profileFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([profile]) => profile);
    
    // Typical measurements
    const measurements = patterns.map(p => parseInt(p.measurement)).filter(m => !isNaN(m));
    const typicalMeasurements = [...new Set(measurements)]
      .sort((a, b) => a - b)
      .slice(0, 10)
      .map(m => m.toString());
    
    // Quantity patterns
    const quantities = patterns.map(p => Math.round(p.averageQuantity));
    const quantityPatterns = [...new Set(quantities)].sort((a, b) => a - b);
    
    return {
      mostCommonProfiles,
      typicalMeasurements,
      quantityPatterns
    };
  }

  /**
   * Utility methods
   */
  private createPatternKey(productName: string, size: string, profile: string, measurement: string): string {
    return `${productName}|${size}|${profile}|${measurement}`;
  }

  private createContextKey(productName: string, size: string): string {
    return `${productName}|${size}`;
  }

  /**
   * Get available sizes for a specific product from historical data
   */
  public getAvailableSizesForProduct(productName: string): { size: string; frequency: number; lastUsed: string }[] {
    if (Date.now() - this.lastAnalysisTime > this.cacheTimeout) {
      this.analyzeExistingData();
    }

    const normalizedProductName = productName.toUpperCase();
    const sizeMap = new Map<string, { frequency: number; lastUsed: number }>();

    // Collect all sizes for this product
    for (const [key, patterns] of this.profilePatterns.entries()) {
      const keyParts = key.split('|');
      const keyProduct = keyParts[0];
      const size = keyParts[1];
      
      if (keyProduct === normalizedProductName && size) {
        if (!sizeMap.has(size)) {
          sizeMap.set(size, { frequency: 0, lastUsed: 0 });
        }
        
        patterns.forEach(pattern => {
          const current = sizeMap.get(size)!;
          current.frequency += pattern.frequency;
          const patternLastUsed = new Date(pattern.lastUsed).getTime();
          current.lastUsed = Math.max(current.lastUsed, patternLastUsed);
        });
      }
    }

    // Convert to array and sort by frequency
    return Array.from(sizeMap.entries())
      .map(([size, data]) => ({
        size,
        frequency: data.frequency,
        lastUsed: new Date(data.lastUsed).toISOString()
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get complete profile set for a specific product-size combination
   */
  public getCompleteProfileSet(productName: string, size: string, orderQuantity?: number): {
    profiles: Array<{
      profile: string;
      measurement: string;
      suggestedQuantity: number;
      confidence: number;
      averageOrderQuantity: number;
      quantityRatio: number;
    }>;
    totalItems: number;
    averageTotalQuantity: number;
    averageOrderQuantity: number;
    calculationMethod: string;
  } {
    if (Date.now() - this.lastAnalysisTime > this.cacheTimeout) {
      this.analyzeExistingData();
    }

    const key = `${productName.toUpperCase()}|${size.toUpperCase()}`;
    const patterns = this.profilePatterns.get(key) || [];

    // Geçmiş verilerdeki ortalama sipariş adedini hesapla
    const historicalOrderQuantities: number[] = [];
    const profileQuantityRatios = new Map<string, number[]>();

    // Geçmiş verileri analiz et - Her sipariş için ayrı ayrı oran hesapla
    patterns.forEach(pattern => {
      if (pattern.contexts && pattern.contexts.length > 0) {
        pattern.contexts.forEach(ctx => {
          const ctxOrderQty = ctx.orderQuantity || 100; // Varsayılan sipariş adedi
          if (ctxOrderQty > 0) {
            historicalOrderQuantities.push(ctxOrderQty);
            
            const profileKey = `${pattern.profile}|${pattern.measurement}`;
            if (!profileQuantityRatios.has(profileKey)) {
              profileQuantityRatios.set(profileKey, []);
            }
            
            // ÖNEMLI: Her context için ayrı oran hesapla (pattern.quantity her context için aynı olabilir)
            // Bu durumda pattern.averageQuantity yerine gerçek quantity'yi kullanmalıyız
            const actualProfileQuantity = pattern.quantity; // Bu profil için gerçek adet
            const ratio = actualProfileQuantity / ctxOrderQty;
            
            profileQuantityRatios.get(profileKey)!.push(ratio);
            
            console.log(`[RATIO] ${pattern.profile}: ${actualProfileQuantity} adet / ${ctxOrderQty} sipariş = ${ratio.toFixed(3)} oran`);
          }
        });
      }
    });

    const avgHistoricalOrderQty = historicalOrderQuantities.length > 0
      ? historicalOrderQuantities.reduce((a, b) => a + b, 0) / historicalOrderQuantities.length
      : 100; // Varsayılan

    // Kullanıcının girdiği sipariş adedi veya ortalama
    const targetOrderQuantity = orderQuantity || avgHistoricalOrderQty;

    // Her profil için akıllı adet hesapla
    const profiles = patterns.map(pattern => {
      const profileKey = `${pattern.profile}|${pattern.measurement}`;
      const ratios = profileQuantityRatios.get(profileKey) || [1];
      const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      
      // Yeni adet = Sipariş Adedi * Ortalama Oran
      const calculatedQuantity = Math.round(targetOrderQuantity * avgRatio);
      
      return {
        profile: pattern.profile,
        measurement: pattern.measurement,
        suggestedQuantity: calculatedQuantity > 0 ? calculatedQuantity : 1,
        confidence: pattern.confidence,
        averageOrderQuantity: Math.round(avgHistoricalOrderQty),
        quantityRatio: avgRatio
      };
    });

    const totalItems = profiles.length;
    const averageTotalQuantity = profiles.reduce((sum, p) => sum + p.suggestedQuantity, 0);

    console.log(`\n🧠 [SMART-CALCULATION] ${productName}|${size}:`);
    console.log(`📊 Sipariş Bilgileri:`);
    console.log(`   🎯 Hedef Sipariş: ${targetOrderQuantity} adet`);
    console.log(`   📈 Geçmiş Ortalama: ${avgHistoricalOrderQty} adet`);
    console.log(`   🔧 Hesaplama: ${orderQuantity ? 'Kullanıcı Tanımlı' : 'Geçmiş Ortalama'}`);
    
    console.log(`\n📦 Profil Detayları:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.profile}: ${profile.suggestedQuantity} adet (Oran: ${profile.quantityRatio.toFixed(3)})`);
    });
    
    console.log(`\n✅ ÖZET:`);
    console.log(`   📦 Toplam profil: ${totalItems}`);
    console.log(`   🔢 Toplam adet: ${averageTotalQuantity}`);

    return {
      profiles,
      totalItems,
      averageTotalQuantity,
      averageOrderQuantity: Math.round(avgHistoricalOrderQty),
      calculationMethod: orderQuantity ? 'user_specified' : 'historical_average'
    };
  }

  /**
   * Get suggestion statistics
   */
  public getStatistics(): any {
    return {
      totalPatterns: Array.from(this.profilePatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0),
      contextGroups: this.profilePatterns.size,
      lastAnalysis: new Date(this.lastAnalysisTime).toISOString(),
      cacheStatus: Date.now() - this.lastAnalysisTime < this.cacheTimeout ? 'fresh' : 'stale'
    };
  }

  /**
   * Force refresh analysis
   */
  public refreshAnalysis(): void {
    this.analyzeExistingData();
  }
}
