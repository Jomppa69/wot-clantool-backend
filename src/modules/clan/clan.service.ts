import { Injectable } from '@nestjs/common';
import { ClanApiService } from './clan.api';
import { TankService } from '../tank/tank.service';
import { PlayerDetails } from 'src/types';
import { PlayerService } from '../player/player.service';

@Injectable()
export class ClanService {
    constructor(
        private readonly clanApiService: ClanApiService,
        private readonly tankService: TankService,
        private readonly playerService: PlayerService,
    ) {}

    searchClan(name: string) {
        return this.clanApiService.searchClanByName(name);
    }

    async getClanMembers(clanId: string) {
        const clanMemberList = await this.clanApiService.GetClanMembers(clanId);
        for (const member of clanMemberList) {
            member.joined_at = Number(member.joined_at) * 1000; // Convert to milliseconds
        }
        return clanMemberList;
    }

    async getMemberDetails(clanId: string) {
        const clanMemberList = await this.getClanMembers(clanId);
        const memberIds = clanMemberList.map((member) => member.account_id);

        const clanMembersDetails = await this.playerService.getMembersDetails(memberIds);
        return clanMembersDetails;
    }

    async getClanVehicleStatistics(clanId: string) {
        const clanMemberList = await this.getClanMembers(clanId);
        const memberIds = clanMemberList.map((member) => member.account_id.toString());

        const tankIds = await this.tankService.getTanks('10').then((tanks) =>
            Object.values(tanks)
                .flat()
                .map((tank) => tank.tank_id.toString()),
        );

        const vehicleStatistics: Record<string, Partial<PlayerDetails>> = {};

        for (const memberId of memberIds) {
            const vehicle_stats = await this.playerService.getPlayerVehicleStatistics(memberId, tankIds);
            vehicleStatistics[memberId] = { vehicle_stats: vehicle_stats };
        }

        return vehicleStatistics;
    }

    getClanDetails(clanId: string) {
        return this.clanApiService.getClanDetails(clanId);
    }
}
