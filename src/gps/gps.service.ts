import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GPS_MODEL, SYSTEM_TYPE } from 'src/common/constants'
import { CustomModel, IGPS } from 'src/common/interfaces'

import { UpdateGPSRequestDto } from './dtos'

@Injectable()
export class GPSService {
	constructor(
		@InjectModel(GPS_MODEL)
		private readonly gpsModel: CustomModel<IGPS, {}>,
	) {}

	async updateGPSData(body: UpdateGPSRequestDto): Promise<any> {
		const { type, lat, lng } = body
		const p1 = await this.gpsModel.findOneAndUpdate(
			{
				type: SYSTEM_TYPE.DROWSINESS_DETECTOR,
			},
			{
				$set: {
					lat,
					lng,
				},
			},
			{
				new: true,
				upsert: true,
			},
		)

		const p2 = await this.gpsModel.findOneAndUpdate(
			{
				type: SYSTEM_TYPE.FLAME_DETECTOR,
			},
			{
				$set: {
					lat,
					lng,
				},
			},
			{
				new: true,
				upsert: true,
			},
		)

		return { p1, p2 }
	}
}
