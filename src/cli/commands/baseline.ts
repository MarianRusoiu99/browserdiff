import { Command } from 'commander';
import { BaselineService } from '../../services/BaselineService';
import { ConfigService } from '../../services/ConfigService';
import { BrowserService } from '../../services/BrowserService';
import { ScreenshotService } from '../../services/ScreenshotService';
import * as path from 'path';

export const baselineCommand = new Command('baseline')
  .description('Manage baseline images');

// baseline create
baselineCommand
  .command('create')
  .description('Create a new baseline for a URL')
  .argument('<url>', 'URL to create baseline for')
  .option('-b, --browser <browser>', 'Browser to use', 'chromium')
  .option('-w, --width <width>', 'Viewport width', '1920')
  .option('-h, --height <height>', 'Viewport height', '1080')
  .option('-c, --config <path>', 'Config file path')
  .option('-d, --dir <directory>', 'Baseline directory', './baselines')
  .option('--verbose', 'Verbose output', false)
  .action(async (url: string, options: BaselineCreateOptions) => {
    try {
      // Load configuration
      const configService = new ConfigService(options.config);
      let config = await configService.load();

      // Override with CLI options
      if (options.browser) {
        config = { ...config, browsers: [options.browser] };
      }
      if (options.width || options.height) {
        config = {
          ...config,
          viewport: {
            ...config.viewport,
            width: parseInt(options.width, 10),
            height: parseInt(options.height, 10),
          },
        };
      }

      // Initialize services
      const baselineService = new BaselineService(options.dir);
      await baselineService.initialize();

      const browserService = new BrowserService(config);
      const screenshotService = new ScreenshotService(config);

      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`Creating baseline for: ${url}`);
        // eslint-disable-next-line no-console
        console.log(`Browser: ${options.browser}`);
      }

      // Capture screenshot
      const page = await browserService.createPage(options.browser);
      await browserService.navigateWithRetry(page, url);

      const screenshotDir = path.join(options.dir, 'screenshots');
      const result = await screenshotService.captureScreenshot(
        page,
        options.browser,
        screenshotDir
      );

      await browserService.closeAllBrowsers();

      if (result.status !== 'success') {
        throw new Error(`Failed to capture screenshot: ${result.errorMessage}`);
      }

      // Create baseline
      const baseline = await baselineService.createBaseline(
        result.screenshotPath,
        url,
        config.viewport,
        options.browser
      );

      // eslint-disable-next-line no-console
      console.log(`✓ Baseline created: ${baseline.baselineId}`);
      // eslint-disable-next-line no-console
      console.log(`  Path: ${baseline.imagePath}`);
      // eslint-disable-next-line no-console
      console.log(`  Hash: ${baseline.imageHash}`);
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// baseline list
baselineCommand
  .command('list')
  .description('List all baselines')
  .option('-d, --dir <directory>', 'Baseline directory', './baselines')
  .action(async (options: { dir: string }) => {
    try {
      const baselineService = new BaselineService(options.dir);
      await baselineService.initialize();

      const baselines = baselineService.listBaselines();

      if (baselines.length === 0) {
        // eslint-disable-next-line no-console
        console.log('No baselines found');
        process.exit(0);
      }

      // eslint-disable-next-line no-console
      console.log(`Found ${baselines.length} baseline(s):\n`);
      for (const baseline of baselines) {
        // eslint-disable-next-line no-console
        console.log(`ID: ${baseline.baselineId}`);
        // eslint-disable-next-line no-console
        console.log(`  URL: ${baseline.targetUrl}`);
        // eslint-disable-next-line no-console
        console.log(`  Browser: ${baseline.browserName}`);
        // eslint-disable-next-line no-console
        console.log(
          `  Viewport: ${baseline.viewport.width}x${baseline.viewport.height}`
        );
        // eslint-disable-next-line no-console
        console.log(`  Version: ${baseline.version}`);
        // eslint-disable-next-line no-console
        console.log(`  Created: ${baseline.createdAt.toISOString()}`);
        // eslint-disable-next-line no-console
        console.log(`  Updated: ${baseline.updatedAt.toISOString()}`);
        // eslint-disable-next-line no-console
        console.log('');
      }
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// baseline update
baselineCommand
  .command('update')
  .description('Update an existing baseline')
  .argument('<id>', 'Baseline ID to update')
  .option('-d, --dir <directory>', 'Baseline directory', './baselines')
  .option('-c, --config <path>', 'Config file path')
  .option('--verbose', 'Verbose output', false)
  .action(async (id: string, options: BaselineUpdateOptions) => {
    try {
      const baselineService = new BaselineService(options.dir);
      await baselineService.initialize();

      // Get existing baseline
      const baselines = baselineService.listBaselines();
      const existing = baselines.find((b) => b.baselineId === id);

      if (!existing) {
        throw new Error(`Baseline not found: ${id}`);
      }

      // Load configuration
      const configService = new ConfigService(options.config);
      let config = await configService.load();

      // Use baseline configuration
      config = {
        ...config,
        browsers: [existing.browserName],
        viewport: existing.viewport,
      };

      // Initialize services
      const browserService = new BrowserService(config);
      const screenshotService = new ScreenshotService(config);

      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`Updating baseline: ${id}`);
        // eslint-disable-next-line no-console
        console.log(`URL: ${existing.targetUrl}`);
      }

      // Capture new screenshot
      const page = await browserService.createPage(existing.browserName);
      await browserService.navigateWithRetry(page, existing.targetUrl);

      const screenshotDir = path.join(options.dir, 'screenshots');
      const result = await screenshotService.captureScreenshot(
        page,
        existing.browserName,
        screenshotDir
      );

      await browserService.closeAllBrowsers();

      if (result.status !== 'success') {
        throw new Error(`Failed to capture screenshot: ${result.errorMessage}`);
      }

      // Update baseline
      const updated = await baselineService.updateBaseline(
        id,
        result.screenshotPath
      );

      if (!updated) {
        throw new Error('Failed to update baseline');
      }

      // eslint-disable-next-line no-console
      console.log(`✓ Baseline updated: ${updated.baselineId}`);
      // eslint-disable-next-line no-console
      console.log(`  New hash: ${updated.imageHash}`);
      // eslint-disable-next-line no-console
      console.log(`  Version: ${updated.version}`);
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

interface BaselineCreateOptions {
  browser: string;
  width: string;
  height: string;
  config?: string;
  dir: string;
  verbose: boolean;
}

interface BaselineUpdateOptions {
  dir: string;
  config?: string;
  verbose: boolean;
}
