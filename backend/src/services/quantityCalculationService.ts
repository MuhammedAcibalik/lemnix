import { QuantityCalculation, QuantityValidation } from '../types/quantityTypes';
import * as fs from 'fs';
import * as path from 'path';

interface ProfilePiece {
    profileName: string;
    length: number; // mm cinsinden
    quantity: number;
    unit: string;
}

interface ProductProfileData {
    productName: string;
    size: string;
    profiles: ProfilePiece[];
    totalPieces: number;
    patterns: any[];
}

interface ExcelAnalysisData {
    summary: {
        totalFiles: number;
        totalValidRows: number;
        totalProducts: number;
        totalCombinations: number;
        analysisDate: string;
    };
    products: Record<string, {
        name: string;
        totalOrderQuantity: number;
        totalQuantity: number;
        averageRatio: number;
        minRatio: number;
        maxRatio: number;
        patternCount: number;
        sizes: string[];
        profiles: string[];
        multiProfileCount: number;
        singleProfileCount: number;
        patterns: any[];
    }>;
    combinations: Record<string, {
        product: string;
        size: string;
        profile: string;
        averageRatio: number;
        averageQuantity: number;
        averageOrderQuantity: number;
        patternCount: number;
        patterns: any[];
    }>;
    multiProfileAnalysis: {
        totalMultiProfileWorkOrders: number;
        ratioAccuracy: {
            firstProfileCorrect: number;
            otherProfilesCorrect: number;
            totalChecked: number;
            firstProfileAccuracy: number;
            otherProfileAccuracy: number;
        };
    };
    rawData: any[];
}

export class QuantityCalculationService {
    private excelData: ExcelAnalysisData | null = null;
    private productProfileDatabase: Map<string, ProductProfileData[]> = new Map();

    constructor() {
        this.loadExcelAnalysis();
        this.buildProductProfileDatabase();
    }

    private loadExcelAnalysis(): void {
        try {
            const enterpriseAnalysisPath = path.join(process.cwd(), 'perfect_excel_analysis.json');
            console.log(`🏭 Enterprise Excel analiz dosyası yükleniyor: ${enterpriseAnalysisPath}`);
            
            if (fs.existsSync(enterpriseAnalysisPath)) {
                const rawData = fs.readFileSync(enterpriseAnalysisPath, 'utf-8');
                const enterpriseData = JSON.parse(rawData);
                
                // Enterprise formatını eski formata dönüştür
                this.excelData = this.convertEnterpriseToOldFormat(enterpriseData);
                
                console.log(`✅ Enterprise analizi yüklendi: ${enterpriseData.totalWorkOrders} iş emri`);
                console.log(`   📦 ${Object.keys(enterpriseData.products).length} ürün`);
                console.log(`   🔗 ${enterpriseData.totalProfiles} profil`);
                console.log(`   🎯 ${enterpriseData.summary.highConfidenceProducts} yüksek güvenli ürün`);
            } else {
                console.log(`⚠️ Enterprise analiz dosyası bulunamadı: ${enterpriseAnalysisPath}`);
                
                // Fallback: Eski analiz dosyası
                const fallbackPath = path.join(process.cwd(), '..', 'ultra_deep_excel_analysis.json');
                if (fs.existsSync(fallbackPath)) {
                    const rawData = fs.readFileSync(fallbackPath, 'utf-8');
                    this.excelData = JSON.parse(rawData);
                    console.log(`✅ Fallback analizi yüklendi`);
                }
            }
        } catch (error) {
            console.error('❌ Excel analizi yüklenirken hata:', error);
        }
    }

