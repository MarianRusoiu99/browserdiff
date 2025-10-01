import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import { TestConfig } from '../models/Config';
import {
  DifferenceReport,
  DiffMetrics,
  ComparisonResult,
} from '../models/DifferenceReport';
import { BrowserResult } from '../models/BrowserResult';

export class DiffService {
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  public async compareScreenshots(
    _sessionId: string,
    _baselineBrowser: string,
    baselineResult: BrowserResult,
    currentResult: BrowserResult
  ): Promise<ComparisonResult> {
    // Read baseline and current images
    const baselineImage = await this.readPNG(baselineResult.screenshotPath);
    const currentImage = await this.readPNG(currentResult.screenshotPath);

    // Ensure images have same dimensions
    if (
      baselineImage.width !== currentImage.width ||
      baselineImage.height !== currentImage.height
    ) {
      throw new Error(
        `Image dimensions mismatch: baseline (${baselineImage.width}x${baselineImage.height}) vs current (${currentImage.width}x${currentImage.height})`
      );
    }

    // Create diff image
    const { width, height } = baselineImage;
    const diffImage = new PNG({ width, height });

    // Compare pixels using pixelmatch
    const diffPixels = pixelmatch(
      baselineImage.data,
      currentImage.data,
      diffImage.data,
      width,
      height,
      {
        threshold: this.config.comparison.threshold,
        includeAA: this.config.comparison.includeAA,
      }
    );

    // Calculate metrics
    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;
    const matchPercentage = 100 - diffPercentage;

    const metrics: DiffMetrics = {
      totalPixels,
      diffPixels,
      diffPercentage,
      matchPercentage,
    };

    // Encode diff image to buffer
    const diffImageBuffer = PNG.sync.write(diffImage);

    // Determine status
    const status =
      diffPercentage === 0
        ? 'identical'
        : diffPercentage <= this.config.comparison.threshold * 100
        ? 'within-threshold'
        : 'different';

    return {
      browserName: currentResult.browserName,
      baselineResult,
      currentResult,
      diffImageBuffer,
      metrics,
      status,
      threshold: this.config.comparison.threshold,
      timestamp: new Date(),
    };
  }

  public async generateDifferenceReport(
    sessionId: string,
    baselineBrowser: string,
    baselineResult: BrowserResult,
    results: BrowserResult[],
    outputDir: string
  ): Promise<DifferenceReport> {
    const report = new DifferenceReport(sessionId, baselineBrowser);

    for (const result of results) {
      if (result.browserName === baselineBrowser) {
        continue; // Skip comparing baseline with itself
      }

      // Skip failed browsers
      if (result.status !== 'success') {
        // eslint-disable-next-line no-console
        console.warn(`⚠️  Skipping comparison with ${result.browserName}: ${result.errorMessage || result.status}`);
        continue;
      }

      try {
        const comparison = await this.compareScreenshots(
          sessionId,
          baselineBrowser,
          baselineResult,
          result
        );

        // Save diff image
        const diffPath = `${outputDir}/diff-${baselineBrowser}-vs-${result.browserName}.png`;
        await fs.promises.writeFile(diffPath, comparison.diffImageBuffer);

        report.addComparison(
          result.browserName,
          baselineResult,
          result,
          comparison.diffImageBuffer,
          comparison.metrics,
          this.config.comparison.threshold
        );
      } catch (error) {
        console.error(
          `Error comparing ${baselineBrowser} with ${result.browserName}:`,
          error
        );
      }
    }

    return report;
  }

  private async readPNG(path: string): Promise<PNG> {
    const buffer = await fs.promises.readFile(path);
    return PNG.sync.read(buffer);
  }

  public calculateSimilarity(metrics: DiffMetrics): number {
    return metrics.matchPercentage;
  }

  public isWithinThreshold(metrics: DiffMetrics, threshold: number): boolean {
    return metrics.diffPercentage <= threshold * 100;
  }
}
