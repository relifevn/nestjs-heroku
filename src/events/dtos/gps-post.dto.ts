export class GPSPostDto {
    lat: number
    lng: number

    constructor(gpsPostDto: GPSPostDto) {
        if (!gpsPostDto) { return}
        const data = JSON.parse(String(gpsPostDto)) as GPSPostDto
        this.lat = Number(data.lat)
        this.lng = Number(data.lng)
    }
}