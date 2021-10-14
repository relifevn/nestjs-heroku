import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommonModule } from 'src/common/common.module'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { ConfigModule } from 'src/config/config.module'
import { FlameModule } from 'src/flame/flame.module'

import { EventsGateway } from './events.gateway'
import { EventsService } from './events.service'

@Module({
	imports: [
		MongooseModule.forFeature(MONGOOSE_MODELS),
		ConfigModule,
		CommonModule,
		FlameModule,
	],
	controllers: [EventsGateway],
	providers: [EventsGateway, EventsService],
	exports: [EventsGateway, EventsService],
})
export class EventsModule {}
