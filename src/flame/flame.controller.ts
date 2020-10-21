import { Controller, Get, Post } from '@nestjs/common'
import { FlameService } from './flame.service'
import { GetTemperatureResponseDto } from './dtos'

@Controller('flame')
export class FlameController {

  constructor(private readonly flameService: FlameService) { }

  @Get('temperature')
  async getTemperatureHistory(): Promise<GetTemperatureResponseDto> {
    return this.flameService.getTemperatureHistory()
  }

}
