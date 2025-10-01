export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

export class Logger {
  private verbose: boolean;
  private minLevel: LogLevel;

  constructor(verbose: boolean = false, minLevel: LogLevel = LogLevel.INFO) {
    this.verbose = verbose;
    this.minLevel = verbose ? LogLevel.DEBUG : minLevel;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  public success(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.SUCCESS)) {
      // eslint-disable-next-line no-console
      console.log(`[SUCCESS] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  public setVerbose(verbose: boolean): void {
    this.verbose = verbose;
    this.minLevel = verbose ? LogLevel.DEBUG : LogLevel.INFO;
  }

  public isVerbose(): boolean {
    return this.verbose;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  public static create(verbose: boolean = false): Logger {
    return new Logger(verbose);
  }
}
