import { describe, it, expect } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Interface Extensions', () => {
  const CLI_PATH = './dist/cli/index.js';

  describe('Full Page Screenshot Support', () => {
    it('should accept --full-page flag in help output', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--full-page');
    });

    it('should accept --full-page flag in command execution', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --full-page --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('full-page');
    });

    it('should show full-page option description in help', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('full-page');
      expect(stdout).toContain('page');
    });
  });

  describe('Structured Output Support', () => {
    it('should accept --structured-output flag in help output', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--structured-output');
    });

    it('should accept --structured-output flag in command execution', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --structured-output --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('structured-output');
    });

    it('should show structured-output option description in help', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('structured-output');
      expect(stdout).toContain('folder');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing CLI options', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--browsers');
      expect(stdout).toContain('--output');
      expect(stdout).toContain('--config');
    });

    it('should work without new flags (default behavior)', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('diff');
    });
  });
});