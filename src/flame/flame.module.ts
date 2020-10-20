import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommonModule } from 'src/common/common.module'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { FlameController } from './flame.controller'
import { FlameService } from './flame.service'

@Module({
  imports: [
    MongooseModule.forFeature(MONGOOSE_MODELS),
    CommonModule,
  ],
  controllers: [
    FlameController,
  ],
  providers: [
    FlameService,
  ],
  exports: [
    FlameService,
  ]
})
export class FlameModule { }
