import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Wn8ApiService } from './wn8.api';
import { Cron } from '@nestjs/schedule';
import { StorageService } from 'src/common/storage/storage.service';
import { ExpectedValuesResponse, PlayerDetails } from 'src/types';

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
    async handleCron() {
        if (!this.storageService.checkFileOrDirectoryExists(`${this.filePath}/${this.fileName}`)) {
            await this.fetchExpectedValues();
        }

        const expectedValues = JSON.parse(
            this.storageService.readFile(this.filePath, this.fileName),
        ) as ExpectedValuesResponse;

        const today = new Date();
        const dateOnFile = new Date(expectedValues.header.version);
        const isOutdated = today.getTime() - dateOnFile.getTime() > 2 * 24 * 60 * 60 * 1000;

        if (isOutdated) {
            this.logger.debug('Expected values are outdated, fetching new ones.');
            await this.fetchExpectedValues();
        }
    }

    async fetchExpectedValues() {
        const expectedValues = await this.wn8ApiService.fetchExpectedValues();
        this.storageService.writeFile(this.filePath, this.fileName, expectedValues);
    }

    calculateWn8(player: PlayerDetails) {}
}
