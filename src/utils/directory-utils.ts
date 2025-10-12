/**
 * Directory management utilities for organized report output
 */

import * as fs from 'fs';
import * as path from 'path';
import { ReportStructure } from '../models/report-structure';
import { sanitizeUrlForFilesystem, generateCollisionSafeName } from './url-sanitization';
import { UrlSanitizationConfig, DEFAULT_URL_SANITIZATION_CONFIG } from '../models/url-sanitization-config';

/**
 * Creates a directory structure for test reports
 */
export async function createReportDirectory(
  baseOutputDir: string,
  originalUrl: string,
  timestamp: Date = new Date(),
  urlConfig: UrlSanitizationConfig = DEFAULT_URL_SANITIZATION_CONFIG
): Promise<ReportStructure> {
  // Sanitize the URL for filesystem use
  const sanitizedUrl = sanitizeUrlForFilesystem(originalUrl, urlConfig);

  // Generate directory pattern
  const directoryPattern = urlConfig.preserveStructure
    ? `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}_${String(timestamp.getMilliseconds()).padStart(3, '0')}_${sanitizedUrl}`
    : `${timestamp.toISOString().replace(/[:.]/g, '-')}_${sanitizedUrl}`;

  const baseDirectory = path.join(baseOutputDir, directoryPattern);

  // Check for collisions and resolve if necessary
  const finalBaseDirectory = await resolveDirectoryCollision(baseDirectory);
  const wasCollisionResolved = finalBaseDirectory !== baseDirectory;
  const collisionSuffix = wasCollisionResolved
    ? path.basename(finalBaseDirectory).split('_').pop()
    : undefined;

  // Create the directory structure
  await fs.promises.mkdir(finalBaseDirectory, { recursive: true });
  await fs.promises.mkdir(path.join(finalBaseDirectory, 'screenshots'), { recursive: true });
  await fs.promises.mkdir(path.join(finalBaseDirectory, 'diffs'), { recursive: true });

  // Create the ReportStructure
  const structure: ReportStructure = {
    baseDirectory: finalBaseDirectory,
    timestamp,
    sanitizedUrl,
    paths: {
      htmlReport: 'report.html',
      jsonReport: 'report.json',
      screenshotsDir: 'screenshots/',
      diffsDir: 'diffs/'
    },
    metadata: {
      originalUrl,
      createdAt: timestamp,
      wasCollisionResolved,
      collisionSuffix
    }
  };

  return structure;
}

/**
 * Resolves directory name collisions by appending suffixes
 */
export async function resolveDirectoryCollision(basePath: string): Promise<string> {
  if (!await directoryExists(basePath)) {
    return basePath;
  }

  const dir = path.dirname(basePath);
  const baseName = path.basename(basePath);
  const existingDirs = await fs.promises.readdir(dir).catch(() => []);

  const collisionSafeName = generateCollisionSafeName(baseName, existingDirs);
  return path.join(dir, collisionSafeName);
}

/**
 * Checks if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Cleans up empty directories
 */
export async function cleanupEmptyDirectories(basePath: string): Promise<void> {
  try {
    const entries = await fs.promises.readdir(basePath);
    if (entries.length === 0) {
      await fs.promises.rmdir(basePath);
      // Recursively clean up parent directories
      const parent = path.dirname(basePath);
      if (parent !== basePath) {
        await cleanupEmptyDirectories(parent);
      }
    }
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Gets directory statistics
 */
export async function getDirectoryStats(dirPath: string): Promise<{
  totalFiles: number;
  totalSize: number;
  subdirectories: number;
}> {
  let totalFiles = 0;
  let totalSize = 0;
  let subdirectories = 0;

  async function scanDirectory(currentPath: string): Promise<void> {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        subdirectories++;
        await scanDirectory(fullPath);
      } else if (entry.isFile()) {
        totalFiles++;
        try {
          const stat = await fs.promises.stat(fullPath);
          totalSize += stat.size;
        } catch {
          // Ignore files that can't be stat'd
        }
      }
    }
  }

  await scanDirectory(dirPath);
  return { totalFiles, totalSize, subdirectories };
}