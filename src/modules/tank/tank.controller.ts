import { Controller, Get, Query } from '@nestjs/common';
import { TankService } from './tank.service';
import { Wn8Service } from '../wn8/wn8.service';

@Controller('tanks')
export class TankController {
    constructor(
        private readonly tankService: TankService,
        private readonly wn8Service: Wn8Service,
    ) {}

    @Get()
    getTanks(@Query('tier') tier: string) {
        return this.tankService.getTanks(tier);
    }

    @Get('expected-values')
    getExpectedValues() {
        return this.wn8Service.getExpectedValues();
    }
}
