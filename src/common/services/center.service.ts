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

	public newDrowsinessDetectionDataSubject = new Subject<number>()
	public newDrowsinessDetectionData$ = this.newDrowsinessDetectionDataSubject.asObservable()

	public newCameraRawSubject = new Subject<string>()
	public newCameraRaw$ = this.newCameraRawSubject.asObservable()

	public newCameraFilterSubject = new Subject<string>()
	public newCameraFilter$ = this.newCameraFilterSubject.asObservable()

	public pushNotificationSubject = new Subject<Date>()
	public pushNotification$ = this.pushNotificationSubject.asObservable()

	public pushNotificationDrowsinessDetectorSubject = new Subject<Date>()
	public pushNotificationDrowsinessDetector$ = this.pushNotificationDrowsinessDetectorSubject.asObservable()

	public lastSent: Date = new Date(new Date().getTime() - 10000000)
	public lastSentDrowsinessDetector: Date = new Date(
		new Date().getTime() - 10000000,
	)
	public DISTANCE_BETWEEN_EACH_NOTIFICATION = 10000 // 10s

	constructor() {
		this.newDetectFlameData$.subscribe(data => {
			if (this.checkIsTimeToSendGmail()) {
				const currentDate = new Date()
				this.pushNotificationSubject.next(currentDate)
				this.lastSent = currentDate
			}
		})

		this.newDrowsinessDetectionData$.subscribe(data => {
			if (this.checkIsTimeToSendGmailDrows()) {
				const currentDate = new Date()
				this.pushNotificationDrowsinessDetectorSubject.next(currentDate)
				this.lastSentDrowsinessDetector = currentDate
			}
		})
	}

	private checkIsTimeToSendGmail(): boolean {
		return (
			new Date().getTime() - this.lastSent.getTime() >
			this.DISTANCE_BETWEEN_EACH_NOTIFICATION
		)
	}

	private checkIsTimeToSendGmailDrows(): boolean {
		return (
			new Date().getTime() - this.lastSentDrowsinessDetector.getTime() >
			this.DISTANCE_BETWEEN_EACH_NOTIFICATION
		)
	}
}
