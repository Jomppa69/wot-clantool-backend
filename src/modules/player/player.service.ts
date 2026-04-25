import { Injectable } from '@nestjs/common';
import { PlayerApiService } from './player.api';
import { PlayerDetails, PlayerDetailsMap, PlayerVehicleDetails } from 'src/types';
import { StorageService } from 'src/common/storage/storage.service';
import { Wn8Service } from '../wn8/wn8.service';

@Injectable()
export class PlayerService {
    constructor(
        private readonly playerApiService: PlayerApiService,
        private readonly storageService: StorageService,
        private readonly wn8Service: Wn8Service,
    ) {}

    // Check for existing player details -> if exists check age
    // If not exist or older than 1 day place id into new array
    // genereate new details for ids that need interface
    // read details of okay members from file
    // combine details and return
    async getPlayerDetails(ids: number[]): Promise<PlayerDetailsMap> {
        const filePath = 'data/players';

        const idsWithDeprecatedData: number[] = [];

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

    private async createPlayerDetails(ids: number[]) {
        const playerOverviews = await this.playerApiService.getPlayerOverview(ids);
        const playerClanInfo = await this.playerApiService.getPlayerClanDetails(ids);
        const playerVehicleDetails: Record<string, Record<number, PlayerVehicleDetails>> = {};
        for (const id of ids) {
            playerVehicleDetails[id] = await this.getPlayerVehicleStatistics(id);
        }

        // Combine player details into one object containing all players.
        const playerDetailsMap: PlayerDetailsMap = {};

        for (const id of ids) {
            const totalBattles = Object.values(playerVehicleDetails[id]).reduce((total, vehicle) => {
                return total + vehicle.battles;
            }, 0);
            const { clan, ...playerClanData } = playerClanInfo[id];

            const playerDetails: PlayerDetails = {
                ...playerOverviews[id],
                ...playerClanData,
                clan_id: clan.clan_id,
                battles: totalBattles,
                vehicle_stats: playerVehicleDetails[id],
                wn8: 0,
            };

            const finalPlayerDetails = this.wn8Service.getPlayerWn8(playerDetails);

            playerDetailsMap[id] = finalPlayerDetails;

            const filePath = `data/players/`;
            const fileName = `${playerDetails.account_id}.json`;

            this.storageService.writeFile(filePath, fileName, playerDetails);
        }

        return playerDetailsMap;
    }

    async getPlayerVehicleStatistics(playerId: number, tankIds?: number[]) {
        if (!tankIds) {
            const playerVehicles = await this.playerApiService.getPlayerVehicles(playerId);
            tankIds = playerVehicles[playerId].map((vehicle) => vehicle.tank_id);
        }

        return this.playerApiService.getVehicleStatistics(playerId, tankIds);
    }

    getPlayerVehicles(playerId: number) {
        return this.playerApiService.getPlayerVehicles(playerId);
    }
}
