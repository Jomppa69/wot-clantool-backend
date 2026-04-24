import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);

    checkFileOrDirectoryExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    checkFileOrDirectoryAge(filePath: string): number {
        const stats = fs.statSync(filePath);
        const ageMs = Date.now() - stats.mtimeMs;
        return ageMs;
    }

    readFile(filePath: string, fileName: string): string {
        try {
            return fs.readFileSync(`${filePath}/${fileName}`, 'utf-8');
        } catch (error: any) {
            throw new Error(`Error reading file: ${error.message}`);
        }
    }

    writeFile(filePath: string, fileName: string, data: string | object): void {
        if (!this.checkFileOrDirectoryExists(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }

        try {
            if (typeof data === 'string') {
                fs.writeFileSync(`${filePath}/${fileName}`, data, 'utf-8');
            } else {
                const jsonData = JSON.stringify(data, null, 2);
                fs.writeFileSync(`${filePath}/${fileName}`, jsonData);
            }
            this.logger.debug(`File ${filePath}/${fileName} written successfully.`);
        } catch (error: any) {
            throw new Error(`Error writing file: ${error.message}`);
        }
    }

    deleteFile(filePath: string, fileName: string) {
        if (this.checkFileOrDirectoryExists(`${filePath}/${fileName}`)) {
            fs.unlinkSync(`${filePath}/${fileName}`);
            this.logger.debug(`File ${filePath}/${fileName} deleted successfully.`);
        } else {
            this.logger.debug(`File ${filePath}/${fileName} does not exist.`);
        }
    }
}
