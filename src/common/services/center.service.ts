import { Injectable } from '@nestjs/common'
import { Subject } from 'rxjs'
import { ITemperatureData } from 'src/flame/interfaces'

@Injectable()
export class CenterService {

    public newTemperatureDataSubject = new Subject<ITemperatureData>()
    public newTemperatureData$ = this.newTemperatureDataSubject.asObservable()

    public newFlameSensorDataSubject = new Subject<number>()
    public newFlameSensorData$ = this.newFlameSensorDataSubject.asObservable()

    public newDetectFlameDataSubject = new Subject<number>()
    public newDetectFlameData$ = this.newDetectFlameDataSubject.asObservable()

    public newCameraRawSubject = new Subject<string>()
    public newCameraRaw$ = this.newCameraRawSubject.asObservable()

    public newCameraFilterSubject = new Subject<string>()
    public newCameraFilter$ = this.newCameraFilterSubject.asObservable()

    constructor() {

    }

}
