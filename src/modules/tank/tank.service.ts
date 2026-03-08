import { Injectable } from '@nestjs/common';
import { TankApiService } from './tank.api';

@Injectable()
export class TankService {
    constructor(private readonly tankApiService: TankApiService) {}

    getTanks(tier: string) {
        return this.tankApiService.getTanks(tier);
    }
}
