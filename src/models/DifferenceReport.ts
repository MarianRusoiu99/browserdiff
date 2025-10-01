import { BrowserResult } from './BrowserResult';

export interface DiffMetrics {
  totalPixels: number;
  diffPixels: number;
  diffPercentage: number;
  matchPercentage: number;
}

export type DiffStatus = 'identical' | 'within-threshold' | 'different';

export class DifferenceReport {
  public sessionId: string;
  public baselineBrowser: string;
  public comparisonResults: Map<string, ComparisonResult>;
  public overallStatus: DiffStatus;
  public createdAt: Date;

  constructor(sessionId: string, baselineBrowser: string) {
    this.sessionId = sessionId;
    this.baselineBrowser = baselineBrowser;
    this.comparisonResults = new Map();
    this.overallStatus = 'identical';
    this.createdAt = new Date();
  }

  public addComparison(
    browserName: string,
    baselineResult: BrowserResult,
    currentResult: BrowserResult,
    diffImageBuffer: Buffer,
    metrics: DiffMetrics,
    threshold: number
  ): void {
    const status: DiffStatus =
      metrics.diffPercentage === 0
        ? 'identical'
        : metrics.diffPercentage <= threshold
        ? 'within-threshold'
        : 'different';

    const comparison: ComparisonResult = {
      browserName,
      baselineResult,
      currentResult,
      diffImageBuffer,
      metrics,
      status,
      threshold,
      timestamp: new Date(),
    };

    this.comparisonResults.set(browserName, comparison);

    if (status === 'different' && this.overallStatus !== 'different') {
      this.overallStatus = 'different';
    } else if (
      status === 'within-threshold' &&
      this.overallStatus === 'identical'
    ) {
      this.overallStatus = 'within-threshold';
    }
  }

  public getComparison(browserName: string): ComparisonResult | undefined {
    return this.comparisonResults.get(browserName);
  }

  public getAllComparisons(): ComparisonResult[] {
    return Array.from(this.comparisonResults.values());
  }

  public hasDifferences(): boolean {
    return this.overallStatus !== 'identical';
  }

  public toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      baselineBrowser: this.baselineBrowser,
      comparisons: Array.from(this.comparisonResults.entries()).map(
        ([browser, comp]) => ({
          browserName: browser,
          baselineResult: comp.baselineResult.toJSON(),
          currentResult: comp.currentResult.toJSON(),
          metrics: comp.metrics,
          status: comp.status,
          threshold: comp.threshold,
          timestamp: comp.timestamp.toISOString(),
        })
      ),
      overallStatus: this.overallStatus,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export interface ComparisonResult {
  browserName: string;
  baselineResult: BrowserResult;
  currentResult: BrowserResult;
  diffImageBuffer: Buffer;
  metrics: DiffMetrics;
  status: DiffStatus;
  threshold: number;
  timestamp: Date;
}
