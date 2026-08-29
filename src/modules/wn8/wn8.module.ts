import { Module } from '@nestjs/common';
import { Wn8Service } from './wn8.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Wn8ApiService } from './wn8.api';
import { HttpModule } from '@nestjs/axios';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
    providers: [Wn8Service, Wn8ApiService],
    imports: [HttpModule, ScheduleModule, StorageModule],
    exports: [Wn8Service],
})
export class Wn8Module {}
