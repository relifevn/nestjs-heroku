import { CustomDocument } from '../../common/interfaces'

export interface ITemperature extends CustomDocument {
    value: number
}

export interface ITemperatureData {
    data: ITemperature[]
}