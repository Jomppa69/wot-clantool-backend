import { Injectable } from '@nestjs/common';
import { PlayerApiService } from './player.api';
import { PlayerDetails, PlayerDetailsMap, PlayerVehicleDetails } from 'src/types';
import { StorageService } from 'src/common/storage/storage.service';

@Injectable()
export class PlayerService {
    constructor(
        private readonly playerApiService: PlayerApiService,
        private readonly storageService: StorageService,
    ) {}

    // Check for existing player details -> if exists check age
    // If not exist or older than 1 day place id into new array
    // genereate new details for ids that need interface
    // read details of okay members from file
    // combine details and return
    async getPlayerDetails(ids: string[]): Promise<PlayerDetailsMap> {
        const filePath = 'data/players';

        const idsWithDeprecatedData: string[] = [];

        const playerDetailsMap: PlayerDetailsMap = {};
        for (const id of ids) {
            if (
                this.storageService.checkFileOrDirectoryExists(`${filePath}/${id}.json`) &&
                this.storageService.checkFileOrDirectoryAge(`${filePath}/${id}.json`) < 86400000
            ) {
                const playerDetails: PlayerDetails = JSON.parse(
                    this.storageService.readFile(filePath, `${id}.json`),
                ) as PlayerDetails;
                playerDetailsMap[id] = playerDetails;
            } else {
                idsWithDeprecatedData.push(id);
            }
        }
        let missingPlayerDetails = {};
        if (idsWithDeprecatedData.length > 0) {
            missingPlayerDetails = await this.createPlayerDetails(idsWithDeprecatedData);
        }
        return { ...playerDetailsMap, ...missingPlayerDetails };
    }

    private async createPlayerDetails(ids: string[]) {
        const playerOverviews = await this.playerApiService.getPlayerOverview(ids);
        const playerClanInfo = await this.playerApiService.getPlayerClanDetails(ids);
        const playerVehicleDetails: Record<string, Record<string, PlayerVehicleDetails>> = {};
        for (const id of ids) {
            playerVehicleDetails[id] = await this.getPlayerVehicleStatistics(id);
        }

        // Combine player details into one object containing all players.
        const playerDetailsMap: PlayerDetailsMap = {};

        for (const id of ids) {
            const playerDetails: PlayerDetails = {
                ...playerOverviews[id],
                ...playerClanInfo[id],
                vehicle_stats: playerVehicleDetails[id],
            };
            playerDetailsMap[id] = playerDetails;

            const filePath = `data/players/`;
            const fileName = `${playerDetails.account_id}.json`;

            this.storageService.writeFile(filePath, fileName, playerDetails);
        }

        return playerDetailsMap;
    }

    async getPlayerVehicleStatistics(playerId: string, tankIds?: string[]) {
        if (!tankIds) {
            const playerVehicles = await this.playerApiService.getPlayerVehicles(playerId);
            tankIds = playerVehicles[playerId].map((vehicle) => String(vehicle.tank_id));
        }

        return this.playerApiService.getVehicleStatistics(playerId, tankIds);
    }

    getPlayerVehicles(playerId: string) {
        return this.playerApiService.getPlayerVehicles(playerId);
    }
}
