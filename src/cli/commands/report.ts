import { Command } from 'commander';
import { ReportService } from '../../services/ReportService';
import { ConfigService } from '../../services/ConfigService';
import * as fs from 'fs';
import * as path from 'path';

export const reportCommand = new Command('report')
  .description('Manage and view reports');

// report view
reportCommand
  .command('view')
  .description('Open a report in the browser')
  .argument('<path>', 'Path to the report file')
  .action(async (reportPath: string) => {
    try {
      // Check if file exists
      const exists = await fs.promises
        .access(reportPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        throw new Error(`Report not found: ${reportPath}`);
      }

      const configService = new ConfigService();
      const config = await configService.load();
      const reportService = new ReportService(config);

      // eslint-disable-next-line no-console
      console.log(`Opening report: ${reportPath}`);
      await reportService.openReport(reportPath);
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// report list
reportCommand
  .command('list')
  .description('List all available reports')
  .option('-o, --output <directory>', 'Output directory', './browserdiff-output')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options: ReportListOptions) => {
    try {
      const configService = new ConfigService(options.config);
      let config = await configService.load();

      // Override output directory if specified
      if (options.output) {
        config = {
          ...config,
          output: {
            ...config.output,
            directory: options.output,
          },
        };
      }

      const reportService = new ReportService(config);
      const reports = await reportService.listReports();

      if (reports.length === 0) {
        // eslint-disable-next-line no-console
        console.log('No reports found');
        process.exit(0);
      }

      // eslint-disable-next-line no-console
      console.log(`Found ${reports.length} report(s):\n`);

      for (const reportPath of reports) {
        const stats = await fs.promises.stat(reportPath);
        const basename = path.basename(reportPath);

        // eslint-disable-next-line no-console
        console.log(`${basename}`);
        // eslint-disable-next-line no-console
        console.log(`  Path: ${reportPath}`);
        // eslint-disable-next-line no-console
        console.log(`  Size: ${formatFileSize(stats.size)}`);
        // eslint-disable-next-line no-console
        console.log(`  Created: ${stats.mtime.toISOString()}`);
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

interface ReportListOptions {
  output: string;
  config?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