    private convertEnterpriseToOldFormat(enterpriseData: any): ExcelAnalysisData {
        // Perfect formatını eski ExcelAnalysisData formatına dönüştür
        const combinations: Record<string, any> = {};
        
        if (enterpriseData.businessRules) {
            Object.values(enterpriseData.businessRules).forEach((productRule: any) => {
                Object.entries(productRule.sizes).forEach(([sizeKey, sizeRule]: [string, any]) => {
                    Object.entries(sizeRule.profiles).forEach(([, profileData]: [string, any]) => {
                        const comboKey = `${productRule.productName}|${sizeKey}|${profileData.name}`;
                        combinations[comboKey] = {
                            product: productRule.productName,
                            size: sizeKey,
                            profile: profileData.name,
                            profileIndex: profileData.index,
                            averageRatio: profileData.averageRatio,
                            patternCount: profileData.sampleCount,
                            patterns: profileData.examples || []
                        };
                    });
                });
            });
        }

        return {
            summary: {
                totalFiles: enterpriseData.totalFiles || 0,
                totalValidRows: enterpriseData.totalWorkOrders || 0,
                totalProducts: Object.keys(enterpriseData.products || {}).length,
                totalCombinations: Object.keys(combinations).length,
                analysisDate: enterpriseData.generatedAt
            },
            products: enterpriseData.products || {},
            combinations: combinations,
            multiProfileAnalysis: {
                totalMultiProfileWorkOrders: 0,
                ratioAccuracy: {
                    firstProfileCorrect: 0,
                    otherProfilesCorrect: 0,
                    totalChecked: 0,
                    firstProfileAccuracy: 95,
                    otherProfileAccuracy: 85
                }
            },
            rawData: []
        };
    }

    private buildProductProfileDatabase(): void {
        console.log('🎯 GERÇEK İNCE HELEZON MANTIĞI ile veritabanı oluşturuluyor...');
        
        // Önce gerçek İnce Helezon mantığını yükle
        this.loadRealInceHelezonyLogic();
        
        if (!this.excelData) {
            console.log('⚠️ Excel verisi yok, varsayılan profil veritabanı oluşturuluyor');
            this.createDefaultProfileDatabase();
            return;
        }

        console.log('🏗️ Excel analizi ile ek Ürün-Profil veritabanı oluşturuluyor...');

        // Ultra derin analizden kombinasyonları işle
        const combinations = this.excelData.combinations;
        if (!combinations) {
            console.log('❌ Kombinasyonlar bulunamadı');
            this.createDefaultProfileDatabase();
            return;
        }

        // Ürün-Ebat bazında grupla
        const productSizeGroups = new Map<string, Map<string, any>>();

        Object.entries(combinations).forEach(([, comboData]) => {
            const { product, size, profile, averageRatio, patternCount } = comboData;
            
            if (!product || patternCount < 2 || !averageRatio || isNaN(averageRatio)) return; // Geçersiz veri kontrolü
            
            const productSizeKey = `${product}|${size}`;
            
            // Eğer gerçek veri varsa, atla
            if (this.productProfileDatabase.has(productSizeKey)) {
                return;
            }
            
            if (!productSizeGroups.has(productSizeKey)) {
                productSizeGroups.set(productSizeKey, new Map());
            }
            
            const profileGroup = productSizeGroups.get(productSizeKey)!;
            profileGroup.set(profile || '', {
                profile: profile || '',
                averageRatio: averageRatio || 0,
                patternCount: patternCount || 0,
                patterns: comboData.patterns || []
            });
        });

        // Her ürün-ebat grubu için profil veritabanı oluştur
        productSizeGroups.forEach((profileGroup, productSizeKey) => {
            const [product, size] = productSizeKey.split('|');
            
            const profiles: ProfilePiece[] = [];
            let totalExampleQuantity = 0;
            
            // Profilleri oran sırasına göre sırala (yüksekten düşüğe)
            const sortedProfiles = Array.from(profileGroup.entries())
                .sort(([,a], [,b]) => (b.averageRatio || 0) - (a.averageRatio || 0));
            
            sortedProfiles.forEach(([profileName, profileData]) => {
                // Profil için ölçü hesapla
                const length = this.calculateProfileLength(size || '', profileName || '');
                
                // 100 sipariş için örnek adet hesapla
                const exampleQuantity = Math.round((profileData.averageRatio || 0) * 100);
                totalExampleQuantity += exampleQuantity;
                
                profiles.push({
                    profileName: profileName || '',
                    length,
                    quantity: exampleQuantity,
                    unit: 'mm'
                });
                
                console.log(`   👤 ${product} | ${size} | ${profileName || '(Boş)'}: ${exampleQuantity} adet (${length}mm) - oran: ${(profileData.averageRatio || 0).toFixed(2)}x [${profileData.patternCount} örnek]`);
            });

            if (profiles.length > 0) {
                const productProfileData: ProductProfileData = {
                    productName: product || '',
                    size: size || '',
                    profiles,
                    totalPieces: totalExampleQuantity,
                    patterns: Array.from(profileGroup.values()).flatMap(p => p.patterns || [])
                };

                this.productProfileDatabase.set(productSizeKey, [productProfileData]);
                console.log(`📦 ${product} | ${size}: ${profiles.length} profil, toplam ${totalExampleQuantity} parça`);
            }
        });

        console.log(`✅ Gerçek iş mantığı ile Ürün-Profil veritabanı oluşturuldu: ${this.productProfileDatabase.size} kombinasyon`);
        
        // En çok görülen kombinasyonları göster
        const topCombinations = Array.from(this.productProfileDatabase.entries())
            .map(([key, data]) => ({ key, data: data[0] }))
            .filter(combo => combo.data)
            .sort((a, b) => (b.data?.patterns?.length || 0) - (a.data?.patterns?.length || 0))
            .slice(0, 10);
            
        console.log('\n🎯 EN ÇOK GÖRÜLEN GERÇEK KOMBİNASYONLAR:');
        topCombinations.forEach((combo, index) => {
            if (combo.data) {
                console.log(`   ${index + 1}. ${combo.data.productName} | ${combo.data.size}: ${combo.data.profiles.length} profil, ${combo.data.patterns.length} örnek`);
                combo.data.profiles.forEach((profile, pIndex) => {
                    const totalPieces = combo.data?.totalPieces || 0;
                    const ratio = totalPieces > 0 ? (profile.quantity / totalPieces) : 0;
                    console.log(`      ${pIndex + 1}. ${profile.profileName || '(Boş)'}: ${profile.quantity} adet (${(ratio * 100).toFixed(1)}%)`);
                });
            }
        });
    }

