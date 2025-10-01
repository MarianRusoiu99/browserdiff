import * as crypto from 'crypto';
import { Viewport } from './Config';

export class BaselineReference {
  public baselineId: string;
  public imagePath: string;
  public imageHash: string;
  public createdAt: Date;
  public updatedAt: Date;
  public targetUrl: string;
  public viewport: Viewport;
  public browserName: string;
  public version: string;

  constructor(
    imagePath: string,
    targetUrl: string,
    viewport: Viewport,
    browserName: string
  ) {
    this.baselineId = crypto.randomUUID();
    this.imagePath = imagePath;
    this.imageHash = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.targetUrl = targetUrl;
    this.viewport = viewport;
    this.browserName = browserName;
    this.version = '1.0.0';
  }

  public setImageHash(hash: string): void {
    this.imageHash = hash;
  }

  public update(): void {
    this.updatedAt = new Date();
    const [major, minor, patch] = this.version.split('.').map(Number);
    this.version = `${major}.${minor}.${patch + 1}`;
  }

  public toJSON(): Record<string, unknown> {
    return {
      baselineId: this.baselineId,
      imagePath: this.imagePath,
      imageHash: this.imageHash,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      targetUrl: this.targetUrl,
      viewport: this.viewport,
      browserName: this.browserName,
      version: this.version,
    };
  }
}
