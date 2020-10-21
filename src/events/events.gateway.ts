import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsResponse,
} from '@nestjs/websockets'
import {
  Logger,
  UsePipes,
  UseFilters,
  Put,
  Post,
  Controller,
} from '@nestjs/common'
import { Socket, Server } from 'socket.io'
import { EventsService } from './events.service'
import { ObjectId } from 'mongodb'
import { ISocket } from './interfaces'

import { DEVICE_TYPE, SOCKET_EVENT } from './constants'
import { ConfigService } from 'src/config/config.service'
import { TemperaturePostDto, GPSPostDto } from './dtos'
import { ITemperature, ITemperatureData } from 'src/flame/interfaces'
import { CenterService } from 'src/common/services'

@Controller('events')
@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

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
  }

  afterInit(server: Server) {
    this.logger.warn('[INIT] Websocket')
  }

  async sendTemperatureDataToWeb(data: ITemperatureData): Promise<void> {
    if (!this.server) {
      // Very brutal step to prevent bug!
      return
    }
    const sockets = await this.getWebSockets(DEVICE_TYPE.WEB)
    await Promise.all(sockets.map(async socket => {
      const socketIO = await this.eventsService.getSocketConnection(this.server, socket.socketId)
      if (socketIO) {
        socketIO.emit(
          SOCKET_EVENT.TEMPERATURE_GET,
          data,
        )
      }
    }))
  }

  async sendCameraRawDataToWeb(img: string): Promise<void> {
    if (!this.server) {
      // Very brutal step to prevent bug!
      return
    }
    const sockets = await this.getWebSockets(DEVICE_TYPE.WEB)
    await Promise.all(sockets.map(async socket => {
      const socketIO = await this.eventsService.getSocketConnection(this.server, socket.socketId)
      if (socketIO) {
        socketIO.emit(
          SOCKET_EVENT.CAMERA_RAW_GET,
          // `data:image/jpeg;charset=utf-8;base64, ${img}`,
          `data:image/png;base64, ${img}`
        )
      }
    }))
  }

  @SubscribeMessage(SOCKET_EVENT.GPS_POST)
  @Post(SOCKET_EVENT.GPS_POST)
  async addGPSData(
    @ConnectedSocket() socket: Socket,
    @MessageBody() gpsPostDto: GPSPostDto,
  ): Promise<void> {
    if (!socket) { return }
    gpsPostDto = new GPSPostDto(gpsPostDto)
    this.eventsService.addGPSData(socket, gpsPostDto)
  }

  @SubscribeMessage(SOCKET_EVENT.TEMPERATURE_POST)
  @Post(SOCKET_EVENT.TEMPERATURE_POST)
  async addTemperatureData(
    @ConnectedSocket() socket: Socket,
    @MessageBody() temperaturePostDto: TemperaturePostDto,
  ): Promise<void> {
    if (!socket) { return }
    temperaturePostDto = JSON.parse(String(temperaturePostDto)) as TemperaturePostDto
    this.eventsService.addTemperatureData(temperaturePostDto)
  }

  @SubscribeMessage(SOCKET_EVENT.CAMERA_RAW_POST)
  @Post(SOCKET_EVENT.CAMERA_RAW_POST)
  async addCameraRawData(
    @ConnectedSocket() socket: Socket,
    @MessageBody() img: string,
  ): Promise<void> {
    if (!socket) { return }
    this.eventsService.addCameraRawData(img)
  }

  async handleDisconnect(socket: Socket) {
    this.logger.warn(`Client disconnected: ${socket.id}`)
    await this.eventsService.userDisconnecting(socket.id)
  }

  async handleConnection(
    socket: Socket,
    ...args: any[]
  ): Promise<void> {
    const deviceType = this.eventsService.getDeviceTypeFromClientSocketRequest(socket)
    if (!deviceType || [DEVICE_TYPE.JETSON_NANO, DEVICE_TYPE.RASPBERRY, DEVICE_TYPE.WEB].findIndex(e => e == deviceType) == -1) {
      console.log('Server rejected socket connection!')
      socket.disconnect(true)
      return
    }
    this.getWebSockets(DEVICE_TYPE.RASPBERRY).then(() => {})
    this.getWebSockets(DEVICE_TYPE.JETSON_NANO).then(() => {})
    this.logger.log(`[INFO] New connection socket ${socket.id} - ${deviceType}`)
    await this.eventsService.userConnecting(deviceType, socket)
  }

  handleError(
    socket: Socket,
  ): void {
    console.log('[ERROR] handleError', socket.id)
  }

  async getWebSockets(deviceType: string): Promise<ISocket[]> {
    return this.eventsService.getActiveSockets(this.server, deviceType)
  }

}