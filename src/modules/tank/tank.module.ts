import { Module } from '@nestjs/common';
import { TankService } from './tank.service';
import { TankController } from './tank.controller';
import { TankApiService } from './tank.api';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [TankController],
    providers: [TankService, TankApiService],
    imports: [HttpModule, ConfigModule],
    exports: [TankService],
})
export class TankModule {}
