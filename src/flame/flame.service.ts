import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { TEMPERATURE_MODEL } from 'src/common/constants'
import { CustomModel } from 'src/common/interfaces'
import { GetTemperatureResponseDto, TemperatureReponse } from './dtos'
import { ITemperature } from './interfaces'

@Injectable()
export class FlameService {
  
  constructor(
    @InjectModel(TEMPERATURE_MODEL)
    private readonly temperatureModel: CustomModel<ITemperature, {}>,
  ) {
  }

  getHello(): string {
    return 'Hello World!'
  }

  async getTemperatureHistory(): Promise<GetTemperatureResponseDto> {
    const temperatureHistory = await this.temperatureModel.aggregate([
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 20
      },
    ]) as ITemperature[]
    const temperatureHistoryResponse = temperatureHistory.map(temperature => new TemperatureReponse(temperature))
    return {
      items: temperatureHistoryResponse,
    }
  }

}
