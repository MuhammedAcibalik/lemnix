/**
 * @fileoverview Material Profile Mapping Service
 * @module services/materialProfileMappingService
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProfileSuggestion {
  readonly profileType: string;
  readonly length: number;
  readonly usageCount: number;
  readonly lastUsed: string;
  readonly confidence: 'high' | 'medium' | 'low';
}

export interface SaveMappingRequest {
  readonly malzemeNo: string;
  readonly malzemeKisaMetni: string;
  readonly profileType: string;
  readonly length: number;
  readonly createdBy?: string;
}

export class MaterialProfileMappingService {
  /**
   * Malzeme numarası için profil önerileri getir
   */
  async getSuggestions(malzemeNo: string): Promise<ProfileSuggestion[]> {
    try {
      const mappings = await (prisma as unknown as { materialProfileMapping: any }).materialProfileMapping.findMany({
        where: {
          malzemeNo: {
            contains: malzemeNo,
            mode: 'insensitive'
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { lastUsed: 'desc' }
        ],
        take: 10
      });

      return mappings.map((mapping: any) => ({
        profileType: mapping.profileType,
        length: mapping.length,
        usageCount: mapping.usageCount,
        lastUsed: mapping.lastUsed.toISOString(),
        confidence: this.calculateConfidence(mapping.usageCount)
      }));
    } catch (error) {
      console.error('Error getting profile suggestions:', error);
      throw new Error('Profil önerileri alınamadı');
    }
  }

  /**
   * Kullanıcı girdiğinden yeni mapping kaydet
   */
  async saveMappingFromUserInput(data: SaveMappingRequest): Promise<void> {
    try {
      await (prisma as unknown as { materialProfileMapping: any }).materialProfileMapping.upsert({
        where: {
          malzemeNo_profileType_length: {
            malzemeNo: data.malzemeNo,
            profileType: data.profileType,
            length: data.length
          }
        },
        update: {
          usageCount: {
            increment: 1
          },
          lastUsed: new Date(),
          malzemeKisaMetni: data.malzemeKisaMetni
        },
        create: {
          malzemeNo: data.malzemeNo,
          malzemeKisaMetni: data.malzemeKisaMetni,
          profileType: data.profileType,
          length: data.length,
          usageCount: 1,
          lastUsed: new Date(),
          createdBy: data.createdBy
        }
      });
    } catch (error) {
      console.error('Error saving profile mapping:', error);
      throw new Error('Profil mapping kaydedilemedi');
    }
  }

  /**
   * Mapping usage count artır
   */
  async incrementUsageCount(malzemeNo: string, profileType: string, length: number): Promise<void> {
    try {
      await (prisma as unknown as { materialProfileMapping: any }).materialProfileMapping.updateMany({
        where: {
          malzemeNo,
          profileType,
          length
        },
        data: {
          usageCount: {
            increment: 1
          },
          lastUsed: new Date()
        }
      });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Confidence seviyesi hesapla
   */
  private calculateConfidence(usageCount: number): 'high' | 'medium' | 'low' {
    if (usageCount >= 5) return 'high';
    if (usageCount >= 2) return 'medium';
    return 'low';
  }

  /**
   * Malzeme numarasına göre en popüler mapping'i getir
   */
  async getMostPopularMapping(malzemeNo: string): Promise<ProfileSuggestion | null> {
    try {
      const mapping = await (prisma as unknown as { materialProfileMapping: any }).materialProfileMapping.findFirst({
        where: {
          malzemeNo: {
            contains: malzemeNo,
            mode: 'insensitive'
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { lastUsed: 'desc' }
        ]
      });

      if (!mapping) return null;

      return {
        profileType: mapping.profileType,
        length: mapping.length,
        usageCount: mapping.usageCount,
        lastUsed: mapping.lastUsed.toISOString(),
        confidence: this.calculateConfidence(mapping.usageCount)
      };
    } catch (error) {
      console.error('Error getting most popular mapping:', error);
      return null;
    }
  }

  /**
   * Benzer malzeme numaraları için öneriler getir
   */
  async getSimilarSuggestions(malzemeNo: string): Promise<ProfileSuggestion[]> {
    try {
      // Malzeme numarasının ilk kısmını al (prefix matching)
      const prefix = malzemeNo.substring(0, 6);
      
      const mappings = await (prisma as unknown as { materialProfileMapping: any }).materialProfileMapping.findMany({
        where: {
          malzemeNo: {
            startsWith: prefix,
            mode: 'insensitive'
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { lastUsed: 'desc' }
        ],
        take: 5
      });

      return mappings.map((mapping: any) => ({
        profileType: mapping.profileType,
        length: mapping.length,
        usageCount: mapping.usageCount,
        lastUsed: mapping.lastUsed.toISOString(),
        confidence: this.calculateConfidence(mapping.usageCount)
      }));
    } catch (error) {
      console.error('Error getting similar suggestions:', error);
      return [];
    }
  }
}

export const materialProfileMappingService = new MaterialProfileMappingService();