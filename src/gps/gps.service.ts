import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GPS_MODEL } from 'src/common/constants'
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
		return this.gpsModel.findOneAndUpdate(
			{
				type,
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
	}
}
