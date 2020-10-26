import { Controller, Get, Post } from '@nestjs/common'
import { FlameService } from './flame.service'
import { GetTemperatureResponseDto } from './dtos'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'


@ApiTags('flame')
@ApiBearerAuth()
@Controller('flame')
export class FlameController {

  constructor(private readonly flameService: FlameService) { }

  @Get('temperature')
  async getTemperatureHistory(): Promise<GetTemperatureResponseDto> {
    return this.flameService.getTemperatureHistory()
  }

}
