/**
 * @fileoverview Material Profile Mapping Controller
 * @module controllers/materialProfileMappingController
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { materialProfileMappingService, type SaveMappingRequest } from '../services/materialProfileMappingService';

export class MaterialProfileMappingController {
  /**
   * Malzeme numarası için profil önerileri getir
   * GET /api/material-profile-mappings/suggestions?malzemeNo=UGPDB02100X3010
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { malzemeNo } = req.query;

      if (!malzemeNo || typeof malzemeNo !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Malzeme numarası gerekli'
        });
        return;
      }

      const suggestions = await materialProfileMappingService.getSuggestions(malzemeNo);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Profil önerileri alınamadı'
      });
    }
  }

  /**
   * Kullanıcı girdiğinden yeni mapping kaydet
   * POST /api/material-profile-mappings
   */
  async saveMappingFromUserInput(req: Request, res: Response): Promise<void> {
    try {
      const data: SaveMappingRequest = req.body;

      // Validation
      if (!data.malzemeNo || !data.profileType || !data.length) {
        res.status(400).json({
          success: false,
          error: 'Malzeme numarası, profil tipi ve uzunluk gerekli'
        });
        return;
      }

      if (data.length <= 0) {
        res.status(400).json({
          success: false,
          error: 'Uzunluk pozitif bir sayı olmalı'
        });
        return;
      }

      await materialProfileMappingService.saveMappingFromUserInput(data);

      res.json({
        success: true,
        message: 'Profil mapping kaydedildi'
      });
    } catch (error) {
      console.error('Error in saveMappingFromUserInput:', error);
      res.status(500).json({
        success: false,
        error: 'Profil mapping kaydedilemedi'
      });
    }
  }

  /**
   * En popüler mapping'i getir
   * GET /api/material-profile-mappings/most-popular?malzemeNo=UGPDB02100X3010
   */
  async getMostPopularMapping(req: Request, res: Response): Promise<void> {
    try {
      const { malzemeNo } = req.query;

      if (!malzemeNo || typeof malzemeNo !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Malzeme numarası gerekli'
        });
        return;
      }

      const mapping = await materialProfileMappingService.getMostPopularMapping(malzemeNo);

      res.json({
        success: true,
        data: mapping
      });
    } catch (error) {
      console.error('Error in getMostPopularMapping:', error);
      res.status(500).json({
        success: false,
        error: 'En popüler mapping alınamadı'
      });
    }
  }

  /**
   * Benzer malzeme numaraları için öneriler getir
   * GET /api/material-profile-mappings/similar?malzemeNo=UGPDB02100X3010
   */
  async getSimilarSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { malzemeNo } = req.query;

      if (!malzemeNo || typeof malzemeNo !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Malzeme numarası gerekli'
        });
        return;
      }

      const suggestions = await materialProfileMappingService.getSimilarSuggestions(malzemeNo);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error in getSimilarSuggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Benzer öneriler alınamadı'
      });
    }
  }
}

export const materialProfileMappingController = new MaterialProfileMappingController();