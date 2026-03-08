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
            throw new Error(
                'WG_API_KEY is not defined in environment variables',
            );
        }
    }

    async getTanks(tier: string): Promise<Tank[]> {
        const vehicleTypes = [
            'lightTank',
            'mediumTank',
            'heavyTank',
            'AT-SPG',
            'SPG',
        ];

        const promises = vehicleTypes.map((type) => {
            const url = `https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=${this.apiKey}&tier=${tier}&fields=name%2Cnation%2Ctier%2Ctype%2C+&type=${type}`;

            return firstValueFrom(
                this.httpService.get<WgApiResponse<TankMap>>(url).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );
        });

        const responses = await Promise.all(promises);
        const tanks: Tank[] = [];

        responses.forEach((response) => {
            const tankMap = response.data.data;
            Object.values(tankMap).forEach((tank) => {
                tanks.push(tank);
            });
        });

        return tanks;
    }
}
