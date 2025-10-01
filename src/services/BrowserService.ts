import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { TestConfig, Viewport } from '../models/Config';

export class BrowserService {
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  public async launchBrowser(browserName: string): Promise<Browser> {
    const existing = this.browsers.get(browserName);
    if (existing) {
      return existing;
    }

    let browser: Browser;

    const launchOptions = {
      headless: true,
      args: [],
    };

    switch (browserName.toLowerCase()) {
      case 'chromium':
        browser = await chromium.launch(launchOptions);
        break;
      case 'firefox':
        browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        browser = await webkit.launch(launchOptions);
        break;
      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }

    this.browsers.set(browserName, browser);
    return browser;
  }

  public async createContext(
    browserName: string,
    viewport: Viewport,
    ignoreHTTPSErrors: boolean = false
  ): Promise<BrowserContext> {
    const browser = await this.launchBrowser(browserName);
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor || 1,
      ignoreHTTPSErrors,
    });

    this.contexts.set(browserName, context);
    return context;
  }

  public async createPage(browserName: string, ignoreHTTPSErrors: boolean = false): Promise<Page> {
    const contextKey = browserName;
    let context = this.contexts.get(contextKey);

    if (!context) {
      context = await this.createContext(browserName, this.config.viewport, ignoreHTTPSErrors);
    }

    return await context.newPage();
  }

  public async navigateWithRetry(
    page: Page,
    url: string,
    retries: number = this.config.retry.attempts
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await page.goto(url, {
          timeout: this.config.timeout.pageLoad,
          waitUntil: 'networkidle',
        });
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await this.delay(this.config.retry.delay);
        }
      }
    }

    throw new Error(
      `Failed to navigate to ${url} after ${retries + 1} attempts: ${lastError?.message}`
    );
  }

  public async closeBrowser(browserName: string): Promise<void> {
    const context = this.contexts.get(browserName);
    if (context) {
      await context.close();
      this.contexts.delete(browserName);
    }

    const browser = this.browsers.get(browserName);
    if (browser) {
      await browser.close();
      this.browsers.delete(browserName);
    }
  }

  public async closeAllBrowsers(): Promise<void> {
    const closeTasks = Array.from(this.browsers.keys()).map((name) =>
      this.closeBrowser(name)
    );
    await Promise.all(closeTasks);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
