import { SYSTEM_TYPE } from 'src/common/constants'

export class UpdateGPSRequestDto {
	type: SYSTEM_TYPE
	lat: number
	lng: number
}
