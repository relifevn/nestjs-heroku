import { Injectable } from '@nestjs/common'
import { Subject } from 'rxjs'
import { ITemperatureData } from 'src/flame/interfaces'

@Injectable()
export class CenterService {

    public newTemperatureDataSubject = new Subject<ITemperatureData>()
    public newTemperatureData$ = this.newTemperatureDataSubject.asObservable()

    public newCameraRawSubject = new Subject<string>()
    public newCameraRaw$ = this.newCameraRawSubject.asObservable()

    constructor() {

    }

}