    private loadRealInceHelezonyLogic(): void {
        console.log('🎯 GERÇEK İnce Helezon iş mantığı yükleniyor...');
        
        try {
            const realLogicPath = path.join(process.cwd(), 'real_ince_helezon_logic.json');
            if (fs.existsSync(realLogicPath)) {
                const realLogicData = JSON.parse(fs.readFileSync(realLogicPath, 'utf-8'));
                
                if (realLogicData.productDatabase) {
                    Object.entries(realLogicData.productDatabase).forEach(([key, data]: [string, any]) => {
                        const profiles: ProfilePiece[] = [];
                        
                        data.profiles.forEach((profile: any) => {
                            // Convert CM to MM
                            const lengthInMM = this.convertCMtoMM(profile.olcu);
                            
                            profiles.push({
                                profileName: profile.name,
                                length: lengthInMM,
                                quantity: Math.round((profile.adet / data.siparisAdedi) * 100), // Normalize to 100 sipariş adedi
                                unit: 'mm'
                            });
                        });
                        
                        const productProfileData: ProductProfileData = {
                            productName: key.split('|')[0] || '',
                            size: key.split('|')[1] || '',
                            profiles,
                            totalPieces: profiles.reduce((sum, p) => sum + p.quantity, 0),
                            patterns: [] // Real data doesn't need patterns
                        };
                        
                        this.productProfileDatabase.set(key, [productProfileData]);
                        console.log(`   ✅ GERÇEK VERİ eklendi: ${key} - ${profiles.length} profil`);
                        
                        profiles.forEach((profile, index) => {
                            const ratio = profile.quantity / 100;
                            console.log(`      ${index + 1}. ${profile.profileName}: ${profile.quantity} adet (${ratio.toFixed(2)}x) - ${profile.length}mm`);
                        });
                    });
                }
            } else {
                console.log('⚠️ real_ince_helezon_logic.json dosyası bulunamadı');
            }
        } catch (error) {
            console.log('⚠️ Gerçek İnce Helezon mantığı yüklenemedi:', error);
        }
    }

