import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ExpectedValuesResponse } from 'src/types';

@Injectable()
export class Wn8ApiService {
    constructor(private httpService: HttpService) {}

    async fetchExpectedValues(): Promise<ExpectedValuesResponse> {
        const url = 'https://static.modxvm.com/wn8-data-exp/json/wg/wn8exp.json';
        const { data: response } = await firstValueFrom(
            this.httpService.get<ExpectedValuesResponse>(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );
        return response;
    }
}
