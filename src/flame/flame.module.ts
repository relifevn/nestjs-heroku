import { Module } from '@nestjs/common'
import { FlameController } from './flame.controller'
import { FlameService } from './flame.service'

@Module({
  imports: [],
  controllers: [FlameController],
  providers: [FlameService],
})
export class FlameModule {}
