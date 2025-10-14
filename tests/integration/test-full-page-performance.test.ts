import { describe, it, expect } from '@jest/globals';
import { chromium, Browser, BrowserContext } from 'playwright';

/**
 * Performance tests for full page screenshot capture
 * Requirement: Full page screenshot should take <2x viewport screenshot time
 */
describe('Full Page Screenshot Performance', () => {
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
  });

  afterEach(async () => {
    await context?.close();
  });

  it('should capture viewport screenshot in reasonable time', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    const startTime = Date.now();
    await page.screenshot({ 
      fullPage: false,
      type: 'png'
    });
    const viewportTime = Date.now() - startTime;

    expect(viewportTime).toBeLessThan(5000); // Viewport should be fast (<5s)
  });

  it('should capture full page screenshot in <2x viewport time', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Measure viewport screenshot time
    const viewportStartTime = Date.now();
    await page.screenshot({ 
      fullPage: false,
      type: 'png'
    });
    const viewportTime = Date.now() - viewportStartTime;

    // Measure full page screenshot time
    const fullPageStartTime = Date.now();
    await page.screenshot({ 
      fullPage: true,
      type: 'png'
    });
    const fullPageTime = Date.now() - fullPageStartTime;

    // Full page should be less than 2x viewport time
    expect(fullPageTime).toBeLessThan(viewportTime * 2);
    
    // Also ensure absolute performance is reasonable
    expect(fullPageTime).toBeLessThan(10000); // <10s for full page
  });

  it('should capture full page with maxHeight limit efficiently', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Inject long content to test maxHeight (runs in browser context)
    await page.evaluate(`
      document.body.style.height = '50000px';
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.textContent = 'Content block ' + i;
        div.style.height = '500px';
        document.body.appendChild(div);
      }
    `);

    const startTime = Date.now();
    
    // Capture with height limit - should be faster than unlimited
    await page.screenshot({ 
      fullPage: true,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1920,
        height: 15000 // maxHeight limit
      }
    });
    
    const limitedTime = Date.now() - startTime;

    // Should complete in reasonable time even with limit
    expect(limitedTime).toBeLessThan(15000); // <15s with height limit
  });

  it('should maintain performance with quality optimization', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Test different quality settings
    const startTime90 = Date.now();
    await page.screenshot({ 
      fullPage: true,
      type: 'png',
      quality: 90
    });
    const time90 = Date.now() - startTime90;

    const startTime50 = Date.now();
    await page.screenshot({ 
      fullPage: true,
      type: 'png',
      quality: 50
    });
    const time50 = Date.now() - startTime50;

    // Both quality levels should complete in reasonable time
    expect(time90).toBeLessThan(10000);
    expect(time50).toBeLessThan(10000);
    
    // Lower quality might be slightly faster but not guaranteed
    // Just ensure both are within acceptable range
  });

  it('should handle long pages within timeout limits', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Create very long page (runs in browser context)
    await page.evaluate(`
      document.body.style.height = '20000px';
      const container = document.createElement('div');
      for (let i = 0; i < 200; i++) {
        const div = document.createElement('div');
        div.textContent = 'Section ' + i;
        div.style.height = '100px';
        div.style.marginBottom = '10px';
        container.appendChild(div);
      }
      document.body.appendChild(container);
    `);

    const startTime = Date.now();
    
    await page.screenshot({ 
      fullPage: true,
      type: 'png',
      timeout: 60000 // Default timeout from config
    });
    
    const captureTime = Date.now() - startTime;

    // Should complete well within timeout
    expect(captureTime).toBeLessThan(60000);
    expect(captureTime).toBeLessThan(30000); // Actually should be much faster
  });

  it('should handle parallel full page captures efficiently', async () => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    const page3 = await context.newPage();

    await Promise.all([
      page1.goto('https://example.com'),
      page2.goto('https://example.com'),
      page3.goto('https://example.com')
    ]);

    const startTime = Date.now();
    
    await Promise.all([
      page1.screenshot({ fullPage: true, type: 'png' }),
      page2.screenshot({ fullPage: true, type: 'png' }),
      page3.screenshot({ fullPage: true, type: 'png' })
    ]);
    
    const parallelTime = Date.now() - startTime;

    // Parallel should not take 3x single screenshot time
    // Should be closer to 1.5x due to parallel execution
    expect(parallelTime).toBeLessThan(20000); // <20s for 3 parallel
  });

  it('should track and report performance metrics', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    const metrics = {
      viewportTime: 0,
      fullPageTime: 0,
      ratio: 0
    };

    // Viewport benchmark
    const viewportStart = Date.now();
    await page.screenshot({ fullPage: false, type: 'png' });
    metrics.viewportTime = Date.now() - viewportStart;

    // Full page benchmark
    const fullPageStart = Date.now();
    await page.screenshot({ fullPage: true, type: 'png' });
    metrics.fullPageTime = Date.now() - fullPageStart;

    metrics.ratio = metrics.fullPageTime / metrics.viewportTime;

    // Validate metrics are within acceptable ranges
    expect(metrics.viewportTime).toBeGreaterThan(0);
    expect(metrics.fullPageTime).toBeGreaterThan(0);
    expect(metrics.ratio).toBeLessThan(2.0); // <2x ratio
    expect(metrics.ratio).toBeGreaterThan(0.5); // Should be somewhat longer

    // Metrics tracked for manual review in CI/CD if needed
    if (process.env.VERBOSE_TESTS) {
      // eslint-disable-next-line no-console
      console.log('Performance metrics:', metrics);
    }
  });
});
