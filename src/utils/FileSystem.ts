import * as fs from 'fs';
import * as path from 'path';

export class FileSystem {
  public static async ensureDirectory(dirPath: string): Promise<void> {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  public static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public static async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  public static async readFile(filePath: string): Promise<string> {
    return await fs.promises.readFile(filePath, 'utf-8');
  }

  public static async writeFile(
    filePath: string,
    content: string
  ): Promise<void> {
    const dir = path.dirname(filePath);
    await this.ensureDirectory(dir);
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  public static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // File might not exist
    }
  }

  public static async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
  }

  public static async listFiles(
    dirPath: string,
    extension?: string
  ): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(dirPath);
      if (extension) {
        return files.filter((f) => f.endsWith(extension));
      }
      return files;
    } catch {
      return [];
    }
  }

  public static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.promises.stat(filePath);
    return stats.size;
  }

  public static async copyFile(
    source: string,
    destination: string
  ): Promise<void> {
    const dir = path.dirname(destination);
    await this.ensureDirectory(dir);
    await fs.promises.copyFile(source, destination);
  }

  public static async cleanDirectory(
    dirPath: string,
    maxAgeMs?: number
  ): Promise<number> {
    try {
      const files = await fs.promises.readdir(dirPath);
      let deletedCount = 0;
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.promises.stat(filePath);

        if (maxAgeMs && now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch {
      return 0;
    }
  }

  public static async getTotalSize(dirPath: string): Promise<number> {
    let totalSize = 0;

    const processPath = async (currentPath: string): Promise<void> => {
      const stats = await fs.promises.stat(currentPath);

      if (stats.isDirectory()) {
        const files = await fs.promises.readdir(currentPath);
        for (const file of files) {
          await processPath(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
      }
    };

    try {
      await processPath(dirPath);
    } catch {
      // Directory might not exist
    }

    return totalSize;
  }

  public static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
