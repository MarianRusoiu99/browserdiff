/**
 * URL sanitization utilities for filesystem-safe directory names
 */

import { UrlSanitizationConfig, DEFAULT_URL_SANITIZATION_CONFIG } from '../models/url-sanitization-config';

/**
 * Sanitizes a URL for use as a filesystem-safe directory name
 */
export function sanitizeUrlForFilesystem(
  url: string,
  config: UrlSanitizationConfig = DEFAULT_URL_SANITIZATION_CONFIG
): string {
  let sanitized = url;

  // Remove protocol if configured
  if (config.removeProtocol) {
    sanitized = sanitized.replace(/^https?:\/\//i, '');
  }

  // Apply character mapping for invalid filesystem characters
  // When preserveStructure is true, skip mapping '/' to preserve directory structure
  const effectiveCharacterMap = { ...config.characterMap };
  if (config.preserveStructure) {
    delete effectiveCharacterMap['/'];
  }

  for (const [invalidChar, replacement] of Object.entries(effectiveCharacterMap)) {
    sanitized = sanitized.replace(new RegExp(`\\${invalidChar}`, 'g'), replacement);
  }

  // Handle preserveStructure: convert remaining slashes to dashes if false
  if (!config.preserveStructure) {
    sanitized = sanitized.replace(/\//g, '-');
  }

  // Truncate to maxLength
  if (sanitized.length > config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }

  // Remove leading/trailing dashes or dots that could cause issues
  sanitized = sanitized.replace(/^[-.]+|[-.]+$/g, '');

  // Ensure we have at least some content
  if (!sanitized) {
    sanitized = 'unnamed';
  }

  return sanitized;
}

/**
 * Validates that a sanitized URL is filesystem-safe
 */
export function isFilesystemSafe(sanitizedUrl: string): boolean {
  // Check for invalid characters
  const invalidChars = /[<>:"|?*\\]/;
  if (invalidChars.test(sanitizedUrl)) {
    return false;
  }

  // Check for reserved names (Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(sanitizedUrl)) {
    return false;
  }

  // Check for leading/trailing spaces or dots
  if (/^\s|\s$|^\.|\.$/.test(sanitizedUrl)) {
    return false;
  }

  return true;
}

/**
 * Generates a collision-resistant directory name by appending a suffix if needed
 */
export function generateCollisionSafeName(
  baseName: string,
  existingNames: string[],
  maxAttempts: number = 100
): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  for (let i = 1; i <= maxAttempts; i++) {
    const candidate = `${baseName}_${i}`;
    if (!existingNames.includes(candidate)) {
      return candidate;
    }
  }

  // Fallback: use timestamp
  return `${baseName}_${Date.now()}`;
}