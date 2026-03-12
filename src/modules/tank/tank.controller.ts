import { Controller, Get, Query } from '@nestjs/common';
import { TankService } from './tank.service';

@Controller('tanks')
export class TankController {
    constructor(private readonly tankService: TankService) {}

    @Get()
    getTanks(@Query('tier') tier: string) {
        return this.tankService.getTanks(tier);
    }
}
