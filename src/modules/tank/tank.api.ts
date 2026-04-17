import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Tank, TankMap, WgApiResponse } from '../../types';

@Injectable()
export class TankApiService {
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

    async getTanks(tier: string): Promise<Record<string, Tank[]>> {
        const vehicleTypes = ['lightTank', 'mediumTank', 'heavyTank', 'AT-SPG', 'SPG'];

        const promises = vehicleTypes.map((type) => {
            const fields = ['name', 'nation', 'tier', 'type', 'tank_id'];
            const url = `https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=${this.apiKey}&tier=${tier}&fields=${fields.join(',')}&type=${type}`;

            return [
                type,
                firstValueFrom(
                    this.httpService.get<WgApiResponse<TankMap>>(url).pipe(
                        catchError((error: AxiosError) => {
                            throw error;
                        }),
                    ),
                ),
            ] as const;
        });

        const responses = await Promise.all(promises.map(async ([type, promise]) => [type, await promise] as const));

        const tanks: Record<string, Tank[]> = {
            lightTank: [],
            mediumTank: [],
            heavyTank: [],
            'AT-SPG': [],
            SPG: [],
        };

        responses.forEach(([type, response]) => {
            const tankMap = response.data.data;
            Object.values(tankMap).forEach((tank) => {
                tanks[type].push(tank);
            });
        });

        console.log(tanks);
        return tanks;
    }
}
