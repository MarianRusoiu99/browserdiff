import { Command } from 'commander';
import { ConfigService } from '../../services/ConfigService';
import { BrowserService } from '../../services/BrowserService';
import { ScreenshotService } from '../../services/ScreenshotService';
import { DiffService } from '../../services/DiffService';
import { ReportService } from '../../services/ReportService';
import { TestSession } from '../../models/TestSession';
import { BrowserResult } from '../../models/BrowserResult';
import * as path from 'path';

export const diffCommand = new Command('diff')
  .description('Compare a URL across multiple browsers')
  .argument('<url>', 'URL to test')
  .option('-b, --browsers <browsers...>', 'Browsers to test (chromium, firefox, webkit)')
  .option('-w, --width <width>', 'Viewport width', '1920')
  .option('-h, --height <height>', 'Viewport height', '1080')
  .option('-t, --threshold <threshold>', 'Diff threshold (0.0-1.0)', '0.1')
  .option('-o, --output <directory>', 'Output directory', './browserdiff-output')
  .option('-c, --config <path>', 'Config file path')
  .option('--baseline <browser>', 'Baseline browser for comparison', 'chromium')
  .option('--ignore-https-errors', 'Ignore HTTPS certificate errors', false)
  .option('--open', 'Open report after generation', false)
  .option('--verbose', 'Verbose output', false)
  .action(async (url: string, options: DiffCommandOptions) => {
    try {
      // Load configuration
      const configService = new ConfigService(options.config);
      let config = await configService.load();

      // Override with CLI options
      if (options.browsers) {
        config = { ...config, browsers: options.browsers };
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
      if (options.threshold) {
        config = {
          ...config,
          comparison: {
            ...config.comparison,
            threshold: parseFloat(options.threshold),
          },
        };
      }
      if (options.output) {
        config = {
          ...config,
          output: {
            ...config.output,
            directory: options.output,
          },
        };
      }

      // Initialize services
      const browserService = new BrowserService(config);
      const screenshotService = new ScreenshotService(config);
      const diffService = new DiffService(config);
      const reportService = new ReportService(config);

      // Create test session
      const session = new TestSession(url, config);

      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`Starting cross-browser test for: ${url}`);
        // eslint-disable-next-line no-console
        console.log(`Browsers: ${config.browsers.join(', ')}`);
        // eslint-disable-next-line no-console
        console.log(`Viewport: ${config.viewport.width}x${config.viewport.height}`);
      }

      // Capture screenshots for all browsers
      const screenshotDir = path.join(config.output.directory, 'screenshots');
      const results = [];

      for (const browserName of config.browsers) {
        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`\nLaunching ${browserName}...`);
        }

        try {
          const page = await browserService.createPage(browserName, options.ignoreHttpsErrors);
          await browserService.navigateWithRetry(page, url);

          if (options.verbose) {
            // eslint-disable-next-line no-console
            console.log(`Capturing screenshot for ${browserName}...`);
          }

          const result = await screenshotService.captureScreenshot(
            page,
            browserName,
            screenshotDir
          );

          session.addResult(result);
          results.push(result);

          if (options.verbose) {
            // eslint-disable-next-line no-console
            console.log(
              `✓ ${browserName}: ${result.status} (${result.pageLoadTime}ms)`
            );
          }
        } catch (error) {
          // Create a failed result for the browser
          const failedResult = new BrowserResult(browserName, 'unknown', {
            userAgent: 'unknown',
            platform: 'unknown',
            architecture: 'unknown',
            headless: true,
            viewport: config.viewport,
            additionalFlags: [],
          });
          failedResult.setError((error as Error).message);
          
          session.addResult(failedResult);
          results.push(failedResult);

          if (options.verbose) {
            // eslint-disable-next-line no-console
            console.error(`✗ ${browserName}: ${(error as Error).message}`);
          }
        }
      }

      // Close all browsers
      await browserService.closeAllBrowsers();

      // Find baseline result
      const baselineResult = results.find(
        (r) => r.browserName === options.baseline
      );
      if (!baselineResult) {
        throw new Error(`Baseline browser ${options.baseline} not found`);
      }
      
      if (baselineResult.status !== 'success') {
        throw new Error(
          `Baseline browser ${options.baseline} failed: ${baselineResult.errorMessage || 'Unknown error'}`
        );
      }

      // Generate difference report
      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log('\nGenerating difference report...');
      }

      const diffReport = await diffService.generateDifferenceReport(
        session.sessionId,
        options.baseline,
        baselineResult,
        results,
        config.output.directory
      );

      session.complete();

      // Generate HTML report
      const reportPath = await reportService.generateHTMLReport(
        session,
        diffReport
      );

      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`\n✓ Report generated: ${reportPath}`);
      }

      // Save JSON data
      await reportService.saveReportData(session, diffReport);

      // Open report if requested
      if (options.open) {
        await reportService.openReport(reportPath);
      }

      // Exit with appropriate code
      if (diffReport.hasDifferences()) {
        if (diffReport.overallStatus === 'different') {
          // eslint-disable-next-line no-console
          console.log(
            '\n⚠️  Differences detected beyond threshold'
          );
          process.exit(1);
        } else {
          // eslint-disable-next-line no-console
          console.log(
            '\n✓ Minor differences within threshold'
          );
          process.exit(0);
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('\n✓ All browsers render identically');
        process.exit(0);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('\n✗ Error:', (error as Error).message);
      if (options.verbose && error instanceof Error && error.stack) {
        // eslint-disable-next-line no-console
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

interface DiffCommandOptions {
  browsers?: string[];
  width: string;
  height: string;
  threshold: string;
  output: string;
  config?: string;
  baseline: string;
  ignoreHttpsErrors: boolean;
  open: boolean;
  verbose: boolean;
}
