import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { TEMPERATURE_MODEL } from 'src/common/constants'
import { CustomModel } from 'src/common/interfaces'
import { CenterService } from 'src/common/services'
import { TemperaturePostDto } from 'src/events/dtos'
import { GetTemperatureResponseDto, TemperatureReponse } from './dtos'
import { ITemperature } from './interfaces'

@Injectable()
export class FlameService {

  constructor(
    @InjectModel(TEMPERATURE_MODEL)
    private readonly temperatureModel: CustomModel<ITemperature, {}>,

    private readonly centerService: CenterService,
  ) {
  }

  getHello(): string {
    return 'Hello World!'
  }

  async addTemperatureData(
    temperaturePostDto: TemperaturePostDto,
  ): Promise<void> {
    const newTemperatureData = await Promise.all(
      temperaturePostDto.data?.map(async t => {
        return this.temperatureModel.create({
          value: t.value,
          createdAt: new Date(t.createdAt),
        } as ITemperature)
      }) || []
    )
    this.centerService.newTemperatureDataSubject.next({
      data: newTemperatureData
    })
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
