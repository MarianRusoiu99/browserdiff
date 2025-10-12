/**
 * Configuration for URL sanitization when creating directory names
 */
export interface UrlSanitizationConfig {
  /** Maximum length for sanitized URL portion */
  maxLength: number;

  /** Whether to remove protocol (http://, https://) */
  removeProtocol: boolean;

  /** Character replacement mapping for invalid filesystem characters */
  characterMap: Record<string, string>;

  /** Whether to preserve subdirectories as dashes */
  preserveStructure: boolean;
}

/**
 * Default URL sanitization configuration
 */
export const DEFAULT_URL_SANITIZATION_CONFIG: UrlSanitizationConfig = {
  maxLength: 100,
  removeProtocol: true,
  characterMap: {
    '/': '-',
    '\\': '-',
    ':': '-',
    '*': '-',
    '?': '-',
    '"': '-',
    '<': '-',
    '>': '-',
    '|': '-'
  },
  preserveStructure: true
};