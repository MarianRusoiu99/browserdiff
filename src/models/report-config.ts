import { UrlSanitizationConfig, DEFAULT_URL_SANITIZATION_CONFIG } from './url-sanitization-config';

/**
 * Configuration for report generation and output organization
 */
export interface ReportConfig {
  /** Enable structured output directory organization */
  structured: boolean;

  /** Directory naming pattern for structured output */
  directoryPattern: string;

  /** URL sanitization configuration */
  urlSanitization: UrlSanitizationConfig;
}

/**
 * Default report configuration
 * Maintains backward compatibility with existing behavior
 */
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  structured: false,                                    // Maintains backward compatibility
  directoryPattern: 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',  // ISO timestamp + URL
  urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
};