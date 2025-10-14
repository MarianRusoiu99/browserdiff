import { Command } from 'commander';
import { ConfigService } from '../../services/ConfigService';
import { Executor } from '../../core/Executor';
import { Logger } from '../../utils/Logger';
import { DEFAULT_URL_SANITIZATION_CONFIG } from '../../models/url-sanitization-config';

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
  // NEW: Full Page Screenshot Options
  .option('--full-page', 'Capture full page screenshots (default: false)', false)
  .option('--max-height <pixels>', 'Maximum page height for full page screenshots', '20000')
  .option('--screenshot-timeout <ms>', 'Screenshot capture timeout in milliseconds', '60000')
  .option('--screenshot-quality <quality>', 'PNG compression quality (0-100)', '90')
  // NEW: Structured Output Options
  .option('--structured-output', 'Create organized directory structure (default: false)', false)
  .option('--directory-pattern <pattern>', 'Directory naming pattern', 'YYYY-MM-DD_HH-mm-ss_SSS_{url}')
  .option('--url-max-length <chars>', 'Maximum URL length in folder names', '100')
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

      // NEW: Apply screenshot configuration from CLI options
      if (options.fullPage !== undefined || options.maxHeight || options.screenshotTimeout || options.screenshotQuality) {
        config = {
          ...config,
          screenshot: {
            ...config.screenshot,
            fullPage: options.fullPage,
            maxHeight: options.maxHeight ? parseInt(options.maxHeight, 10) : config.screenshot?.maxHeight || 20000,
            timeout: options.screenshotTimeout ? parseInt(options.screenshotTimeout, 10) : config.screenshot?.timeout || 60000,
            quality: options.screenshotQuality ? parseInt(options.screenshotQuality, 10) : config.screenshot?.quality || 90,
          },
        };
      }

      // NEW: Apply reporting configuration from CLI options
      if (options.structuredOutput !== undefined || options.directoryPattern || options.urlMaxLength) {
        const baseUrlSanitization = config.reporting?.urlSanitization || DEFAULT_URL_SANITIZATION_CONFIG;
        config = {
          ...config,
          reporting: {
            ...config.reporting,
            structured: options.structuredOutput,
            directoryPattern: options.directoryPattern || config.reporting?.directoryPattern || 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',
            urlSanitization: {
              ...baseUrlSanitization,
              maxLength: options.urlMaxLength ? parseInt(options.urlMaxLength, 10) : baseUrlSanitization.maxLength,
            },
          },
        };
      }

      // Initialize Executor with logger for verbose output
      const logger = new Logger(options.verbose);
      const executor = new Executor(config, logger);

      // Execute the test
      const result = await executor.execute(url, options.baseline);

      if (options.verbose) {
        // eslint-disable-next-line no-console
        console.log(`\n✓ Report generated: ${result.reportPath}`);
      }

      // Open report if requested
      if (options.open) {
        await executor.openReport(result.reportPath);
      }

      // Exit with appropriate code
      if (result.report.hasDifferences()) {
        if (result.report.overallStatus === 'different') {
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
  // NEW: Screenshot options
  fullPage: boolean;
  maxHeight: string;
  screenshotTimeout: string;
  screenshotQuality: string;
  // NEW: Structured output options
  structuredOutput: boolean;
  directoryPattern: string;
  urlMaxLength: string;
}

