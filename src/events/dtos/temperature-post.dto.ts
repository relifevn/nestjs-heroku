export class TemperatureDto {
    value: number
    createdAt: string
}

export class TemperaturePostDto {
    data: TemperatureDto[]
}