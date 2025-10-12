import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  createReportDirectory,
  resolveDirectoryCollision,
  directoryExists,
  ensureDirectoryExists,
  cleanupEmptyDirectories,
  getDirectoryStats
} from '../../src/utils/directory-utils';

describe('Directory Utils', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'browserdiff-test-'));
  });

  afterEach(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  describe('createReportDirectory', () => {
    it('should export createReportDirectory function', () => {
      expect(() => {
        require('../../src/utils/directory-utils');
      }).not.toThrow();
    });

    it('should create report directory structure', async () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');
      const structure = await createReportDirectory(
        tempDir,
        'https://example.com/test',
        timestamp
      );

      expect(structure.baseDirectory).toContain('2024-01-01');
      expect(structure.baseDirectory).toContain('example.com');
      expect(structure.sanitizedUrl).toBe('example.com/test');
      expect(structure.paths.htmlReport).toBe('report.html');
      expect(structure.paths.jsonReport).toBe('report.json');
      expect(structure.paths.screenshotsDir).toBe('screenshots/');
      expect(structure.paths.diffsDir).toBe('diffs/');
      expect(structure.metadata.originalUrl).toBe('https://example.com/test');
      expect(structure.metadata.wasCollisionResolved).toBe(false);

      // Check directories were created
      expect(await directoryExists(structure.baseDirectory)).toBe(true);
      expect(await directoryExists(path.join(structure.baseDirectory, 'screenshots'))).toBe(true);
      expect(await directoryExists(path.join(structure.baseDirectory, 'diffs'))).toBe(true);
    });

    it('should resolve directory collisions', async () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');

      // Create first directory
      const structure1 = await createReportDirectory(
        tempDir,
        'https://example.com/test',
        timestamp
      );

      // Create second directory with same parameters (should get suffix)
      const structure2 = await createReportDirectory(
        tempDir,
        'https://example.com/test',
        timestamp
      );

      expect(structure1.metadata.wasCollisionResolved).toBe(false);
      expect(structure2.metadata.wasCollisionResolved).toBe(true);
      expect(structure2.metadata.collisionSuffix).toBeDefined();
      expect(structure1.baseDirectory).not.toBe(structure2.baseDirectory);
    });
  });

  describe('resolveDirectoryCollision', () => {
    it('should return original path when no collision', async () => {
      const testPath = path.join(tempDir, 'unique-dir');
      const result = await resolveDirectoryCollision(testPath);
      expect(result).toBe(testPath);
    });

    it('should resolve collision with suffix', async () => {
      const basePath = path.join(tempDir, 'test-dir');
      await fs.promises.mkdir(basePath);

      const result = await resolveDirectoryCollision(basePath);
      expect(result).toBe(path.join(tempDir, 'test-dir_1'));
    });

    it('should increment suffix until unique', async () => {
      const basePath = path.join(tempDir, 'test-dir');
      await fs.promises.mkdir(basePath);
      await fs.promises.mkdir(path.join(tempDir, 'test-dir_1'));
      await fs.promises.mkdir(path.join(tempDir, 'test-dir_2'));

      const result = await resolveDirectoryCollision(basePath);
      expect(result).toBe(path.join(tempDir, 'test-dir_3'));
    });
  });

  describe('directoryExists', () => {
    it('should return true for existing directories', async () => {
      const testDir = path.join(tempDir, 'existing');
      await fs.promises.mkdir(testDir);
      expect(await directoryExists(testDir)).toBe(true);
    });

    it('should return false for non-existing directories', async () => {
      const testDir = path.join(tempDir, 'non-existing');
      expect(await directoryExists(testDir)).toBe(false);
    });

    it('should return false for files', async () => {
      const testFile = path.join(tempDir, 'file.txt');
      await fs.promises.writeFile(testFile, 'test');
      expect(await directoryExists(testFile)).toBe(false);
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', async () => {
      const testDir = path.join(tempDir, 'new-dir');
      expect(await directoryExists(testDir)).toBe(false);

      await ensureDirectoryExists(testDir);
      expect(await directoryExists(testDir)).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      const testDir = path.join(tempDir, 'existing-dir');
      await fs.promises.mkdir(testDir);
      expect(await directoryExists(testDir)).toBe(true);

      await ensureDirectoryExists(testDir);
      expect(await directoryExists(testDir)).toBe(true);
    });

    it('should create nested directories', async () => {
      const nestedDir = path.join(tempDir, 'parent', 'child', 'grandchild');
      expect(await directoryExists(nestedDir)).toBe(false);

      await ensureDirectoryExists(nestedDir);
      expect(await directoryExists(nestedDir)).toBe(true);
    });
  });

  describe('cleanupEmptyDirectories', () => {
    it('should remove empty directories', async () => {
      const emptyDir = path.join(tempDir, 'empty');
      await fs.promises.mkdir(emptyDir);
      expect(await directoryExists(emptyDir)).toBe(true);

      await cleanupEmptyDirectories(emptyDir);
      expect(await directoryExists(emptyDir)).toBe(false);
    });

    it('should not remove directories with content', async () => {
      const dirWithContent = path.join(tempDir, 'with-content');
      await fs.promises.mkdir(dirWithContent);
      await fs.promises.writeFile(path.join(dirWithContent, 'file.txt'), 'test');

      await cleanupEmptyDirectories(dirWithContent);
      expect(await directoryExists(dirWithContent)).toBe(true);
    });

    it('should recursively clean up empty parent directories', async () => {
      const parentDir = path.join(tempDir, 'parent');
      const childDir = path.join(parentDir, 'child');
      await fs.promises.mkdir(childDir, { recursive: true });

      await cleanupEmptyDirectories(childDir);
      expect(await directoryExists(childDir)).toBe(false);
      expect(await directoryExists(parentDir)).toBe(false);
    });
  });

  describe('getDirectoryStats', () => {
    it('should return stats for empty directory', async () => {
      const emptyDir = path.join(tempDir, 'empty-stats');
      await fs.promises.mkdir(emptyDir);

      const stats = await getDirectoryStats(emptyDir);
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.subdirectories).toBe(0);
    });

    it('should return stats for directory with files', async () => {
      const testDir = path.join(tempDir, 'stats-dir');
      await fs.promises.mkdir(testDir);
      await fs.promises.writeFile(path.join(testDir, 'file1.txt'), 'hello');
      await fs.promises.writeFile(path.join(testDir, 'file2.txt'), 'world');

      const stats = await getDirectoryStats(testDir);
      expect(stats.totalFiles).toBe(2);
      expect(stats.totalSize).toBe(10); // 'hello' (5) + 'world' (5)
      expect(stats.subdirectories).toBe(0);
    });

    it('should return stats for directory with subdirectories', async () => {
      const testDir = path.join(tempDir, 'stats-nested');
      const subDir = path.join(testDir, 'subdir');
      await fs.promises.mkdir(subDir, { recursive: true });
      await fs.promises.writeFile(path.join(subDir, 'file.txt'), 'test');

      const stats = await getDirectoryStats(testDir);
      expect(stats.totalFiles).toBe(1);
      expect(stats.totalSize).toBe(4); // 'test' length
      expect(stats.subdirectories).toBe(1);
    });
  });
});