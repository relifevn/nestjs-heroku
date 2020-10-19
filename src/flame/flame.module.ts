import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { FlameController } from './flame.controller'
import { FlameService } from './flame.service'

@Module({
  imports: [
    MongooseModule.forFeature(MONGOOSE_MODELS),
  ],
  controllers: [FlameController],
  providers: [FlameService],
})
export class FlameModule {}
