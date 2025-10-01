import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { BaselineReference } from '../models/BaselineReference';
import { Viewport } from '../models/Config';

export class BaselineService {
  private baselineDir: string;
  private baselines: Map<string, BaselineReference> = new Map();

  constructor(baselineDir: string) {
    this.baselineDir = baselineDir;
  }

  public async initialize(): Promise<void> {
    await fs.promises.mkdir(this.baselineDir, { recursive: true });
    await this.loadBaselines();
  }

  public async createBaseline(
    imagePath: string,
    targetUrl: string,
    viewport: Viewport,
    browserName: string
  ): Promise<BaselineReference> {
    const baseline = new BaselineReference(
      imagePath,
      targetUrl,
      viewport,
      browserName
    );

    // Calculate image hash
    const imageHash = await this.calculateImageHash(imagePath);
    baseline.setImageHash(imageHash);

    // Save baseline metadata
    await this.saveBaselineMetadata(baseline);

    // Store in memory
    const key = this.getBaselineKey(targetUrl, viewport, browserName);
    this.baselines.set(key, baseline);

    return baseline;
  }

  public async updateBaseline(
    baselineId: string,
    newImagePath: string
  ): Promise<BaselineReference | null> {
    const baseline = this.findBaselineById(baselineId);
    if (!baseline) {
      return null;
    }

    // Update image hash
    const imageHash = await this.calculateImageHash(newImagePath);
    baseline.setImageHash(imageHash);
    baseline.update();

    // Update baseline metadata
    await this.saveBaselineMetadata(baseline);

    return baseline;
  }

  public getBaseline(
    targetUrl: string,
    viewport: Viewport,
    browserName: string
  ): BaselineReference | undefined {
    const key = this.getBaselineKey(targetUrl, viewport, browserName);
    return this.baselines.get(key);
  }

  public listBaselines(): BaselineReference[] {
    return Array.from(this.baselines.values());
  }

  public async deleteBaseline(baselineId: string): Promise<boolean> {
    const baseline = this.findBaselineById(baselineId);
    if (!baseline) {
      return false;
    }

    // Delete image file
    try {
      await fs.promises.unlink(baseline.imagePath);
    } catch {
      // Image file might not exist, continue
    }

    // Delete metadata file
    const metadataPath = this.getMetadataPath(baseline.baselineId);
    try {
      await fs.promises.unlink(metadataPath);
    } catch {
      // Metadata file might not exist, continue
    }

    // Remove from memory
    const key = this.getBaselineKey(
      baseline.targetUrl,
      baseline.viewport,
      baseline.browserName
    );
    this.baselines.delete(key);

    return true;
  }

  private async calculateImageHash(imagePath: string): Promise<string> {
    const imageBuffer = await fs.promises.readFile(imagePath);
    return crypto.createHash('sha256').update(imageBuffer).digest('hex');
  }

  private async saveBaselineMetadata(
    baseline: BaselineReference
  ): Promise<void> {
    const metadataPath = this.getMetadataPath(baseline.baselineId);
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(baseline.toJSON(), null, 2)
    );
  }

  private async loadBaselines(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.baselineDir);
      const metadataFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of metadataFiles) {
        const metadataPath = path.join(this.baselineDir, file);
        const content = await fs.promises.readFile(metadataPath, 'utf-8');
        const data = JSON.parse(content);

        const baseline = new BaselineReference(
          data.imagePath,
          data.targetUrl,
          data.viewport,
          data.browserName
        );
        baseline.setImageHash(data.imageHash);

        const key = this.getBaselineKey(
          data.targetUrl,
          data.viewport,
          data.browserName
        );
        this.baselines.set(key, baseline);
      }
    } catch {
      // No baselines directory yet, that's fine
    }
  }

  private getBaselineKey(
    targetUrl: string,
    viewport: Viewport,
    browserName: string
  ): string {
    return `${targetUrl}-${viewport.width}x${viewport.height}-${browserName}`;
  }

  private getMetadataPath(baselineId: string): string {
    return path.join(this.baselineDir, `${baselineId}.json`);
  }

  private findBaselineById(baselineId: string): BaselineReference | undefined {
    return Array.from(this.baselines.values()).find(
      (b) => b.baselineId === baselineId
    );
  }
}
