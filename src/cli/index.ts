#!/usr/bin/env node

import { Command } from 'commander';
import { Executor } from '../core/Executor';
import { Logger, LogLevel } from '../utils/Logger';
import { TestConfig } from '../models/Config';

const program = new Command();

program
  .name('browserdiff')
  .description('Cross-browser visual regression testing - compare how websites render across browsers')
  .version('1.0.0')
  .argument('<url>', 'URL to test and compare')
  .option('-b, --browsers <browsers...>', 'Browsers to test (chromium, firefox, webkit)', ['chromium', 'firefox', 'webkit'])
  .option('-w, --width <width>', 'Viewport width in pixels', '1920')
  .option('-h, --height <height>', 'Viewport height in pixels', '1080')
  .option('-t, --threshold <threshold>', 'Diff threshold (0.0-1.0, lower = stricter)', '0.1')
  .option('-o, --output <directory>', 'Output directory for reports and screenshots', './browserdiff-output')
  .option('--baseline <browser>', 'Baseline browser for comparison', 'chromium')
  .option('--full-page', 'Capture full page screenshots instead of viewport only', true)
  .option('--viewport-only', 'Capture viewport only (overrides --full-page)', false)
  .option('--max-height <pixels>', 'Maximum page height for full page screenshots', '20000')
  .option('--quality <quality>', 'Screenshot quality (0-100)', '90')
  .option('--silent', 'Silent mode - no console output', false)
  .option('--quiet', 'Quiet mode - minimal console output', false)
  .option('--verbose', 'Verbose mode - detailed console output', false)
  .option('--ignore-https-errors', 'Ignore HTTPS certificate errors', false)
  .option('--open', 'Open HTML report in browser after generation', false)
  .action(async (url: string, options: CliOptions) => {
    try {
      // Build configuration from CLI options
      const config: TestConfig = {
        browsers: options.browsers,
        viewport: {
          width: parseInt(options.width, 10),
          height: parseInt(options.height, 10),
        },
        comparison: {
          threshold: parseFloat(options.threshold),
          includeAA: true,
        },
        output: {
          directory: options.output,
          format: 'html',
          embedAssets: true,
        },
        timeout: {
          pageLoad: 30000,
          screenshot: 60000,
        },
        retry: {
          attempts: 3,
          delay: 1000,
        },
        screenshot: {
          fullPage: options.viewportOnly ? false : options.fullPage,
          maxHeight: parseInt(options.maxHeight, 10),
          timeout: 60000,
          quality: parseInt(options.quality, 10),
        },
        reporting: {
          structured: true, // Enable structured output by default
          directoryPattern: 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',
          urlSanitization: {
            maxLength: 100,
            removeProtocol: true,
            characterMap: {
              '/': '-',
              '\\': '-',
              ':': '-',
              '*': '-',
              '?': '-',
              '"': '-',
              '<': '-',
              '>': '-',
              '|': '-',
            },
            preserveStructure: true,
          },
        },
      };

      // Determine logging level
      let logger: Logger;
      if (options.silent) {
        // Silent mode - suppress all logging
        logger = new Logger(false, LogLevel.ERROR + 1); // Set level above ERROR to suppress all
      } else if (options.verbose) {
        logger = new Logger(true); // Verbose mode
      } else {
        logger = new Logger(false); // Normal mode
      }

      // Initialize Executor
      const executor = new Executor(config, logger);

      // Execute the test
      if (!options.silent && !options.quiet) {
        // eslint-disable-next-line no-console
        console.log(`\n🌐 Testing ${url} across ${options.browsers.join(', ')}...\n`);
      }

      const result = await executor.execute(url, options.baseline);

      if (!options.silent) {
        if (!options.quiet) {
          // eslint-disable-next-line no-console
          console.log(`\n📊 Report: ${result.reportPath}`);
        }

        // Display results
        if (result.report.hasDifferences()) {
          if (result.report.overallStatus === 'different') {
            // eslint-disable-next-line no-console
            console.log('⚠️  Differences detected beyond threshold');
          } else {
            // eslint-disable-next-line no-console
            console.log('✓ Minor differences within threshold');
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('✓ All browsers render identically');
        }
      }

      // Open report if requested
      if (options.open) {
        await executor.openReport(result.reportPath);
      }

      // Exit with appropriate code
      process.exit(result.report.overallStatus === 'different' ? 1 : 0);
    } catch (error) {
      if (!options.silent) {
        // eslint-disable-next-line no-console
        console.error('\n✗ Error:', (error as Error).message);
        if (options.verbose && error instanceof Error && error.stack) {
          // eslint-disable-next-line no-console
          console.error(error.stack);
        }
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

interface CliOptions {
  browsers: string[];
  width: string;
  height: string;
  threshold: string;
  output: string;
  baseline: string;
  fullPage: boolean;
  viewportOnly: boolean;
  maxHeight: string;
  quality: string;
  silent: boolean;
  quiet: boolean;
  verbose: boolean;
  ignoreHttpsErrors: boolean;
  open: boolean;
}
