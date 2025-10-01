import { describe, it, expect } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = './dist/cli/index.js';

describe('CLI Baseline Commands', () => {
  describe('browserdiff baseline', () => {
    it('should show baseline command in main help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('baseline');
    });

    it('should have baseline command available', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} baseline --help`);
      expect(stdout).toContain('baseline');
    });

    it('should support create subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} baseline --help`);
      expect(stdout).toContain('create');
    });
  });

  describe('browserdiff baseline update', () => {
    it('should support update subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} baseline --help`);
      expect(stdout).toContain('update');
    });

    it('should support list subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} baseline --help`);
      expect(stdout).toContain('list');
    });
  });
});
