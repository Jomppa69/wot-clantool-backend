import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PlayerClanDetails, PlayerOverview, PlayerVehicleDetails, TankStatisticsMap, WgApiResponse } from 'src/types';

@Injectable()
export class PlayerApiService {
    private readonly logger = new Logger(PlayerApiService.name);
    private readonly apiKey: string | undefined;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.apiKey = this.configService.get<string>('WG_API_KEY');
        if (!this.apiKey) {
            throw new Error('WG_API_KEY is not defined in environment variables');
        }
    }

    // Edit this out from clan module. Make clan module go through single player details and not get all at once
    async getPlayerOverview(playerIds: string[]): Promise<Record<string, PlayerOverview>> {
        const fields = ['account_id', 'global_rating', 'last_battle_time'];
        const url = `https://api.worldoftanks.eu/wot/account/info/?application_id=${this.apiKey}&account_id=${playerIds.join(',')}&fields=${fields.join(',')}`;

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<Record<string, PlayerOverview>>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        return response.data;
    }

    async getPlayerClanDetails(playerIds: string[]): Promise<Record<string, PlayerClanDetails>> {
        const fields = ['role', 'role_i18n', 'joined_at', 'clan.clan_id'];
        const url = `https://api.worldoftanks.eu/wot/clans/accountinfo/?application_id=f0caf677f57a195024f047e27c2913dd&account_id=${playerIds.join(',')}&fields=${fields.join(',')}`

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<Record<string, PlayerClanDetails>>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        return response.data;
    }

    async getPlayerVehicles(playerId: string) {
        const url = `https://api.worldoftanks.eu/wot/account/tanks/?application_id=${this.apiKey}&account_id=${playerId}&fields=tank_id`;

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<Record<string, { tank_id: string }[]>>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        return response.data;
    }

    async getVehicleStatistics(memberId: string, tankIds: string[]) {
        const vehicle_stats: Record<string, PlayerVehicleDetails> = {};
        const fields = [
            'tank_id',
            'random',
            '-random.battles_on_stunning_vehicles',
            '-random.max_xp',
            '-random.capture_points',
            '-random.max_frags',
            '-random.stun_number',
            '-random.max_damage',
        ];

        // Max 100 tankIds per request. Split into chunks if necessary.
        const chunks: string[][] = [];
        for (let i = 0; i < tankIds.length; i += 100) {
            chunks.push(tankIds.slice(i, i + 100));
        }

        for (const chunk of chunks) {
            const url = `https://api.worldoftanks.eu/wot/tanks/stats/?application_id=${this.apiKey}&account_id=${memberId}&tank_id=${chunk.join(',')}&fields=${fields.join(',')}&extra=random`;
            const { data: response } = await firstValueFrom(
                this.httpService.get<WgApiResponse<TankStatisticsMap>>(url).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );
            if (response.data[memberId]) {
                for (const tank of response.data[memberId]) {
                    vehicle_stats[tank.tank_id] = tank.random;
                }
            }
        }
        return vehicle_stats;
    }
}
