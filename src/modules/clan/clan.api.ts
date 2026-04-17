import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
    ClanSearchResult,
    ClanMember,
    WgApiResponse,
    ClanDetailsMap,
    Clan,
    MemberDetails,
    TankStatisticsMap,
    PlayerVehicleStatistics,
} from '../../types';

@Injectable()
export class ClanApiService {
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

    async searchClanByName(name: string): Promise<ClanSearchResult[]> {
        const url = `https://api.worldoftanks.eu/wot/clans/list/?application_id=${this.apiKey}&search=${name}&limit=5`;

        const response = await firstValueFrom(
            this.httpService.get<WgApiResponse<ClanSearchResult[]>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );

        const responseData = response.data;
        if (!responseData || !Array.isArray(responseData.data)) throw new Error('Unexpected API response');

        return responseData.data;
    }

    async GetClanMembers(clanId: string): Promise<ClanMember[]> {
        const url = `https://api.worldoftanks.eu/wot/clans/info/?application_id=${this.apiKey}&fields=members&clan_id=${clanId}`;

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<ClanDetailsMap>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        if (!response.data[clanId].members) {
            throw new Error('Unexpected API response: Missing members data');
        }
        return response.data[clanId].members;
    }

    async getClanDetails(clanId: string): Promise<Clan> {
        const url = `https://api.worldoftanks.eu/wot/clans/info/?application_id=${this.apiKey}&clan_id=${clanId}&fields=-members`;

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<ClanDetailsMap>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        console.log(response);
        return response.data[clanId];
    }

    async getMembersDetails(memberIds: number[]): Promise<Record<string, Partial<MemberDetails>>> {
        const fields = ['account_id', 'global_rating', 'last_battle_time'];
        const url = `https://api.worldoftanks.eu/wot/account/info/?application_id=${this.apiKey}&account_id=${memberIds.join(',')}&fields=${fields.join(',')}`;

        const { data: response } = await firstValueFrom(
            this.httpService.get<WgApiResponse<Record<string, Partial<MemberDetails>>>>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        return response.data;
    }

    async getVehicleStatistics(memberId: number, tankIds: number[]) {
        const vehicle_stats: Record<string, PlayerVehicleStatistics> = {};
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
        const chunks: number[][] = [];
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
