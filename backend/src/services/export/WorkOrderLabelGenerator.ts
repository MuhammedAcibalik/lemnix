/**
 * Work Order Label Generator
 * Generate printable QR-coded labels for segments
 * 
 * @module services/export
 * @version 1.0.0
 */

import QRCode from 'qrcode';
import type { WorkOrderLabelData } from './types';

/**
 * Generate work order labels
 * Creates printable labels with QR codes for production tracking
 */
export class WorkOrderLabelGenerator {
  /**
   * Generate labels for all segments
   */
  public async generateAll(labels: ReadonlyArray<WorkOrderLabelData>): Promise<Buffer> {
    const labelPages = await Promise.all(
      labels.map(label => this.generateSingleLabel(label))
    );

    // TODO: Combine into single PDF with multiple labels per page
    // For now, return JSON representation
    const output = {
      labels: labelPages,
      totalLabels: labels.length,
      generatedAt: new Date().toISOString(),
    };

    return Buffer.from(JSON.stringify(output, null, 2), 'utf-8');
  }

  /**
   * Generate single label
   */
  private async generateSingleLabel(label: WorkOrderLabelData): Promise<{
    qrCode: string;
    stockNumber: number;
    segmentNumber: number;
    profileType: string;
    length: string;
    quantity: number;
    workOrderId: string;
    position: string;
    barcode: string;
  }> {
    const qrCode = await this.generateQRCode(label.qrCodeData);

    return {
      qrCode,
      stockNumber: label.stockIndex,
      segmentNumber: label.segmentIndex,
      profileType: label.profileType,
      length: `${label.length}mm`,
      quantity: label.quantity,
      workOrderId: label.workOrderId,
      position: `${label.position}mm`,
      barcode: label.segmentId,
    };
  }

  /**
   * Generate QR code for segment
   */
  private async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  }
}

