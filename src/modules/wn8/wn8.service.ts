import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Wn8ApiService } from './wn8.api';
import { Cron } from '@nestjs/schedule';
import { StorageService } from 'src/common/storage/storage.service';
import { ExpectedValues, ExpectedValuesResponse } from 'src/types';

@Injectable()
export class Wn8Service implements OnApplicationBootstrap {
    constructor(
        private readonly wn8ApiService: Wn8ApiService,
        private readonly storageService: StorageService,
    ) {}

    private readonly logger = new Logger(Wn8Service.name);

    private readonly filePath = 'data/wn8';
    private readonly fileName = 'expected-values.json';

    onApplicationBootstrap() {
        void this.handleCron();
    }

    @Cron('0 1 * * *', {
        name: 'ExpectedWn8Values',
    })
    private async handleCron() {
        if (!this.storageService.checkFileOrDirectoryExists(`${this.filePath}/${this.fileName}`)) {
            await this.fetchExpectedValues();
        }

        const isOutdated = this.storageService.checkFileOrDirectoryAge(`${this.filePath}/${this.fileName}`) > 172800000;

        if (isOutdated) {
            this.logger.debug('Expected values are outdated, fetching new ones.');
            await this.fetchExpectedValues();
        }
    }

    private async fetchExpectedValues() {
        const expectedValues = await this.wn8ApiService.fetchExpectedValues();
        this.storageService.writeFile(this.filePath, this.fileName, expectedValues);
    }

    getExpectedValues(): Record<string, ExpectedValues> {
        const expectedValuesRaw = JSON.parse(
            this.storageService.readFile(this.filePath, this.fileName),
        ) as ExpectedValuesResponse;

        const expectedValues = Object.fromEntries(
            expectedValuesRaw.data.map((value) => [value.IDNum.toString(), value]),
        ) as Record<string, ExpectedValues>;

        return expectedValues;
    }
}
