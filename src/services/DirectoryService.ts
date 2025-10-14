import * as fs from 'fs';
import * as path from 'path';
import { ReportStructure } from '../models/report-structure';
import { UrlSanitizationConfig } from '../models/url-sanitization-config';
import { sanitizeUrlForFilesystem } from '../utils/url-sanitization';

/**
 * Service for managing structured directory organization for test reports
 */
export class DirectoryService {
  /**
   * Create a structured test directory with timestamp and sanitized URL
   * @param baseDir - Base output directory
   * @param timestamp - Timestamp for the test run
   * @param url - Original URL being tested
   * @param directoryPattern - Pattern for directory naming (e.g., 'YYYY-MM-DD_HH-mm-ss_{url}')
   * @param urlSanitizationConfig - Configuration for URL sanitization
   * @returns Promise<ReportStructure> - Created directory structure
   */
  public async createTestDirectory(
    baseDir: string,
    timestamp: Date,
    url: string,
    directoryPattern: string,
    urlSanitizationConfig: UrlSanitizationConfig
  ): Promise<ReportStructure> {
    // Sanitize the URL for use in directory name
    const sanitizedUrl = sanitizeUrlForFilesystem(url, urlSanitizationConfig);

    // Format the directory name according to the pattern
    const directoryName = this.formatDirectoryName(
      directoryPattern,
      timestamp,
      sanitizedUrl
    );

    // Resolve potential collisions
    const finalDirectoryName = await this.resolveCollisions(
      path.join(baseDir, directoryName)
    );

    // Create the base directory structure
    const reportStructure: ReportStructure = {
      baseDirectory: finalDirectoryName,
      timestamp,
      sanitizedUrl,
      paths: {
        htmlReport: 'report.html',
        jsonReport: 'report.json',
        screenshotsDir: 'screenshots',
        diffsDir: 'diffs'
      },
      metadata: {
        originalUrl: url,
        createdAt: new Date(),
        wasCollisionResolved: finalDirectoryName !== path.join(baseDir, directoryName),
        collisionSuffix: finalDirectoryName !== path.join(baseDir, directoryName)
          ? path.basename(finalDirectoryName).replace(directoryName, '')
          : undefined
      }
    };

    // Create the directory structure
    await this.ensureSubdirectories(reportStructure);

    return reportStructure;
  }

  /**
   * Ensure all subdirectories exist in the report structure
   * @param structure - Report structure to create
   */
  public async ensureSubdirectories(structure: ReportStructure): Promise<void> {
    // Create base directory
    await fs.promises.mkdir(structure.baseDirectory, { recursive: true });

    // Create subdirectories
    const screenshotsPath = path.join(structure.baseDirectory, structure.paths.screenshotsDir);
    const diffsPath = path.join(structure.baseDirectory, structure.paths.diffsDir);

    await Promise.all([
      fs.promises.mkdir(screenshotsPath, { recursive: true }),
      fs.promises.mkdir(diffsPath, { recursive: true })
    ]);
  }

  /**
   * Resolve directory name collisions by appending a suffix
   * @param proposedPath - Proposed directory path
   * @returns Promise<string> - Final directory path with collision resolved
   */
  public async resolveCollisions(proposedPath: string): Promise<string> {
    // Check if directory already exists
    try {
      await fs.promises.access(proposedPath);
      
      // Directory exists, generate a unique suffix
      const suffix = this.generateRandomSuffix();
      return `${proposedPath}-${suffix}`;
    } catch {
      // Directory doesn't exist, use proposed path
      return proposedPath;
    }
  }

  /**
   * Validate that a directory structure is complete and accessible
   * @param structure - Report structure to validate
   * @returns Promise<boolean> - True if valid, false otherwise
   */
  public async validateDirectoryStructure(structure: ReportStructure): Promise<boolean> {
    try {
      // Check base directory exists
      await fs.promises.access(structure.baseDirectory);

      // Check subdirectories exist
      const screenshotsPath = path.join(structure.baseDirectory, structure.paths.screenshotsDir);
      const diffsPath = path.join(structure.baseDirectory, structure.paths.diffsDir);

      await Promise.all([
        fs.promises.access(screenshotsPath),
        fs.promises.access(diffsPath)
      ]);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format directory name according to pattern
   * @param pattern - Directory naming pattern
   * @param timestamp - Timestamp to use
   * @param sanitizedUrl - Sanitized URL to use
   * @returns Formatted directory name
   * @private
   */
  private formatDirectoryName(
    pattern: string,
    timestamp: Date,
    sanitizedUrl: string
  ): string {
    let formatted = pattern;

    // Replace timestamp placeholders
    formatted = formatted
      .replace('YYYY', timestamp.getFullYear().toString())
      .replace('MM', this.padZero(timestamp.getMonth() + 1))
      .replace('DD', this.padZero(timestamp.getDate()))
      .replace('HH', this.padZero(timestamp.getHours()))
      .replace('mm', this.padZero(timestamp.getMinutes()))
      .replace('ss', this.padZero(timestamp.getSeconds()))
      .replace('SSS', this.padZero(timestamp.getMilliseconds(), 3));

    // Replace URL placeholder
    formatted = formatted.replace('{url}', sanitizedUrl);
    formatted = formatted.replace('{timestamp}', timestamp.getTime().toString());

    return formatted;
  }

  /**
   * Pad number with leading zeros
   * @param num - Number to pad
   * @param length - Desired length (default 2)
   * @returns Padded string
   * @private
   */
  private padZero(num: number, length: number = 2): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Generate a random 4-character suffix for collision resolution
   * @returns Random suffix string
   * @private
   */
  private generateRandomSuffix(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return suffix;
  }

  /**
   * Get absolute paths for all artifacts in a report structure
   * @param structure - Report structure
   * @returns Object with absolute paths to all artifacts
   */
  public getAbsolutePaths(structure: ReportStructure): {
    htmlReport: string;
    jsonReport: string;
    screenshotsDir: string;
    diffsDir: string;
  } {
    return {
      htmlReport: path.join(structure.baseDirectory, structure.paths.htmlReport),
      jsonReport: path.join(structure.baseDirectory, structure.paths.jsonReport),
      screenshotsDir: path.join(structure.baseDirectory, structure.paths.screenshotsDir),
      diffsDir: path.join(structure.baseDirectory, structure.paths.diffsDir)
    };
  }

  /**
   * Clean up empty or old test directories
   * @param baseDir - Base directory to clean
   * @param maxAgeMs - Maximum age in milliseconds (default: 30 days)
   * @returns Promise<number> - Number of directories cleaned up
   */
  public async cleanupOldDirectories(
    baseDir: string,
    maxAgeMs: number = 30 * 24 * 60 * 60 * 1000
  ): Promise<number> {
    try {
      const entries = await fs.promises.readdir(baseDir, { withFileTypes: true });
      const now = Date.now();
      let cleanedCount = 0;

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const dirPath = path.join(baseDir, entry.name);
        const stats = await fs.promises.stat(dirPath);

        // Check if directory is older than maxAgeMs
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.rm(dirPath, { recursive: true, force: true });
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up directories:', error);
      return 0;
    }
  }
}
