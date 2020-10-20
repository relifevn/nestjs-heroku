import { Module } from '@nestjs/common'
import { EventsGateway } from './events.gateway'
import { EventsService } from './events.service'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from 'src/config/config.module'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { CommonModule } from 'src/common/common.module'
import { FlameModule } from 'src/flame/flame.module'

@Module({
  imports: [
    MongooseModule.forFeature(MONGOOSE_MODELS),
    ConfigModule,
    CommonModule,
    FlameModule,
  ],
  controllers: [
    EventsGateway,
  ],
  providers: [
    EventsGateway,
    EventsService,
  ],
  exports: [
    EventsGateway,
    EventsService,
  ],
})
export class EventsModule { }