    private convertCMtoMM(olcuStr: string): number {
        // "99,2 CM" -> 992 mm
        if (!olcuStr) return 0;
        
        const match = olcuStr.match(/([\d,\.]+)/);
        if (match && match[1]) {
            const numStr = match[1].replace(',', '.');
            const cm = parseFloat(numStr);
            return Math.round(cm * 10); // CM to MM
        }
        
        return 0;
    }

    private detectProductFromProfile(profile: string, size: string): string | null {
        // Profil ve ebat bilgisinden ürün türünü tespit et
        if (!profile && !size) return null;

        const profileUpper = (profile || '').toUpperCase();
        const sizeUpper = (size || '').toUpperCase();

        // Profil bazlı tespit
        if (profileUpper.includes('KAPALI ALT') || profileUpper.includes('AÇIK ALT')) {
            if (sizeUpper.includes('24') && sizeUpper.includes('36')) {
                return 'İNCE HELEZON';
            }
            if (sizeUpper.includes('A') || sizeUpper.includes('B')) {
                return 'SWİNGPRO PLUS';
            }
            return 'İNCE HELEZON'; // Varsayılan
        }

        if (profileUpper.includes('GÖVDE') || profileUpper.includes('KAPAK')) {
            return 'TOTEM';
        }

        if (profileUpper.includes('Ç.K.') || profileUpper.includes('T.K.')) {
            return 'SÜRGÜLÜ HELEZON';
        }

        if (profileUpper.includes('19X25') || profileUpper.includes('21X38')) {
            return 'SÜRGÜLÜ İNFO';
        }

        // Size bazlı tespit
        if (sizeUpper.includes('24') && sizeUpper.includes('36')) {
            return 'İNCE HELEZON';
        }

        // Varsayılan
        return 'İNCE HELEZON';
    }

    private findEnterpriseProfileData(productName: string, size: string, profile: string, profileIndex: number): { ratio: number; confidence: number } | null {
        // Enterprise analizinden spesifik profil verisini bul
        if (!this.excelData?.combinations) return null;

        console.log(`🔍 Enterprise arama: ${productName}|${size}|${profile} (index: ${profileIndex})`);

        // Direkt profil eşleşmesi ara
        const directKey = `${productName}|${size}|${profile}`;
        if (this.excelData.combinations[directKey]) {
            const comboData = this.excelData.combinations[directKey];
            console.log(`   ✅ Direkt eşleşme: ${comboData.averageRatio.toFixed(2)}x`);
            return {
                ratio: comboData.averageRatio,
                confidence: Math.min(0.95, Math.max(0.1, comboData.patternCount / 10))
            };
        }

        // Profil indexi bazlı çok profilli mantık
        if (profileIndex !== undefined) {
            // İNCE HELEZON için özel mantık
            if (productName === 'İNCE HELEZON' && size === '24"X36"') {
                if (profileIndex === 0) {
                    // İlk profil: KAPALI ALT 992mm → 2.00x
                    console.log(`   ✅ İNCE HELEZON özel: İlk profil 2.00x`);
                    return { ratio: 2.0, confidence: 0.95 };
                } else {
                    // Diğer profiller: KAPALI ALT 687mm, AÇIK ALT 687mm → 1.00x
                    console.log(`   ✅ İNCE HELEZON özel: ${profileIndex}. profil 1.00x`);
                    return { ratio: 1.0, confidence: 0.95 };
                }
            }

            // SWİNGPRO PLUS için özel mantık
            if (productName === 'SWİNGPRO PLUS') {
                if (profileIndex === 0) {
                    console.log(`   ✅ SWİNGPRO PLUS: İlk profil 2.00x`);
                    return { ratio: 2.0, confidence: 0.9 };
                } else {
                    console.log(`   ✅ SWİNGPRO PLUS: ${profileIndex}. profil 1.00x`);
                    return { ratio: 1.0, confidence: 0.9 };
                }
            }

            // Genel çok profilli mantık
            if (profileIndex === 0) {
                console.log(`   ✅ Genel: İlk profil 2.00x`);
                return { ratio: 2.0, confidence: 0.8 };
            } else {
                console.log(`   ✅ Genel: ${profileIndex}. profil 1.00x`);
                return { ratio: 1.0, confidence: 0.8 };
            }
        }

        // Profil adı bazlı arama (GENEL profiller için)
        const profileKeys = Object.keys(this.excelData.combinations).filter(key => 
            key.startsWith(`${productName}|${size}|`)
        );

        if (profileKeys.length > 0) {
            // İlk bulunan profili kullan
            const firstKey = profileKeys[0];
            if (firstKey && this.excelData.combinations[firstKey]) {
                const comboData = this.excelData.combinations[firstKey];
                console.log(`   ✅ Profil eşleşme: ${comboData.averageRatio.toFixed(2)}x`);
                return {
                    ratio: comboData.averageRatio,
                    confidence: Math.min(0.95, Math.max(0.1, comboData.patternCount / 10))
                };
            }
        }

        console.log(`   ❌ Enterprise verisinde bulunamadı`);
        return null;
    }

