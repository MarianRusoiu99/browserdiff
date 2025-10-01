export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
  metadata?: Record<string, unknown>;
}

export class Performance {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private static instance: Performance;

  private constructor() {}

  public static getInstance(): Performance {
    if (!Performance.instance) {
      Performance.instance = new Performance();
    }
    return Performance.instance;
  }

  public start(operation: string, metadata?: Record<string, unknown>): string {
    const id = `${operation}-${Date.now()}-${Math.random()}`;
    this.metrics.set(id, {
      startTime: Date.now(),
      operation,
      metadata,
    });
    return id;
  }

  public end(id: string): PerformanceMetrics | null {
    const metric = this.metrics.get(id);
    if (!metric) {
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    return metric;
  }

  public getMetrics(operation?: string): PerformanceMetrics[] {
    const allMetrics = Array.from(this.metrics.values());
    if (operation) {
      return allMetrics.filter((m) => m.operation === operation);
    }
    return allMetrics;
  }

  public clear(): void {
    this.metrics.clear();
  }

  public async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const id = this.start(operation, metadata);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id);
      throw error;
    }
  }

  public async withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    operation: string
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  public getAverageDuration(operation: string): number {
    const metrics = this.getMetrics(operation).filter((m) => m.duration !== undefined);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  public getTotalDuration(operation: string): number {
    const metrics = this.getMetrics(operation).filter((m) => m.duration !== undefined);
    return metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
  }

  public getReport(): string {
    const operations = new Set(Array.from(this.metrics.values()).map((m) => m.operation));
    const lines: string[] = ['Performance Report:', ''];

    for (const operation of operations) {
      const metrics = this.getMetrics(operation);
      const completed = metrics.filter((m) => m.duration !== undefined);
      const average = this.getAverageDuration(operation);
      const total = this.getTotalDuration(operation);

      lines.push(`${operation}:`);
      lines.push(`  Count: ${completed.length}`);
      lines.push(`  Average: ${average.toFixed(2)}ms`);
      lines.push(`  Total: ${total.toFixed(2)}ms`);
      lines.push('');
    }

    return lines.join('\n');
  }

  public static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}
