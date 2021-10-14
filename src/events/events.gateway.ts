import { Controller, Logger, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SYSTEM_TYPE } from 'src/common/constants'
import { CenterService } from 'src/common/services'
import { ConfigService } from 'src/config/config.service'
import { ITemperatureData } from 'src/flame/interfaces'

import { DEVICE_TYPE, LIST_DEVICES, SOCKET_EVENT } from './constants'
import { GPSPostDto, TemperaturePostDto } from './dtos'
import { EventsService } from './events.service'
import { ISocket } from './interfaces'

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@WebSocketGateway()
export class EventsGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger('EventsGateway')

	@WebSocketServer()
	server: Server

	constructor(
		private readonly eventsService: EventsService,
		private readonly configService: ConfigService,
		private readonly centerService: CenterService,
	) {
		this.centerService.newTemperatureData$.subscribe(async data => {
			await this.sendTemperatureDataToWeb(data)
		})
		this.centerService.newCameraRaw$.subscribe(async data => {
			await this.sendCameraRawDataToWeb(data)
		})
		this.centerService.newCameraFilter$.subscribe(async data => {
			await this.sendCameraFilterDataToWeb(data)
		})
		this.centerService.newFlameSensorData$.subscribe(async data => {
			await this.sendFlameSensorDataToWeb(data)
		})
		this.centerService.newDetectFlameData$.subscribe(async data => {
			await this.sendDetectFlameDataToWeb(data)
		})
		this.centerService.pushNotification$.subscribe(async date => {
			await this.callFromFlameDetectorAndroid(date)
			await this.sendSMSFromFlameDetectorAndroid(date)
		})
		this.centerService.pushNotificationDrowsinessDetector$.subscribe(
			async date => {
				await this.callFromDrowsinessDetectorAndroid(date)
				await this.sendSMSFromDrowsinessDetectorAndroid(date)
			},
		)
	}

	afterInit(server: Server) {
		this.logger.warn('[INIT] Websocket')
	}

	async sendDataToWeb<T>(event: SOCKET_EVENT, data: T): Promise<void> {
		if (!this.server) {
			// Very brutal step to prevent bug!
			return
		}
		const sockets = await this.getWebSockets(DEVICE_TYPE.WEB)
		await Promise.all(
			sockets.map(async socket => {
				const socketIO = await this.eventsService.getSocketConnection(
					this.server,
					socket.socketId,
				)
				if (socketIO) {
					socketIO.emit(event, data)
				}
			}),
		)
	}

	async sendDataToAndroid<T>(
		systemType: SYSTEM_TYPE,
		event: SOCKET_EVENT,
		data: T,
	): Promise<void> {
		if (!this.server) {
			// Very brutal step to prevent bug!
			return
		}
		const deviceType =
			systemType === SYSTEM_TYPE.FLAME_DETECTOR
				? DEVICE_TYPE.FLAME_DETECTOR_ANDROID
				: DEVICE_TYPE.DROWSINESS_DETECTOR_ANDROID
		const sockets = await this.getWebSockets(deviceType)
		await Promise.all(
			sockets.map(async socket => {
				const socketIO = await this.eventsService.getSocketConnection(
					this.server,
					socket.socketId,
				)
				if (socketIO) {
					socketIO.emit(event, data)
				}
			}),
		)
	}

	async sendTemperatureDataToWeb(data: ITemperatureData): Promise<void> {
		await this.sendDataToWeb<ITemperatureData>(
			SOCKET_EVENT.TEMPERATURE_GET,
			data,
		)
	}

	async sendCameraRawDataToWeb(img: string): Promise<void> {
		await this.sendDataToWeb<string>(
			SOCKET_EVENT.CAMERA_RAW_GET,
			`data:image/png;base64, ${img}`,
		)
	}

	async sendCameraFilterDataToWeb(img: string): Promise<void> {
		await this.sendDataToWeb<string>(
			SOCKET_EVENT.CAMERA_FILTER_GET,
			`data:image/png;base64, ${img}`,
		)
	}

	async sendFlameSensorDataToWeb(value: number): Promise<void> {
		await this.sendDataToWeb<number>(SOCKET_EVENT.FLAME_SENSOR_GET, value)
	}

	async sendDetectFlameDataToWeb(value: number): Promise<void> {
		await this.sendDataToWeb<number>(SOCKET_EVENT.DETECT_FLAME_GET, value)
	}

	async callFromFlameDetectorAndroid(date: Date = new Date()): Promise<void> {
		await this.sendDataToAndroid(
			SYSTEM_TYPE.FLAME_DETECTOR,
			SOCKET_EVENT.CALL,
			{
				phoneNumber: this.configService.receivedFlameDetectorPhoneNumber,
			},
		)
	}

	async callFromDrowsinessDetectorAndroid(
		date: Date = new Date(),
	): Promise<void> {
		await this.sendDataToAndroid(
			SYSTEM_TYPE.DROWSINESS_DETECTOR,
			SOCKET_EVENT.CALL,
			{
				phoneNumber: this.configService.receivedDrowsinessDetectorPhoneNumber,
			},
		)
	}

	async sendSMSFromFlameDetectorAndroid(
		date: Date = new Date(),
	): Promise<void> {
		const gps = await this.eventsService.getGPSFromSystem(
			SYSTEM_TYPE.FLAME_DETECTOR,
		)
		const gpsLink = gps
			? `http://www.google.com/maps/place/${gps.lat},${gps.lng}`
			: ''

		await this.sendDataToAndroid(
			SYSTEM_TYPE.FLAME_DETECTOR,
			SOCKET_EVENT.SEND_SMS,
			{
				phoneNumber: this.configService.receivedFlameDetectorPhoneNumber,
				message: `Hệ thống phát hiện lửa vào lúc ${this.convertToVNDateTime(
					date,
				)} ${gpsLink}`,
			},
		)
	}

	async sendSMSFromDrowsinessDetectorAndroid(
		date: Date = new Date(),
	): Promise<void> {
		const gps = await this.eventsService.getGPSFromSystem(
			SYSTEM_TYPE.DROWSINESS_DETECTOR,
		)
		const gpsLink = gps
			? `http://www.google.com/maps/place/${gps.lat},${gps.lng}`
			: ''

		await this.sendDataToAndroid(
			SYSTEM_TYPE.DROWSINESS_DETECTOR,
			SOCKET_EVENT.SEND_SMS,
			{
				phoneNumber: this.configService.receivedDrowsinessDetectorPhoneNumber,
				message: `Hệ thống nhận biết tài xế buồn ngủ vào lúc ${this.convertToVNDateTime(
					date,
				)} ${gpsLink}`,
			},
		)
	}

	convertToVNDateTime(date): string {
		return new Date(date.getTime() + 7 * 3600 * 1000).toISOString()
	}

	@SubscribeMessage(SOCKET_EVENT.GPS_POST)
	@Post(SOCKET_EVENT.GPS_POST)
	async addGPSData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() gpsPostDto: GPSPostDto,
	): Promise<void> {
		if (!socket) {
			return
		}
		gpsPostDto = new GPSPostDto(gpsPostDto)
		await this.eventsService.addGPSData(socket, gpsPostDto)
	}

	@SubscribeMessage(SOCKET_EVENT.TEMPERATURE_POST)
	@Post(SOCKET_EVENT.TEMPERATURE_POST)
	async addTemperatureData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() temperaturePostDto: TemperaturePostDto,
	): Promise<void> {
		if (!socket) {
			return
		}
		temperaturePostDto = JSON.parse(
			String(temperaturePostDto),
		) as TemperaturePostDto
		this.eventsService.addTemperatureData(temperaturePostDto)
	}

	@SubscribeMessage(SOCKET_EVENT.CAMERA_RAW_POST)
	@Post(SOCKET_EVENT.CAMERA_RAW_POST)
	async addCameraRawData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() img: string,
	): Promise<void> {
		if (!socket) {
			return
		}
		this.eventsService.addCameraRawData(img)
	}

	@SubscribeMessage(SOCKET_EVENT.CAMERA_FILTER_POST)
	@Post(SOCKET_EVENT.CAMERA_FILTER_POST)
	async addCameraFilterData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() img: string,
	): Promise<void> {
		if (!socket) {
			return
		}
		this.eventsService.addCameraFilterData(img)
	}

	@SubscribeMessage(SOCKET_EVENT.FLAME_SENSOR_POST)
	@Post(SOCKET_EVENT.FLAME_SENSOR_POST)
	async addFlameSensorData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() value: number,
	): Promise<void> {
		if (!socket) {
			return
		}
		value = Number(value) || 0
		this.centerService.newFlameSensorDataSubject.next(value)
	}

	@SubscribeMessage(SOCKET_EVENT.DETECT_FLAME_POST)
	@Post(SOCKET_EVENT.DETECT_FLAME_POST)
	async addDetectFlameData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() value: number,
	): Promise<void> {
		if (!socket) {
			return
		}
		value = Number(value) || 0
		this.centerService.newDetectFlameDataSubject.next(value)
	}

	@SubscribeMessage(SOCKET_EVENT.DROWSINESS_DETECTION_POST)
	@Post(SOCKET_EVENT.DROWSINESS_DETECTION_POST)
	async adddDrowsinessDetectionData(
		@ConnectedSocket() socket: Socket,
		@MessageBody() value: number,
	): Promise<void> {
		if (!socket) {
			return
		}
		value = Number(value) || 0
		this.centerService.newDrowsinessDetectionDataSubject.next(value)
	}

	async handleDisconnect(socket: Socket) {
		this.logger.warn(`Client disconnected: ${socket.id}`)
		await this.eventsService.userDisconnecting(socket.id)
	}

	async handleConnection(socket: Socket, ...args: any[]): Promise<void> {
		const deviceType = this.eventsService.getDeviceTypeFromClientSocketRequest(
			socket,
		)
		if (!deviceType || LIST_DEVICES.findIndex(e => e == deviceType) == -1) {
			console.log('Server rejected socket connection!')
			socket.disconnect(true)
			return
		}
		this.getWebSockets(DEVICE_TYPE.RASPBERRY).then(() => {})
		this.getWebSockets(DEVICE_TYPE.JETSON_NANO).then(() => {})
		this.logger.log(`[INFO] New connection socket ${socket.id} - ${deviceType}`)
		await this.eventsService.userConnecting(deviceType, socket)
	}

	handleError(socket: Socket): void {
		console.log('[ERROR] handleError', socket.id)
	}

	async getWebSockets(deviceType: string): Promise<ISocket[]> {
		return this.eventsService.getActiveSockets(this.server, deviceType)
	}
}
