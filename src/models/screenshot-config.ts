/**
 * Configuration for screenshot capture behavior
 */
export interface ScreenshotConfig {
  /** Enable full page screenshot capture */
  fullPage: boolean;

  /** Maximum page height for full page screenshots (default: 20000px) */
  maxHeight: number;

  /** Timeout for screenshot capture in milliseconds (default: 60000) */
  timeout: number;

  /** Quality setting for PNG compression (0-100, default: 90) */
  quality: number;
}

/**
 * Default screenshot configuration
 * Maintains backward compatibility with existing behavior
 */
export const DEFAULT_SCREENSHOT_CONFIG: ScreenshotConfig = {
  fullPage: false,           // Maintains backward compatibility
  maxHeight: 20000,          // Covers 99% of real-world pages
  timeout: 60000,            // 60 seconds for complex pages
  quality: 90                // High quality with reasonable file size
};

/**
 * Validation rules for ScreenshotConfig
 */
export const SCREENSHOT_CONFIG_VALIDATION = {
  maxHeight: { min: 1000, max: 50000 },
  timeout: { min: 10000, max: 300000 },
  quality: { min: 0, max: 100 }
} as const;