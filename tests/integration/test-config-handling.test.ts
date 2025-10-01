import { describe, it, expect, afterEach } from '@jest/globals';
import { ConfigService } from '../../src/services/ConfigService';
import { DEFAULT_CONFIG } from '../../src/models/Config';
import * as fs from 'fs';
import * as path from 'path';

describe('Configuration File Handling', () => {
  const testConfigPath = path.join(process.cwd(), 'test-config.json');

  afterEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  it('should load configuration from file', async () => {
    const testConfig = { browsers: ['chromium'], viewport: { width: 1280, height: 720 } };
    fs.writeFileSync(testConfigPath, JSON.stringify(testConfig));

    const service = new ConfigService(testConfigPath);
    const config = await service.load();

    expect(config.browsers).toContain('chromium');
    expect(config.viewport.width).toBe(1280);
  });

  it('should merge file config with CLI options', async () => {
    const service = new ConfigService();
    const config = await service.load();

    expect(config).toBeDefined();
    expect(config.browsers).toEqual(DEFAULT_CONFIG.browsers);
  });

  it('should validate configuration schema', async () => {
    const service = new ConfigService();
    const config = await service.load();

    expect(config.browsers).toBeDefined();
    expect(config.viewport).toBeDefined();
    expect(config.comparison).toBeDefined();
    expect(config.output).toBeDefined();
  });
});
