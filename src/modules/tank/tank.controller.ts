import { Controller, Get, Query } from '@nestjs/common';
import { TankService } from './tank.service';

@Controller('tank')
export class TankController {
    constructor(private readonly tankService: TankService) {}

    @Get('tanks')
    getTanks(@Query('tier') tier: string) {
        return this.tankService.getTanks(tier);
    }
}
