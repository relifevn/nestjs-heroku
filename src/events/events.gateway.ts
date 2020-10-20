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
import { TemperaturePostDto } from './dtos'

@Controller('events')
@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private logger: Logger = new Logger('EventsGateway')

  @WebSocketServer()
  server: Server

  constructor(
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
  ) {
  }

  afterInit(server: Server) {
    this.logger.warn('[INIT] Websocket')
  }

  @SubscribeMessage(SOCKET_EVENT.TEMPERATURE_POST)
  @Post(SOCKET_EVENT.TEMPERATURE_POST)
  async sendMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() temperaturePostDto: TemperaturePostDto,
  ): Promise<void> {
    if (!socket) { return }
    console.log(SOCKET_EVENT.TEMPERATURE_POST, temperaturePostDto)
  }

  async handleDisconnect(socket: Socket) {
    this.logger.warn(`Client disconnected: ${socket.id}`)
    await this.eventsService.userDisconnecting(socket.id)
  }

  async handleConnection(
    socket: Socket,
    ...args: any[]
  ): Promise<void> {
    this.logger.warn(`Client connected: ${socket.id}`)
    const deviceType = this.eventsService.getDeviceTypeFromClientSocketRequest(socket)
    if (!deviceType || [DEVICE_TYPE.JETSON_NANO, DEVICE_TYPE.RASPBERRY, DEVICE_TYPE.WEB].findIndex(e => e == deviceType) == -1) {
      console.log('Server rejected socket connection!')
      socket.disconnect(true)
      return
    }
    console.log(`[INFO] New connection socket ${socket.id} - ${deviceType}`)
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