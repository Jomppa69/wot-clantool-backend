import { Injectable } from '@nestjs/common';
import { ClanApiService } from './clan.api';

@Injectable()
export class ClanService {
    constructor(private readonly clanApiService: ClanApiService) {}

    searchClan(name: string) {
        return this.clanApiService.searchClanByName(name);
    }

    getClanMembers(clanId: string) {
        return this.clanApiService.GetClanMembers(clanId);
    }

    getClanDetails(clanId: string) {
        return this.clanApiService.getClanDetails(clanId);
    }
}
