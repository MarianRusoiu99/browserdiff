import { TestConfig } from '../models/Config';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('URL must use http or https protocol');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Invalid URL: ${url}`);
  }
}

export function validateBrowser(browser: string): void {
  const validBrowsers = ['chromium', 'firefox', 'webkit'];
  if (!validBrowsers.includes(browser.toLowerCase())) {
    throw new ValidationError(
      `Invalid browser: ${browser}. Must be one of: ${validBrowsers.join(', ')}`
    );
  }
}

export function validateBrowsers(browsers: string[]): void {
  if (browsers.length === 0) {
    throw new ValidationError('At least one browser must be specified');
  }

  for (const browser of browsers) {
    validateBrowser(browser);
  }

  // Check for duplicates
  const unique = new Set(browsers.map((b) => b.toLowerCase()));
  if (unique.size !== browsers.length) {
    throw new ValidationError('Duplicate browsers specified');
  }
}

export function validateViewport(width: number, height: number): void {
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 7680;
  const MIN_HEIGHT = 240;
  const MAX_HEIGHT = 4320;

  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    throw new ValidationError(
      `Viewport width must be between ${MIN_WIDTH} and ${MAX_WIDTH}`
    );
  }

  if (height < MIN_HEIGHT || height > MAX_HEIGHT) {
    throw new ValidationError(
      `Viewport height must be between ${MIN_HEIGHT} and ${MAX_HEIGHT}`
    );
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new ValidationError('Viewport dimensions must be integers');
  }
}

export function validateThreshold(threshold: number): void {
  if (threshold < 0 || threshold > 1) {
    throw new ValidationError('Threshold must be between 0.0 and 1.0');
  }
}

export function validateParallelCount(parallel: number): void {
  if (parallel < 1) {
    throw new ValidationError('Parallel count must be at least 1');
  }

  if (parallel > 10) {
    throw new ValidationError('Parallel count cannot exceed 10');
  }

  if (!Number.isInteger(parallel)) {
    throw new ValidationError('Parallel count must be an integer');
  }
}

export function validateTimeout(timeout: number): void {
  if (timeout < 1000) {
    throw new ValidationError('Timeout must be at least 1000ms');
  }

  if (timeout > 300000) {
    throw new ValidationError('Timeout cannot exceed 300000ms (5 minutes)');
  }

  if (!Number.isInteger(timeout)) {
    throw new ValidationError('Timeout must be an integer');
  }
}

export function validateConfig(config: TestConfig): void {
  // Validate browsers
  validateBrowsers(config.browsers);

  // Validate viewport
  validateViewport(config.viewport.width, config.viewport.height);

  // Validate threshold
  validateThreshold(config.comparison.threshold);

  // Validate timeouts
  validateTimeout(config.timeout.pageLoad);
  validateTimeout(config.timeout.screenshot);

  // Validate retry config
  if (config.retry.attempts < 0 || config.retry.attempts > 10) {
    throw new ValidationError('Retry attempts must be between 0 and 10');
  }

  if (config.retry.delay < 0 || config.retry.delay > 60000) {
    throw new ValidationError('Retry delay must be between 0 and 60000ms');
  }

  // Validate parallel count if specified
  if (config.parallel !== undefined) {
    validateParallelCount(config.parallel);
  }
}

export function validateOutputDirectory(directory: string): void {
  if (!directory || directory.trim().length === 0) {
    throw new ValidationError('Output directory cannot be empty');
  }

  // Check for invalid characters
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(directory)) {
    throw new ValidationError('Output directory contains invalid characters');
  }
}

export function validateBaselineId(id: string): void {
  if (!id || id.trim().length === 0) {
    throw new ValidationError('Baseline ID cannot be empty');
  }

  // Check if it looks like a UUID
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) {
    throw new ValidationError('Invalid baseline ID format (expected UUID)');
  }
}
