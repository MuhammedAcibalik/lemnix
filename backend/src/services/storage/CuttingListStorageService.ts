/**
 * @fileoverview Cutting List Storage Service
 * @module CuttingListStorageService
 * @version 1.0.0
 * @description Handles persistence of cutting lists to file storage
 */

import * as fs from "fs";
import * as path from "path";
import { MeasurementConverter } from "../../utils/measurementConverter";

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
  readonly status?: "draft" | "ready" | "processing" | "completed";
  readonly priority?: "low" | "medium" | "high" | "urgent";
  readonly createdAt?: string;
  readonly updatedAt?: string;
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

/**
 * Service responsible for persisting cutting lists to file storage
 * Follows Single Responsibility Principle (SRP)
 */
export class CuttingListStorageService {
  private readonly storageFile: string;
  private cuttingLists: Map<string, CuttingList>;

  constructor(storageDir?: string) {
    // Set up storage directory
    const baseDir = storageDir || path.join(__dirname, "../../../data");
    
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log("[INFO] [STORAGE] Created storage directory:", baseDir);
    }

    this.storageFile = path.join(baseDir, "cutting-lists.json");
    console.log("[INFO] [STORAGE] Storage file path:", this.storageFile);

    // Validate write permissions
    try {
      fs.accessSync(baseDir, fs.constants.W_OK);
      console.log("[INFO] [STORAGE] Storage directory is writable");
    } catch (error) {
      console.error(
        "[ERROR] [STORAGE] Storage directory is not writable:",
        baseDir,
      );
      throw new Error("Storage directory is not writable");
    }

    this.cuttingLists = new Map();
    this.loadFromStorage();
  }

  /**
   * Get all cutting lists
   */
  public getAll(): CuttingList[] {
    return Array.from(this.cuttingLists.values());
  }

  /**
   * Get a cutting list by ID
   */
  public getById(id: string): CuttingList | undefined {
    return this.cuttingLists.get(id);
  }

  /**
   * Save a cutting list
   */
  public save(cuttingList: CuttingList): void {
    this.cuttingLists.set(cuttingList.id, cuttingList);
    this.saveToStorage();
  }

  /**
   * Delete a cutting list by ID
   */
  public delete(id: string): boolean {
    const deleted = this.cuttingLists.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Check if a cutting list exists
   */
  public exists(id: string): boolean {
    return this.cuttingLists.has(id);
  }

  /**
   * Get the count of cutting lists
   */
  public count(): number {
    return this.cuttingLists.size;
  }

  /**
   * Save data to file storage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cuttingLists.entries());
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.storageFile, jsonData, "utf8");
      console.log(
        `[STORAGE] Saved ${data.length} cutting lists to ${this.storageFile}`,
      );
    } catch (error) {
      console.error("[STORAGE] Error saving to storage:", error);
    }
  }

  /**
   * Load data from file storage
   */
  private loadFromStorage(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const jsonData = fs.readFileSync(this.storageFile, "utf8");
        const data = JSON.parse(jsonData);

        // Support both Array and Map formats
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          Array.isArray(data[0]) &&
          data[0].length === 2
        ) {
          // Data is in Map format: [[id, cuttingList], ...]
          this.cuttingLists = new Map(data);
          console.log(
            `[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Map format`,
          );
          console.log(
            `[STORAGE] First few IDs:`,
            Array.from(this.cuttingLists.keys()).slice(0, 3),
          );
        } else if (Array.isArray(data)) {
          // Data is in Array format
          this.cuttingLists = new Map();
          data.forEach((cuttingList, index) => {
            if (cuttingList && cuttingList.id) {
              this.cuttingLists.set(cuttingList.id, cuttingList);
            } else {
              console.log(
                `[STORAGE] Warning: Invalid cutting list at index ${index}`,
              );
            }
          });
          console.log(
            `[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Array format`,
          );
          console.log(
            `[STORAGE] First few IDs:`,
            Array.from(this.cuttingLists.keys()).slice(0, 3),
          );
        } else {
          // Unknown format
          console.log(
            "[STORAGE] ❌ Unknown data format, starting with empty storage",
          );
          console.log(
            "[STORAGE] Data type:",
            typeof data,
            "Array?",
            Array.isArray(data),
          );
          if (Array.isArray(data) && data.length > 0) {
            console.log(
              "[STORAGE] First item type:",
              typeof data[0],
              "Array?",
              Array.isArray(data[0]),
            );
          }
          this.cuttingLists = new Map();
        }

        // Cleanup existing measurements (CMmm, CM etc.)
        this.cleanupExistingMeasurements();
      } else {
        console.log(
          "[INFO] [STORAGE] No existing storage file found, starting with empty storage",
        );
      }
    } catch (error) {
      console.error("[ERROR] [STORAGE] Error loading from storage:", error);
      console.log("[WARN] [STORAGE] Starting with empty storage due to error");
      this.cuttingLists = new Map();
    }
  }

  /**
   * Cleanup existing measurement formats
   */
  private cleanupExistingMeasurements(): void {
    let hasChanges = false;

    this.cuttingLists.forEach((cuttingList) => {
      cuttingList.sections.forEach((section) => {
        section.items.forEach((item) => {
          item.profiles.forEach((profile) => {
            const originalMeasurement = profile.measurement;
            const cleanedMeasurement =
              MeasurementConverter.convertToMM(originalMeasurement);

            if (originalMeasurement !== cleanedMeasurement) {
              console.log(
                `[CLEANUP] Converting measurement: "${originalMeasurement}" → "${cleanedMeasurement}"`,
              );
              (profile as { measurement: string }).measurement =
                cleanedMeasurement;
              hasChanges = true;
            }
          });
        });
      });
    });

    if (hasChanges) {
      console.log("[CLEANUP] Measurements cleaned up, saving changes");
      this.saveToStorage();
    }
  }
}
