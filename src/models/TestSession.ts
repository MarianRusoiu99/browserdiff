import { v4 as uuidv4 } from 'uuid';
import { TestConfig, Viewport } from './Config';
import { BrowserResult } from './BrowserResult';

export type SessionStatus = 'running' | 'completed' | 'failed';

export class TestSession {
  public sessionId: string;
  public targetUrl: string;
  public browsers: string[];
  public timestamp: Date;
  public viewport: Viewport;
  public config: TestConfig;
  public status: SessionStatus;
  public results: BrowserResult[];

  constructor(targetUrl: string, config: TestConfig) {
    this.sessionId = uuidv4();
    this.targetUrl = targetUrl;
    this.browsers = config.browsers;
    this.timestamp = new Date();
    this.viewport = config.viewport;
    this.config = config;
    this.status = 'running';
    this.results = [];
  }

  public addResult(result: BrowserResult): void {
    this.results.push(result);
  }

  public complete(): void {
    this.status = 'completed';
  }

  public fail(): void {
    this.status = 'failed';
  }

  public toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      targetUrl: this.targetUrl,
      browsers: this.browsers,
      timestamp: this.timestamp.toISOString(),
      viewport: this.viewport,
      config: this.config,
      status: this.status,
      results: this.results.map((r) => r.toJSON()),
    };
  }

  public static fromJSON(data: Record<string, unknown>): TestSession {
    const session = Object.create(TestSession.prototype);
    Object.assign(session, {
      ...data,
      timestamp: new Date(data.timestamp as string),
    });
    return session;
  }
}
