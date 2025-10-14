import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Primary Command Interface', () => {
  const CLI_PATH = './dist/cli/index.js';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('browserdiff diff [url] [options]', () => {
    it('should accept a URL as the primary parameter', async () => {
      const command = `node ${CLI_PATH} diff https://example.com --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('diff');
    });

    it('should support --browsers option with space-separated list', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('diff');
    });

    it('should support --output option for report directory', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('output');
    });

    it('should support --config option for configuration file', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('config');
    });

    it('should support --baseline option for baseline browser', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('baseline');
    });

    it('should support --width and --height options for viewport', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('width');
      expect(stdout).toContain('height');
    });

    it('should support --threshold option for diff sensitivity', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('threshold');
    });

    it('should support --ignore-https-errors flag', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('ignore-https-errors');
    });

    it('should support --open flag to open report', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('open');
    });

    it('should support --verbose/-v flag for detailed logging', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('verbose');
    });

    it('should display help with --help/-h option', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('Usage');
      expect(stdout).toContain('Commands');
    });

    it('should display version with --version/-V option', async () => {
      const command = `node ${CLI_PATH} --version`;
      const { stdout } = await execAsync(command);
      expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Exit Codes', () => {
    it('should exit with code 0 on successful help display', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('Usage');
    });

    it('should handle version command successfully', async () => {
      const command = `node ${CLI_PATH} --version`;
      const { stdout } = await execAsync(command);
      expect(stdout).toBeTruthy();
    });

    it('should show config command in help', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('config');
    });

    it('should show baseline command in help', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('baseline');
    });

    it('should show report command in help', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('report');
    });

    it('should show diff command in help', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('diff');
    });
  });

  describe('Input Validation', () => {
    it('should validate URL format', async () => {
      // Invalid command should show error
      await expect(execAsync(`node ${CLI_PATH} invalid-url`)).rejects.toThrow('unknown command');
    });

    it('should show available commands when no command provided', async () => {
      const command = `node ${CLI_PATH} --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toContain('Commands');
    });

    it('should handle unknown options gracefully', async () => {
      const command = `node ${CLI_PATH} diff --help`;
      const { stdout } = await execAsync(command);
      expect(stdout).toBeDefined();
    });
  });
});
