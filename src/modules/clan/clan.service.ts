import { Injectable } from '@nestjs/common';
import { ClanApiService } from './clan.api';
import { TankService } from '../tank/tank.service';
import { PlayerDetails, PlayerDetailsMap } from 'src/types';
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

    // Gets clan members as member ids
    async getClanMembers(clanId: string) {
        const clanMembers = await this.clanApiService.GetClanMembers(clanId);
        for (const member of Object.values(clanMembers)) {
            member.joined_at = Number(member.joined_at) * 1000; // Convert to milliseconds
        }
        return clanMembers;
    }

    async getMemberDetails(clanId: string): Promise<PlayerDetailsMap> {
        const clanMembers = await this.getClanMembers(clanId);
        const memberIds = Object.values(clanMembers).map((member) => member.account_id);

        const memberDetailsMap = await this.playerService.getPlayerDetails(memberIds);
        return memberDetailsMap;
    }

    getClanDetails(clanId: string) {
        return this.clanApiService.getClanDetails(clanId);
    }
}
