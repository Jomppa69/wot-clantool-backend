import { Injectable } from '@nestjs/common';
import { PlayerApiService } from './player.api';

@Injectable()
export class PlayerService {
    constructor(private readonly playerApiService: PlayerApiService) {}

    getPlayerDetails(id: string) {
        return this.playerApiService.getPlayerDetails([id]);
    }

    // Used by clan module to get details for all clan members.
    getMembersDetails(memberIds: string[]) {
        return this.playerApiService.getPlayerDetails(memberIds);
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
