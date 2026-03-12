import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClanService } from './clan.service';

@Controller('clans')
export class ClanController {
    constructor(private readonly clanService: ClanService) {}

    @Get()
    searchClan(@Query('name') name: string) {
        return this.clanService.searchClan(name);
    }

    @Get(':id/members')
    getClanMembers(@Param('id') id: string) {
        return this.clanService.getClanMembers(id);
    }

    @Get(':id')
    getClanDetails(@Param('id') id: string) {
        return this.clanService.getClanDetails(id);
    }
}
