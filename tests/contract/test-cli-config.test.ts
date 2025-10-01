import { describe, it, expect } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = './dist/cli/index.js';

describe('CLI Config Commands', () => {
  describe('browserdiff config', () => {
    it('should show config command in main help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('config');
    });

    it('should have config command available', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} config --help`);
      expect(stdout).toContain('config');
    });

    it('should support init subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} config --help`);
      expect(stdout).toContain('init');
    });
  });

  describe('browserdiff config validate', () => {
    it('should support validate subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} config --help`);
      expect(stdout).toContain('validate');
    });

    it('should support show subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} config --help`);
      expect(stdout).toContain('show');
    });
  });
});
