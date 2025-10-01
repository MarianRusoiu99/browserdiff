export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor?: number;
}

export interface ComparisonConfig {
  threshold: number;
  includeAA: boolean;
  ignoreColors?: string[];
}

export interface OutputConfig {
  directory: string;
  format: 'html';
  embedAssets: boolean;
}

export interface TimeoutConfig {
  pageLoad: number;
  screenshot: number;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
}

export interface TestConfig {
  browsers: string[];
  viewport: Viewport;
  comparison: ComparisonConfig;
  output: OutputConfig;
  timeout: TimeoutConfig;
  retry: RetryConfig;
  parallel?: number;
}

export const DEFAULT_CONFIG: TestConfig = {
  browsers: ['chromium', 'firefox', 'webkit'],
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  },
  comparison: {
    threshold: 0.1,
    includeAA: true,
  },
  output: {
    directory: './reports',
    format: 'html',
    embedAssets: true,
  },
  timeout: {
    pageLoad: 30000,
    screenshot: 5000,
  },
  retry: {
    attempts: 3,
    delay: 1000,
  },
  parallel: 3,
};

export function validateConfig(config: Partial<TestConfig>): string[] {
  const errors: string[] = [];

  if (config.browsers && config.browsers.length === 0) {
    errors.push('At least one browser must be specified');
  }

  if (config.browsers) {
    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    const invalidBrowsers = config.browsers.filter((b) => !validBrowsers.includes(b));
    if (invalidBrowsers.length > 0) {
      errors.push(`Invalid browsers: ${invalidBrowsers.join(', ')}`);
    }
  }

  if (config.viewport) {
    if (config.viewport.width < 320 || config.viewport.width > 7680) {
      errors.push('Viewport width must be between 320 and 7680');
    }
    if (config.viewport.height < 240 || config.viewport.height > 4320) {
      errors.push('Viewport height must be between 240 and 4320');
    }
  }

  if (config.comparison?.threshold !== undefined) {
    if (config.comparison.threshold < 0 || config.comparison.threshold > 1) {
      errors.push('Comparison threshold must be between 0.0 and 1.0');
    }
  }

  return errors;
}

export function mergeConfig(base: TestConfig, override: Partial<TestConfig>): TestConfig {
  return {
    ...base,
    ...override,
    viewport: { ...base.viewport, ...override.viewport },
    comparison: { ...base.comparison, ...override.comparison },
    output: { ...base.output, ...override.output },
    timeout: { ...base.timeout, ...override.timeout },
    retry: { ...base.retry, ...override.retry },
  };
}