    private createDefaultProfileDatabase(): void {
        // Varsayılan profil veritabanı (Excel verisi yoksa)
        const defaultData: ProductProfileData = {
            productName: 'ELS',
            size: '24"X36"',
            profiles: [
                { profileName: 'KAPALI ALT', length: 992, quantity: 1000, unit: 'mm' },
                { profileName: 'KAPALI ALT', length: 687, quantity: 500, unit: 'mm' },
                { profileName: 'AÇIK ALT', length: 687, quantity: 500, unit: 'mm' }
            ],
            totalPieces: 2000,
            patterns: []
        };

        this.productProfileDatabase.set('ELS|24"X36"', [defaultData]);
    }

    private calculateProfileLength(size: string, profileName: string): number {
        // Ebat ve profile göre ölçü hesapla
        if (size.includes('"') && size.includes('X')) {
            // İnç cinsinden ebatlar
            const dimensions = size.match(/(\d+)["'']X(\d+)["'']/);
            if (dimensions && dimensions[1] && dimensions[2]) {
                const width = parseInt(dimensions[1]);
                const height = parseInt(dimensions[2]);
                
                // Profile göre özel ölçüler
                switch (profileName) {
                    case 'KAPALI ALT':
                        return width > 20 ? 992 : 687; // 24" için 992mm, 22" için 687mm
                    case 'AÇIK ALT':
                        return 687;
                    case 'GÖVDE':
                        return Math.max(width, height) * 25.4; // İnç'i mm'ye çevir
                    default:
                        return Math.max(width, height) * 25.4;
                }
            }
        } else if (size.match(/^[AB]\d$/)) {
            // A4, B1 gibi standart ebatlar
            const sizeMap: Record<string, { width: number; height: number }> = {
                'A0': { width: 841, height: 1189 },
                'A1': { width: 594, height: 841 },
                'A2': { width: 420, height: 594 },
                'A3': { width: 297, height: 420 },
                'A4': { width: 210, height: 297 },
                'B1': { width: 707, height: 1000 },
                'B2': { width: 500, height: 707 },
                'B3': { width: 353, height: 500 }
            };
            
            const dimensions = sizeMap[size];
            if (dimensions) {
                return Math.max(dimensions.width, dimensions.height);
            }
        }
        
        return 500; // Varsayılan ölçü
    }

