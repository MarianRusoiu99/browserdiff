import { TestConfig } from '../models/Config';
import { BrowserResult } from '../models/BrowserResult';
import { BrowserService } from '../services/BrowserService';
import { ScreenshotService } from '../services/ScreenshotService';
import { Logger } from '../utils/Logger';

export interface ParallelExecutionOptions {
  maxParallel?: number;
  timeout?: number;
}

export class ParallelExecutor {
  private config: TestConfig;
  private logger: Logger;
  private browserService: BrowserService;
  private screenshotService: ScreenshotService;

  constructor(config: TestConfig, logger?: Logger) {
    this.config = config;
    this.logger = logger || new Logger(false);
    this.browserService = new BrowserService(config);
    this.screenshotService = new ScreenshotService(config);
  }

  public async captureScreenshotsParallel(
    url: string,
    browsers: string[],
    screenshotDir: string,
    options: ParallelExecutionOptions = {}
  ): Promise<BrowserResult[]> {
    const maxParallel = options.maxParallel || this.config.parallel || 3;
    const timeout = options.timeout || this.config.timeout.pageLoad;

    this.logger.info(
      `Capturing screenshots in parallel (max: ${maxParallel} concurrent)`
    );

    const results: BrowserResult[] = [];
    const queue = [...browsers];
    const active = new Map<string, Promise<BrowserResult>>();

    while (queue.length > 0 || active.size > 0) {
      // Start new tasks while under the limit
      while (queue.length > 0 && active.size < maxParallel) {
        const browserName = queue.shift();
        if (!browserName) break;
        const task = this.captureScreenshot(
          browserName,
          url,
          screenshotDir,
          timeout
        );
        active.set(browserName, task);
      }

      // Wait for at least one task to complete
      if (active.size > 0) {
        const browserName = await Promise.race(
          Array.from(active.keys()).map(async (name) => {
            await active.get(name);
            return name;
          })
        );

        const promise = active.get(browserName);
        if (!promise) continue;
        
        const result = await promise;
        results.push(result);
        active.delete(browserName);

        if (result.status === 'success') {
          this.logger.success(
            `✓ ${browserName}: ${result.pageLoadTime}ms`
          );
        } else {
          this.logger.error(
            `✗ ${browserName}: ${result.errorMessage || result.status}`
          );
        }
      }
    }

    return results;
  }

  private async captureScreenshot(
    browserName: string,
    url: string,
    screenshotDir: string,
    timeout: number
  ): Promise<BrowserResult> {
    this.logger.debug(`Starting ${browserName}...`);

    try {
      const page = await this.browserService.createPage(browserName);

      // Navigate with timeout
      const navigationPromise = this.browserService.navigateWithRetry(
        page,
        url
      );
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Navigation timeout')), timeout)
      );

      await Promise.race([navigationPromise, timeoutPromise]);

      // Capture screenshot
      const result = await this.screenshotService.captureScreenshot(
        page,
        browserName,
        screenshotDir
      );

      return result;
    } catch (error) {
      this.logger.error(`${browserName} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    await this.browserService.closeAllBrowsers();
  }
}
