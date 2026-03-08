import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ClanSearchResult, ClanMember, WgApiResponse, ClanDetailsMap, Clan } from '../../types';

@Injectable()
export class ClanApiService {
    private readonly apiKey: string | undefined;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.apiKey = this.configService.get<string>('WG_API_KEY');
        if (!this.apiKey) {
            throw new Error(
                'WG_API_KEY is not defined in environment variables',
            );
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
        if (!responseData || !Array.isArray(responseData.data))
            throw new Error('Unexpected API response');

        return responseData.data;
    }

    async GetClanMembers(clanId: string): Promise<ClanMember[]> {
        // Filtered -emblems.x195,-emblems.x24,-emblems.x256,-emblems.x32,-emblems.x64,-tag,-leader_id,-color,-updated_at,-private,-description_html,-accepts_join_requests,-leader_name,-emblems,-clan_id,-renamed_at,-old_tag,-description,-members_count,-name,-creator_name,-created_at,-creator_id,-is_clan_disbanded,-motto,-old_name
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
}