    public calculateQuantity(
        siparisAdedi: number,
        size: string,
        profile: string,
        profileIndex: number,
        totalProfiles: number,
        productName?: string
    ): QuantityCalculation {
        try {
            console.log(`🏭 ENTERPRISE İŞ MANTIĞI: Ürün=${productName || 'AUTO'}, Sipariş=${siparisAdedi}, Ebat=${size}, Profil=${profile}, ProfilIndex=${profileIndex}`);

            // Ürün adını belirle (önce parametre, sonra otomatik tespit)
            const detectedProduct = this.detectProductFromProfile(profile, size) || productName || 'İNCE HELEZON';
            console.log(`🎯 Tespit edilen ürün: ${detectedProduct}`);

            // Enterprise veritabanından spesifik profil ara
            const enterpriseResult = this.findEnterpriseProfileData(detectedProduct, size, profile, profileIndex);
            if (enterpriseResult) {
                console.log(`✅ ENTERPRISE VERİ bulundu: ${detectedProduct}|${size}|${profile}`);
                
                const calculatedAdet = Math.round(enterpriseResult.ratio * siparisAdedi);
                
                console.log(`🎯 ${detectedProduct} → ${size} → ${profile} → ${enterpriseResult.ratio.toFixed(2)}x → ${calculatedAdet} adet`);
                
                return {
                    adet: calculatedAdet,
                    confidence: enterpriseResult.confidence,
                    method: 'enterprise_business_logic',
                    rule: `enterprise_${detectedProduct}_${size}_${profile}`,
                    description: `Enterprise: ${detectedProduct} ${profile} profili ${enterpriseResult.ratio.toFixed(2)}x oran ile ${calculatedAdet} adet`
                };
            }

            // Fallback: Eski sistem
            const realProductSizeKey = `${detectedProduct}|${size}`;
            const profileData = this.productProfileDatabase.get(realProductSizeKey);
            
            if (profileData && profileData[0]) {
                console.log(`✅ FALLBACK VERİ bulundu: ${realProductSizeKey}`);
                
                const productData = profileData[0];
                const profiles = productData.profiles;
                
                if (profiles && profiles.length > 0) {
                    // Belirli profil indexi varsa onu kullan
                    if (profileIndex !== undefined && profileIndex >= 0 && profileIndex < profiles.length) {
                        const targetProfile = profiles[profileIndex];
                        if (targetProfile) {
                            const ratio = targetProfile.quantity / 100; // 100 sipariş için normalize
                            const calculatedAdet = Math.round(ratio * siparisAdedi);
                            
                            console.log(`🎯 Profil ${profileIndex}: ${targetProfile.profileName} → ${ratio.toFixed(2)}x → ${calculatedAdet} adet`);
                            
                            return {
                                adet: calculatedAdet,
                                confidence: 0.95,
                                method: 'real_business_logic',
                                rule: `real_profile_${profileIndex}_ratio_${ratio.toFixed(2)}x`,
                                description: `Gerçek veri: ${targetProfile.profileName} profili ${ratio.toFixed(2)}x oran ile ${calculatedAdet} adet`
                            };
                        }
                    }
                    
                    // İlk profili varsayılan olarak kullan
                    const firstProfile = profiles[0];
                    if (firstProfile) {
                        const ratio = firstProfile.quantity / 100;
                        const calculatedAdet = Math.round(ratio * siparisAdedi);
                        
                        console.log(`🎯 İlk profil varsayılan: ${firstProfile.profileName} → ${ratio.toFixed(2)}x → ${calculatedAdet} adet`);
                        
                        return {
                            adet: calculatedAdet,
                            confidence: 0.9,
                            method: 'real_first_profile',
                            rule: `real_first_profile_ratio_${ratio.toFixed(2)}x`,
                            description: `Gerçek veri: İlk profil ${firstProfile.profileName} ${ratio.toFixed(2)}x oran ile ${calculatedAdet} adet`
                        };
                    }
                }
            }

            // Gerçek veri yoksa, genel çok profil kuralı uygula
            if (totalProfiles > 1) {
                const calculatedAdet = profileIndex === 0 ? siparisAdedi * 2 : siparisAdedi;
                console.log(`📋 Genel çok profil kuralı: Profil ${profileIndex + 1}/${totalProfiles} = ${calculatedAdet}`);
                return {
                    adet: calculatedAdet,
                    confidence: 0.8,
                    method: 'multi_profile_fallback',
                    rule: 'general_multi_profile',
                    description: `Genel kural: ${profileIndex === 0 ? 'İlk profil 2x' : 'Diğer profiller 1x'}`
                };
            }

            // 2. Ürün+Ebat kombinasyonundan profil verilerini bul
            const fallbackProductSizeKey = this.findProductSizeKey(size, profile);
            if (fallbackProductSizeKey && this.productProfileDatabase.has(fallbackProductSizeKey)) {
                const profileData = this.productProfileDatabase.get(fallbackProductSizeKey)!;
                if (profileData && profileData[0]) {
                    const targetProfile = profileData[0].profiles.find(p => 
                        p.profileName === profile || (!profile && p.profileName === '')
                    );

                    if (targetProfile && profileData[0].totalPieces > 0) {
                        // Profil bazlı parça hesaplama
                        const calculatedAdet = Math.round((targetProfile.quantity / profileData[0].totalPieces) * siparisAdedi);
                        console.log(`🔍 Profil bazlı hesaplama: ${profile} (${targetProfile.length}mm) = ${calculatedAdet} adet`);
                        
                        return {
                            adet: calculatedAdet,
                            confidence: 0.95,
                            method: 'profile_based',
                            rule: 'profile_based',
                            description: `Profil bazlı: ${profile} (${targetProfile.length}mm) = ${calculatedAdet} adet`
                        };
                    }
                }
            }

            // 3. Varsayılan kural
            const calculatedAdet = siparisAdedi * 2;
            console.log(`🔄 Varsayılan kural: 2x (${calculatedAdet})`);
            return {
                adet: calculatedAdet,
                confidence: 0.8,
                method: 'default',
                rule: 'default',
                description: 'Varsayılan kural: 2x'
            };

        } catch (error) {
            console.error('❌ Miktar hesaplama hatası:', error);
            return {
                adet: siparisAdedi * 2,
                confidence: 0.5,
                method: 'error_fallback',
                rule: 'error_fallback',
                description: 'Hata durumunda varsayılan 2x kuralı'
            };
        }
    }

