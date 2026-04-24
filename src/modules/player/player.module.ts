import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerApiService } from './player.api';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TankModule } from '../tank/tank.module';
import { StorageService } from 'src/common/storage/storage.service';

@Module({
    controllers: [PlayerController],
    providers: [PlayerService, PlayerApiService, StorageService],
    imports: [HttpModule, ConfigModule, TankModule],
    exports: [PlayerService],
})
export class PlayerModule {}
