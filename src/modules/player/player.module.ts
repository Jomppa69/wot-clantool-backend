import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerApiService } from './player.api';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TankModule } from '../tank/tank.module';

@Module({
    controllers: [PlayerController],
    providers: [PlayerService, PlayerApiService],
    imports: [HttpModule, ConfigModule, TankModule],
    exports: [PlayerService],
})
export class PlayerModule {}
