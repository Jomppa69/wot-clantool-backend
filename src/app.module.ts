import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClanModule } from './modules/clan/clan.module';
import { UserModule } from './modules/user/user.module';
import { TankModule } from './modules/tank/tank.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CacheModule.register({
            ttl: 3600000,
            max: 20,
            isGlobal: true,
        }),
        ClanModule,
        UserModule,
        TankModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class AppModule {}
