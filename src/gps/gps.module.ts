import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommonModule } from 'src/common/common.module'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { ConfigModule } from 'src/config/config.module'

import { GPSController } from './gps.controller'
import { GPSService } from './gps.service'

@Module({
	imports: [
		MongooseModule.forFeature(MONGOOSE_MODELS),
		ConfigModule,
		CommonModule,
	],
	controllers: [GPSController],
	providers: [GPSService],
})
export class GPSModule {}
