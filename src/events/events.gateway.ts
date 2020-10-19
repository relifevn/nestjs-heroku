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

import { SOCKET_EVENT } from './constants'
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
    const placeId = this.eventsService.getPlaceIdFromClientSocketRequest(socket)
    await this.eventsService.userConnecting(placeId, socket)
  }

  handleError(
    socket: Socket,
  ): void {
    console.log('[ERROR] handleError', socket.id)
  }

  async getWebSockets(placeId: string): Promise<ISocket[]> {
    return this.eventsService.getActiveSockets(this.server, placeId)
  }

}