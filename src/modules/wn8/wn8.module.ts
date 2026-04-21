import { Module } from '@nestjs/common';
import { Wn8Service } from './wn8.service';
import { Wn8Controller } from './wn8.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { Wn8ApiService } from './wn8.api';
import { HttpModule } from '@nestjs/axios';
import { StorageService } from 'src/common/storage/storage.service';

@Module({
    controllers: [Wn8Controller],
    providers: [Wn8Service, Wn8ApiService, StorageService],
    imports: [HttpModule, ScheduleModule],
})
export class Wn8Module {}