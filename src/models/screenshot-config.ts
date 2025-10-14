/**
 * Configuration interface for screenshot capture behavior.
 * 
 * @property fullPage - Whether to capture full page screenshot (true) or viewport only (false)
 * @property maxHeight - Maximum height for full page screenshots (in pixels)
 * @property timeout - Maximum time to wait for page load (in milliseconds)
 * @property quality - Image quality for compression (0-100)
 * @property delayBeforeCapture - Delay before capturing screenshot (in milliseconds, default: 500)
 * @property waitForImages - Whether to wait for images to load before capturing (default: true)
 * @property waitForFonts - Whether to wait for fonts to load before capturing (default: true)
 */
export interface ScreenshotConfig {
  fullPage: boolean;
  maxHeight: number;
  timeout: number;
  quality: number;
  delayBeforeCapture?: number;
  waitForImages?: boolean;
  waitForFonts?: boolean;
}

/**
 * Default screenshot configuration
 * Maintains backward compatibility with existing behavior
 */
export const DEFAULT_SCREENSHOT_CONFIG: ScreenshotConfig = {
  fullPage: false,           // Maintains backward compatibility
  maxHeight: 20000,          // Covers 99% of real-world pages
  timeout: 60000,            // 60 seconds for complex pages
  quality: 90,               // High quality with reasonable file size
  delayBeforeCapture: 500,   // 500ms delay to let page settle
  waitForImages: true,       // Ensure images are loaded
  waitForFonts: true         // Ensure fonts are loaded
};

/**
 * Validation rules for ScreenshotConfig
 */
export const SCREENSHOT_CONFIG_VALIDATION = {
  maxHeight: { min: 1000, max: 50000 },
  timeout: { min: 10000, max: 300000 },
  quality: { min: 0, max: 100 }
} as const;