import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Wn8ApiService } from './wn8.api';
import { Cron } from '@nestjs/schedule';
import { StorageService } from 'src/common/storage/storage.service';
import { ExpectedValues, ExpectedValuesResponse, PlayerDetails, PlayerOverview, PlayerVehicleDetails } from 'src/types';

@Injectable()
export class Wn8Service implements OnApplicationBootstrap {
    constructor(
        private readonly wn8ApiService: Wn8ApiService,
        private readonly storageService: StorageService,
    ) {}

    private readonly logger = new Logger(Wn8Service.name);

    private readonly filePath = 'data/wn8';
    private readonly fileName = 'expected-values.json';

    private globalExp = {
        IDNum: 0,
        expWinRate: 0,
        expDamage: 0,
        expFrag: 0,
        expSpot: 0,
        expDef: 0,
    };

    private globalStats = {
        win: 0,
        damage: 0,
        frag: 0,
        spot: 0,
        def: 0,
    };

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

    getPlayerWn8(player: PlayerDetails) {
        const expectedValuesRaw = JSON.parse(
            this.storageService.readFile(this.filePath, this.fileName),
        ) as ExpectedValuesResponse;

        const expectedValues = Object.fromEntries(
            expectedValuesRaw.data.map((value) => [value.IDNum, value]),
        ) as Record<number, ExpectedValues>;

        for (const vehicle of Object.values(player.vehicle_stats)) {
            const expVehicle = expectedValues[vehicle.tank_id];
            if (!expVehicle) {
                this.logger.warn(`Expected values not found for tank ID: ${vehicle.tank_id}`);
                continue;
            }
            const vehicleStats = {
                win: (vehicle.wins / vehicle.battles) * 100,
                damage: vehicle.damage_dealt / vehicle.battles,
                frag: vehicle.frags / vehicle.battles,
                spot: vehicle.spotted / vehicle.battles,
                def: vehicle.dropped_capture_points / vehicle.battles,
            };

            const wn8 = this.calculateWn8(vehicleStats, expVehicle);
            player.vehicle_stats[vehicle.tank_id].wn8 = wn8;

            this.globalStats.win += vehicle.wins;
            this.globalStats.damage += vehicle.damage_dealt;
            this.globalStats.frag += vehicle.frags;
            this.globalStats.spot += vehicle.spotted;
            this.globalStats.def += vehicle.dropped_capture_points;

            this.globalExp.expWinRate += 0.01 * vehicle.battles * expVehicle.expWinRate;
            this.globalExp.expDamage += vehicle.battles * expVehicle.expDamage;
            this.globalExp.expFrag += vehicle.battles * expVehicle.expFrag;
            this.globalExp.expSpot += vehicle.battles * expVehicle.expSpot;
            this.globalExp.expDef += vehicle.battles * expVehicle.expDef;
        }
        player.wn8 = this.calculateWn8(this.globalStats, this.globalExp);
        return player;
    }

    calculateWn8(
        vehicle: { win: number; damage: number; frag: number; spot: number; def: number },
        expVehicle: ExpectedValues,
    ) {
        const rWINc = this.getrWINc(vehicle.win, expVehicle.expWinRate);
        const rDMGc = this.getrDMGc(vehicle.damage, expVehicle.expDamage);
        const rFRAGc = this.getrFRAGc(vehicle.frag, expVehicle.expFrag, rDMGc);
        const rSPOTc = this.getrSPOTc(vehicle.spot, expVehicle.expSpot, rDMGc);
        const rDEFc = this.getrDEFc(vehicle.def, expVehicle.expDef, rDMGc);

        const wn8 =
            980 * rDMGc +
            210 * rDMGc * rFRAGc +
            155 * rFRAGc * rSPOTc +
            75 * rDEFc * rFRAGc +
            145 * Math.min(1.8, rWINc);

        return wn8;
    }

    private getrWINc(win: number, expWinRate: number) {
        const rWIN = win / expWinRate;
        const rWINc = Math.max(0, (rWIN - 0.71) / (1 - 0.71));
        return rWINc;
    }

    private getrDMGc(damage: number, expDamage: number) {
        const rDAMAGE = damage / expDamage;
        const rDAMAGEc = Math.max(0, (rDAMAGE - 0.22) / (1 - 0.22));
        return rDAMAGEc;
    }

    private getrFRAGc(frag: number, expFrag: number, rDMGc: number) {
        const rFRAG = frag / expFrag;
        const rFRAGc = Math.max(0, Math.min(rDMGc + 0.2, (rFRAG - 0.12) / (1 - 0.12)));
        return rFRAGc;
    }

    private getrSPOTc(spot: number, expSpot: number, rDMGc: number) {
        const rSPOT = spot / expSpot;
        const rSPOTc = Math.max(0, Math.min(rDMGc + 0.1, (rSPOT - 0.38) / (1 - 0.38)));
        return rSPOTc;
    }

    private getrDEFc(def: number, expDef: number, rDMGc: number) {
        const rDEF = def / expDef;
        const rDEFc = Math.max(0, Math.min(rDMGc + 0.1, (rDEF - 0.1) / (1 - 0.1)));
        return rDEFc;
    }
}
