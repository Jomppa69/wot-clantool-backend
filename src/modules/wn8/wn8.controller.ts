import { Controller, Get } from '@nestjs/common';
import { Wn8Service } from './wn8.service';

@Controller('wn8')
export class Wn8Controller {
    constructor(private readonly wn8Service: Wn8Service) {}

    @Get('expected-values')
    async fetchExpectedValues() {
        return this.wn8Service.fetchExpectedValues();
    }
}
