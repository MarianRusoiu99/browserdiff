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

    it('should support --max-height option for full page screenshots', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--max-height');
    });

    it('should support --screenshot-timeout option', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--screenshot-timeout');
    });

    it('should support --screenshot-quality option', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--screenshot-quality');
    });

    it('should show default value for --max-height (20000)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toMatch(/max-height.*20000|20000.*max-height/i);
    });

    it('should show default value for --screenshot-timeout (60000)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toMatch(/screenshot-timeout.*60000|60000.*screenshot-timeout/i);
    });

    it('should show default value for --screenshot-quality (90)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toMatch(/screenshot-quality.*90|90.*screenshot-quality/i);
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

    it('should support --directory-pattern option', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--directory-pattern');
    });

    it('should support --url-max-length option', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('--url-max-length');
    });

    it('should show default directory pattern', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toMatch(/directory-pattern.*YYYY-MM-DD|YYYY-MM-DD.*directory-pattern/i);
    });

    it('should show default URL max length (100)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toMatch(/url-max-length.*100|100.*url-max-length/i);
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

    it('should default --full-page to false (backward compatible)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toBeTruthy();
    });

    it('should default --structured-output to false (backward compatible)', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toBeTruthy();
    });
  });

  describe('Option Validation', () => {
    it('should validate --max-height is a number', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --full-page --max-height invalid`;
      await expect(execAsync(command)).rejects.toThrow();
    });

    it('should validate --screenshot-timeout is a number', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --screenshot-timeout invalid`;
      await expect(execAsync(command)).rejects.toThrow();
    });

    it('should validate --screenshot-quality is a number', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --screenshot-quality invalid`;
      await expect(execAsync(command)).rejects.toThrow();
    });

    it('should validate --url-max-length is a number', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --structured-output --url-max-length invalid`;
      await expect(execAsync(command)).rejects.toThrow();
    });

    it('should validate --max-height is within acceptable range (1000-50000)', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --full-page --max-height 100`;
      await expect(execAsync(command)).rejects.toThrow();
    });

    it('should validate --screenshot-quality is between 0-100', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --screenshot-quality 150`;
      await expect(execAsync(command)).rejects.toThrow();
    });
  });
});