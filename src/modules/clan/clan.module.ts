import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClanService } from './clan.service';
import { ClanController } from './clan.controller';
import { HttpModule } from '@nestjs/axios';
import { ClanApiService } from './clan.api';
import { TankModule } from '../tank/tank.module';
import { PlayerModule } from '../player/player.module';

@Module({
    controllers: [ClanController],
    providers: [ClanService, ClanApiService],
    imports: [HttpModule, ConfigModule, TankModule, PlayerModule],
})
export class ClanModule {}
