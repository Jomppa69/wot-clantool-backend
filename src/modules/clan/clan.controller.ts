import { Controller, Get, Query } from '@nestjs/common';
import { ClanService } from './clan.service';

@Controller('clan')
export class ClanController {
    constructor(private readonly clanService: ClanService) {}

    @Get('search')
    searchClan(@Query('name') name: string) {
        console.log('Searching for clan:', name);
        return this.clanService.searchClan(name);
    }

    @Get('members')
    getClanMembers(@Query('clanId') clanId: string) {
        return this.clanService.getClanMembers(clanId);
    }

    @Get('details')
    getClanDetails(@Query('clanId') clanId: string) {
        return this.clanService.getClanDetails(clanId);
    }
}
