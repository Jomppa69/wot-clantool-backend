import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ClanSearchResult, ClanMember, WgApiResponse, ClanDetailsMap, Clan, PlayerDetails } from '../../types';

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
        return response.data[clanId];
    }
}
