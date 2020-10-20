import { Injectable } from '@nestjs/common'
import { Socket, Server } from 'socket.io'
import { IncomingMessage } from 'http'
import URLParse = require('url-parse')
import * as QueryString from 'query-string'
import { SOCKET_MODEL } from 'src/common/constants'
import { InjectModel } from '@nestjs/mongoose'
import { ISocket, ISocketQuery } from './interfaces'
import { CustomModel } from 'src/common/interfaces'
import { TemperaturePostDto } from './dtos'
import { ITemperature } from 'src/flame/interfaces'
import { CenterService } from 'src/common/services'
import { FlameService } from 'src/flame/flame.service'

@Injectable()
export class EventsService {

  constructor(
    @InjectModel(SOCKET_MODEL)
    private readonly socketModel: CustomModel<ISocket, {}>,

    private readonly centerService: CenterService,
    private readonly flameService: FlameService,
  ) {
    console.log('[INIT] EventsService')
  }

  async addTemperatureData(
    temperaturePostDto: TemperaturePostDto,
  ): Promise<void> {
    await this.flameService.addTemperatureData(temperaturePostDto)
  }

  getDeviceTypeFromClientSocketRequest(socket: Socket): string {
    const request = socket.request as IncomingMessage
    const url = URLParse(request.url)
    const query = QueryString.parse(url.query.toString()) as ISocketQuery
    const deviceType = query.deviceType
    return deviceType
  }

  async userConnecting(deviceType: string, socket: Socket): Promise<ISocket[]> {
    return this.socketModel.insertMany([{
      deviceType,
      socketId: socket.id,
    }] as ISocket[])
  }

  async userDisconnecting(socketId: string): Promise<void> {
    await this.socketModel.deleteMany({
      socketId,
    } as ISocket)
  }

  async handleDisconnectedSockets(sockets: Socket[]): Promise<void> {
    await this.socketModel.deleteMany({
      socketId: { $in: sockets.map(socket => socket.id) },
    })
  }

  async getAllSockets(): Promise<ISocket[]> {
    return this.socketModel.find()
  }

  async checkIfSocketIsConnecting(
    server: Server,
    socket: ISocket,
  ): Promise<boolean> {
    const socketIO = await this.getSocketConnection(server, socket.socketId)
    if (socketIO) {
      return true
    }
    return false
  }

  async getSocketConnection(server: Server, socketId: string): Promise<Socket> {
    if (server) {
      const room = server.in(socketId)
      if (room) {
        const socket = room.connected[socketId]
        if (socket) return socket
      }
    }

    if (!server) { return }

    await this.userDisconnecting(socketId)
  }

  async getCachedSocket(socket: Socket): Promise<ISocket> {
    const cachedSocket = await this.socketModel.findOne({ socketId: socket.id })
    if (!cachedSocket) {
      console.warn(`Cached socket not found ${socket.id}`)
    }
    return cachedSocket
  }

  async getActiveSockets(server: Server, deviceType: string): Promise<ISocket[]> {
    const sockets = await this.socketModel.find({ deviceType }).lean() as ISocket[]
    const connectedSockets = await Promise.all(sockets.map(async cachedSocket => {
      const socket = await this.getSocketConnection(server, cachedSocket.socketId)
      if (socket) {
        return cachedSocket
      }
      await this.userDisconnecting(cachedSocket.socketId)
    }))
    return connectedSockets.filter(socket => socket)
  }

  async disconnectSocket(server: Server, socketId: string): Promise<boolean> {
    const socket = await this.getSocketConnection(server, socketId)
    if (socket) {
      socket.disconnect(true)
      return true
    }
    return false
  }

}
