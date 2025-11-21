/**
 * WGSL Shader Loader
 * Loads and caches WebGPU compute shaders
 *
 * @module optimization/shaders
 * @version 1.0.0
 */

import * as fs from "fs";
import * as path from "path";

export class ShaderLoader {
  private static cache = new Map<string, string>();

  /**
   * Load WGSL shader from file with caching
   * @param shaderName - Shader filename without .wgsl extension
   * @returns WGSL shader code as string
   */
  public static loadShader(shaderName: string): string {
    // Check cache first
    if (this.cache.has(shaderName)) {
      return this.cache.get(shaderName)!;
    }

    // Load from file
    const shaderPath = path.join(__dirname, `${shaderName}.wgsl`);

    try {
      const shaderCode = fs.readFileSync(shaderPath, "utf-8");

      // Validate basic structure
      if (!shaderCode.includes("@compute")) {
        throw new Error(`Shader ${shaderName} is missing @compute directive`);
      }

      // Cache for future use
      this.cache.set(shaderName, shaderCode);

      return shaderCode;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to load shader ${shaderName}: ${error.message}`,
        );
      }
      throw new Error(`Failed to load shader ${shaderName}: Unknown error`);
    }
  }

  /**
   * Preload all shaders into cache
   * Useful for startup initialization
   */
  public static preloadAll(): void {
    const shaders = [
      "fitness",
      "tournament-selection",
      "order-crossover",
      "swap-mutation",
      "nsga2-dominance",
      "crowding-distance",
    ];

    for (const shaderName of shaders) {
      this.loadShader(shaderName);
    }
  }

  /**
   * Clear shader cache
   * Useful for hot-reloading in development
   */
  public static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if shader is cached
   */
  public static isCached(shaderName: string): boolean {
    return this.cache.has(shaderName);
  }

  /**
   * Get all cached shader names
   */
  public static getCachedShaders(): readonly string[] {
    return Array.from(this.cache.keys());
  }
}
