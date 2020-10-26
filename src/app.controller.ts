import { Controller, Get, Response, Query } from '@nestjs/common'
import { AppService } from './app.service'
import { Response as ExpressResponse } from 'express'
import { ConfigService } from './config/config.service'

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) { }

  @Get()
  async getHome(
    @Response() response: ExpressResponse,
  ): Promise<void> {
    response.render(
      'home',
      this.configService.homeConfig,
    )
  }

}
