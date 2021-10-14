import { Body, Controller, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateGPSRequestDto } from './dtos'
import { GPSService } from './gps.service'

@ApiTags('gps')
@Controller('gps')
export class GPSController {
	constructor(private readonly gpsService: GPSService) {}

	@Put()
	async updateGPS(@Body() body: UpdateGPSRequestDto): Promise<any> {
		return this.gpsService.updateGPSData(body)
	}
}