    private findProductSizeKey(size: string, profile: string): string | null {
        // Ürün+Ebat kombinasyonunu bul
        for (const [key, data] of this.productProfileDatabase.entries()) {
            const parts = key.split('|');
            if (parts.length !== 2) continue;
            
            const productSize = parts[1];
            
            // Ebat eşleşmesi
            if (productSize === size && data && data[0]) {
                // Profil eşleşmesi kontrol et
                const hasMatchingProfile = data[0].profiles.some(p => 
                    p.profileName === profile || (!profile && p.profileName === '')
                );
                
                if (hasMatchingProfile) {
                    return key;
                }
            }
        }
        
        return null;
    }

    public getProfilePieces(
        productName: string,
        size: string,
        siparisAdedi: number
    ): ProfilePiece[] | null {
        const key = `${productName}|${size}`;
        const profileData = this.productProfileDatabase.get(key);
        
        if (!profileData || !profileData[0]) {
            return null;
        }

        // Her profil için sipariş adedine göre parça hesapla
        const totalPieces = profileData[0].totalPieces;
        if (!totalPieces || totalPieces <= 0) {
            return null;
        }
        
        return profileData[0].profiles.map(profile => ({
            ...profile,
            quantity: Math.round((profile.quantity / totalPieces) * siparisAdedi)
        }));
    }

    public getPossibleQuantities(
        siparisAdedi: number,
        size: string,
        profile: string,
        _profileIndex: number,
        totalProfiles: number
    ): number[] {
        const possibilities: number[] = [];
        
        // Çok profil durumu
        if (totalProfiles > 1) {
            possibilities.push(siparisAdedi * 2); // İlk profil
            possibilities.push(siparisAdedi);     // Diğer profiller
        }

        // Profil bazlı parça hesaplama
        const productSizeKey = this.findProductSizeKey(size, profile);
        if (productSizeKey && this.productProfileDatabase.has(productSizeKey)) {
            const profileData = this.productProfileDatabase.get(productSizeKey)!;
            if (profileData && profileData[0] && profileData[0].totalPieces > 0) {
                const totalPieces = profileData[0].totalPieces;
                profileData[0].profiles.forEach(p => {
                    const calculatedAdet = Math.round((p.quantity / totalPieces) * siparisAdedi);
                    possibilities.push(calculatedAdet);
                });
            }
        }

        // Standart oranlar
        possibilities.push(siparisAdedi * 1);  // 1x
        possibilities.push(siparisAdedi * 2);  // 2x
        possibilities.push(siparisAdedi * 4);  // 4x

        // Tekrarlanan değerleri kaldır ve sırala
        return [...new Set(possibilities)].sort((a, b) => a - b);
    }

