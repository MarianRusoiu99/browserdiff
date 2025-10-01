import * as fs from 'fs';
import * as path from 'path';
import {
  TestConfig,
  DEFAULT_CONFIG,
  validateConfig,
  mergeConfig,
} from '../models/Config';

export class ConfigService {
  private configPath: string;
  private config: TestConfig;

  constructor(configPath?: string) {
    this.configPath = configPath || this.getDefaultConfigPath();
    this.config = DEFAULT_CONFIG;
  }

  public async load(): Promise<TestConfig> {
    try {
      const exists = await this.fileExists(this.configPath);
      if (!exists) {
        this.config = DEFAULT_CONFIG;
        return this.config;
      }

      const content = await fs.promises.readFile(this.configPath, 'utf-8');
      const userConfig = JSON.parse(content) as Partial<TestConfig>;

      this.config = mergeConfig(DEFAULT_CONFIG, userConfig);
      validateConfig(this.config);

      return this.config;
    } catch (error) {
      throw new Error(
        `Failed to load config from ${this.configPath}: ${(error as Error).message}`
      );
    }
  }

  public async save(config?: TestConfig): Promise<void> {
    const configToSave = config || this.config;
    validateConfig(configToSave);

    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    await fs.promises.writeFile(
      this.configPath,
      JSON.stringify(configToSave, null, 2)
    );
  }

  public async init(): Promise<string> {
    const exists = await this.fileExists(this.configPath);
    if (exists) {
      throw new Error(
        `Config file already exists at ${this.configPath}`
      );
    }

    await this.save(DEFAULT_CONFIG);
    return this.configPath;
  }

  public get(): TestConfig {
    return this.config;
  }

  public update(partial: Partial<TestConfig>): TestConfig {
    this.config = mergeConfig(this.config, partial);
    validateConfig(this.config);
    return this.config;
  }

  public async validate(): Promise<boolean> {
    try {
      validateConfig(this.config);
      return true;
    } catch {
      return false;
    }
  }

  public async show(): Promise<string> {
    return JSON.stringify(this.config, null, 2);
  }

  private getDefaultConfigPath(): string {
    return path.join(process.cwd(), '.browserdiff.json');
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
