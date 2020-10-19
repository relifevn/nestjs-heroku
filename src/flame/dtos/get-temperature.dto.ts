import { PageLoadDto } from '../../common/dtos'
import { ITemperature } from '../interfaces'

export class TemperatureReponse {
    createdAt: string
    value: number

    constructor(temperature: ITemperature) {
        if (!temperature) { return }
        this.createdAt = temperature.createdAt?.toISOString()
        this.value = temperature.value
    }
}

export class GetTemperatureResponseDto extends PageLoadDto<TemperatureReponse> {

}