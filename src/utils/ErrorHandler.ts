export class BrowserDiffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserDiffError';
  }
}

export class ConfigurationError extends BrowserDiffError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class NavigationError extends BrowserDiffError {
  constructor(message: string, public url: string) {
    super(message);
    this.name = 'NavigationError';
  }
}

export class ScreenshotError extends BrowserDiffError {
  constructor(message: string, public browserName: string) {
    super(message);
    this.name = 'ScreenshotError';
  }
}

export class DiffError extends BrowserDiffError {
  constructor(message: string) {
    super(message);
    this.name = 'DiffError';
  }
}

export class BaselineError extends BrowserDiffError {
  constructor(message: string) {
    super(message);
    this.name = 'BaselineError';
  }
}

export class TimeoutError extends BrowserDiffError {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ErrorHandler {
  public static handle(error: unknown): never {
    if (error instanceof BrowserDiffError) {
      this.handleBrowserDiffError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    } else {
      this.handleUnknownError(error);
    }

    process.exit(1);
  }

  private static handleBrowserDiffError(error: BrowserDiffError): void {
    // eslint-disable-next-line no-console
    console.error(`\n✗ ${error.name}: ${error.message}`);

    if (error instanceof NavigationError) {
      // eslint-disable-next-line no-console
      console.error(`  URL: ${error.url}`);
      // eslint-disable-next-line no-console
      console.error('  Tip: Check if the URL is accessible and valid');
    } else if (error instanceof ScreenshotError) {
      // eslint-disable-next-line no-console
      console.error(`  Browser: ${error.browserName}`);
      // eslint-disable-next-line no-console
      console.error('  Tip: Ensure the browser is properly installed');
    } else if (error instanceof TimeoutError) {
      // eslint-disable-next-line no-console
      console.error(`  Operation: ${error.operation}`);
      // eslint-disable-next-line no-console
      console.error('  Tip: Try increasing timeout values in configuration');
    } else if (error instanceof ConfigurationError) {
      // eslint-disable-next-line no-console
      console.error('  Tip: Check your .browserdiff.json configuration file');
    }
  }

  private static handleGenericError(error: Error): void {
    // eslint-disable-next-line no-console
    console.error(`\n✗ Error: ${error.message}`);
    
    if (error.stack) {
      // eslint-disable-next-line no-console
      console.error('\nStack trace:');
      // eslint-disable-next-line no-console
      console.error(error.stack);
    }
  }

  private static handleUnknownError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('\n✗ An unknown error occurred');
    // eslint-disable-next-line no-console
    console.error(error);
  }

  public static getUserFriendlyMessage(error: unknown): string {
    if (error instanceof NavigationError) {
      return `Failed to navigate to ${error.url}. Please check if the URL is valid and accessible.`;
    }

    if (error instanceof ScreenshotError) {
      return `Failed to capture screenshot for ${error.browserName}. Please ensure the browser is properly installed.`;
    }

    if (error instanceof TimeoutError) {
      return `Operation "${error.operation}" timed out. Consider increasing timeout values in your configuration.`;
    }

    if (error instanceof ConfigurationError) {
      return `Configuration error: ${error.message}. Please check your .browserdiff.json file.`;
    }

    if (error instanceof BaselineError) {
      return `Baseline error: ${error.message}. Try recreating the baseline images.`;
    }

    if (error instanceof DiffError) {
      return `Diff comparison error: ${error.message}. Check if screenshots are valid PNG files.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  }

  public static wrap<T>(fn: () => T, errorType: typeof BrowserDiffError): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof Error) {
        throw new errorType(error.message);
      }
      throw new errorType('Unknown error');
    }
  }

  public static async wrapAsync<T>(
    fn: () => Promise<T>,
    errorType: typeof BrowserDiffError
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        throw new errorType(error.message);
      }
      throw new errorType('Unknown error');
    }
  }
}
