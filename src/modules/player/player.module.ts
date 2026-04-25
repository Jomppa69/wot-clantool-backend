import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerApiService } from './player.api';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TankModule } from '../tank/tank.module';
import { Wn8Module } from '../wn8/wn8.module';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
    controllers: [PlayerController],
    providers: [PlayerService, PlayerApiService],
    imports: [HttpModule, ConfigModule, TankModule, Wn8Module, StorageModule],
    exports: [PlayerService],
})
export class PlayerModule {}