    public getQuantitySuggestions(
        siparisAdedi: number,
        size: string,
        profile: string,
        _profileIndex: number,
        totalProfiles: number
    ): { adet: number; confidence: number; rule: string; description: string }[] {
        const suggestions: { adet: number; confidence: number; rule: string; description: string }[] = [];

        // Çok profil durumu
        if (totalProfiles > 1) {
            suggestions.push({
                adet: _profileIndex === 0 ? siparisAdedi * 2 : siparisAdedi,
                confidence: 1.0,
                rule: 'multi_profile',
                description: `Çok profil: ${_profileIndex === 0 ? 'İlk profil 2x' : 'Diğer profil 1x'}`
            });
        }

        // Profil bazlı parça önerileri
        const productSizeKey = this.findProductSizeKey(size, profile);
        if (productSizeKey && this.productProfileDatabase.has(productSizeKey)) {
            const profileData = this.productProfileDatabase.get(productSizeKey)!;
            if (profileData && profileData[0] && profileData[0].totalPieces > 0) {
                const totalPieces = profileData[0].totalPieces;
                profileData[0].profiles.forEach(p => {
                    const calculatedAdet = Math.round((p.quantity / totalPieces) * siparisAdedi);
                    suggestions.push({
                        adet: calculatedAdet,
                        confidence: 0.95,
                        rule: 'profile_based',
                        description: `Profil: ${p.profileName || '(Boş)'} (${p.length}mm) = ${calculatedAdet} adet`
                    });
                });
            }
        }

        // Standart öneriler
        suggestions.push({
            adet: siparisAdedi * 2,
            confidence: 0.8,
            rule: 'standard',
            description: 'Standart kural: 2x'
        });

        // Güvene göre sırala ve tekrarları kaldır
        const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
            index === self.findIndex(s => s.adet === suggestion.adet)
        );

        return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);
    }

    public validateQuantity(
        siparisAdedi: number,
        suggestedAdet: number,
        size: string,
        profile: string,
        profileIndex: number,
        totalProfiles: number
    ): QuantityValidation {
        const calculated = this.calculateQuantity(siparisAdedi, size, profile, profileIndex, totalProfiles);
        const difference = Math.abs(suggestedAdet - calculated.adet);
        const percentageDiff = (difference / calculated.adet) * 100;

        // Makul aralık: hesaplanan değerin %30'u kadar tolerans
        const tolerance = calculated.adet * 0.3;
        const isReasonable = difference <= tolerance;

        let validationMessage = '';
        if (isReasonable) {
            validationMessage = `✅ Önerilen miktar makul (${calculated.adet} ± ${Math.round(tolerance)})`;
        } else {
            validationMessage = `⚠️ Önerilen miktar makul değil. Hesaplanan: ${calculated.adet}, Önerilen: ${suggestedAdet}`;
        }

        return {
            isValid: isReasonable,
            calculatedAdet: calculated.adet,
            difference,
            percentageDiff,
            message: validationMessage,
            confidence: calculated.confidence,
            rule: calculated.rule
        };
    }

    // Excel analizinden elde edilen istatistikler
    public getAnalysisStats(): any {
        if (!this.excelData) {
            return {
                error: 'Excel analiz verisi yüklenmedi',
                totalProductProfiles: this.productProfileDatabase.size
            };
        }

        return {
            ...this.excelData.summary,
            productProfileDatabase: {
                totalCombinations: this.productProfileDatabase.size,
                combinations: Array.from(this.productProfileDatabase.entries()).map(([key, data]) => {
                    if (!data || !data[0]) return null;
                    return {
                        key,
                        productName: data[0].productName,
                        size: data[0].size,
                        profileCount: data[0].profiles.length,
                        totalPieces: data[0].totalPieces
                    };
                }).filter(Boolean)
            },
            dataSource: 'Excel analizi (Profil bazlı parça hesaplama)'
        };
    }
}
