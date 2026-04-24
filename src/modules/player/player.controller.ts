import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get(':id')
    getPlayerDetails(@Param('id') id: string) {
        return this.playerService.getPlayerDetails([id]);
    }

    @Get(':id/vehicles')
    getPlayerVehicles(@Param('id') id: string, @Query('tier') tier: string[]) {
        return this.playerService.getPlayerVehicles(id);
    }

    @Get(':id/vehicles/details')
    getPlayerVehicleDetails(@Param('id') id: string, @Query('vehicles') vehicles?: string[]) {
        return this.playerService.getPlayerVehicleStatistics(id, vehicles);
    }
}
