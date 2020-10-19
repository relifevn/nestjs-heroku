import { Controller, Get } from '@nestjs/common'
import { FlameService } from './flame.service'

@Controller('flame')
export class FlameController {
  constructor(private readonly flameService: FlameService) {}

  @Get()
  getHello(): string {
    return this.flameService.getHello()
  }
}
