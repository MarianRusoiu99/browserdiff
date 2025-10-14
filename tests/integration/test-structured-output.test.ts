import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Executor } from '../../src/core/Executor';
import { TestConfig } from '../../src/models/Config';
import * as fs from 'fs';
import * as path from 'path';

describe('Structured Output Integration', () => {
  const testOutputDir = path.join(process.cwd(), 'test-output-structured');

  beforeEach(async () => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  it('should create structured directory when structured output is enabled', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      reporting: {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session).toBeDefined();
    
    // Check that structured directory was created
    const outputContents = fs.readdirSync(testOutputDir);
    expect(outputContents.length).toBeGreaterThan(0);
    
    // Should have a timestamped directory
    const structuredDir = outputContents.find(item => 
      fs.statSync(path.join(testOutputDir, item)).isDirectory()
    );
    expect(structuredDir).toBeDefined();
    expect(structuredDir).toMatch(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/); // Timestamp pattern
  }, 60000);

  it('should sanitize URL in directory name', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      reporting: {
        structured: true,
        directoryPattern: '{url}',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    await executor.execute('https://example.com/test?param=value');

    const outputContents = fs.readdirSync(testOutputDir);
    const structuredDir = outputContents[0];
    
    // Should not contain invalid filesystem characters
    expect(structuredDir).not.toContain('://');
    expect(structuredDir).not.toContain('?');
    expect(structuredDir).not.toContain('<');
    expect(structuredDir).not.toContain('>');
  }, 60000);

  it('should organize files into subdirectories (screenshots, diffs)', async () => {
    const config: TestConfig = {
      browsers: ['chromium', 'firefox'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      reporting: {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss_{url}',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    await executor.execute('https://example.com');

    const outputContents = fs.readdirSync(testOutputDir);
    const structuredDir = path.join(testOutputDir, outputContents[0]);
    
    // Check for subdirectories
    const subdirs = fs.readdirSync(structuredDir);
    expect(subdirs).toContain('screenshots');
    expect(subdirs).toContain('diffs');
    
    // Check for report files in root of structured directory
    expect(subdirs).toContain('report.html');
    expect(subdirs).toContain('report.json');
  }, 60000);

  it('should use legacy flat structure when structured output is disabled', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      reporting: {
        structured: false,
        directoryPattern: '',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {}
        }
      }
    };

    const executor = new Executor(config);
    await executor.execute('https://example.com');

    const outputContents = fs.readdirSync(testOutputDir);
    
    // Should have files directly in output directory (legacy behavior)
    expect(outputContents).toContain('report.html');
    expect(outputContents).toContain('report.json');
  }, 60000);
});

