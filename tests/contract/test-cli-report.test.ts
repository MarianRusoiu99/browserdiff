import { describe, it, expect } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = './dist/cli/index.js';

describe('CLI Report Commands', () => {
  describe('browserdiff report', () => {
    it('should show report command in main help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('report');
    });

    it('should have report command available', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} report --help`);
      expect(stdout).toContain('report');
    });

    it('should support view subcommand', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} report --help`);
      expect(stdout).toContain('view');
    });
  });
});
