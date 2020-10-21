import { Injectable } from '@nestjs/common'
import { Socket, Server } from 'socket.io'
import { IncomingMessage } from 'http'
import URLParse = require('url-parse')
import * as QueryString from 'query-string'
import { GPS_MODEL, SOCKET_MODEL, SYSTEM_TYPE } from 'src/common/constants'
import { InjectModel } from '@nestjs/mongoose'
import { ISocket, ISocketQuery } from './interfaces'
import { CustomModel, IGPS } from 'src/common/interfaces'
import { GPSPostDto, TemperaturePostDto } from './dtos'
import { ITemperature } from 'src/flame/interfaces'
import { CenterService } from 'src/common/services'
import { FlameService } from 'src/flame/flame.service'
import { DEVICE_TYPE } from './constants'

@Injectable()
export class EventsService {

  constructor(
    @InjectModel(SOCKET_MODEL)
    private readonly socketModel: CustomModel<ISocket, {}>,

    @InjectModel(GPS_MODEL)
    private readonly gpsModel: CustomModel<IGPS, {}>,

    private readonly centerService: CenterService,
    private readonly flameService: FlameService,
  ) {
    console.log('[INIT] EventsService')
  }

  async getSocketFromSocketId(socketId: string): Promise<ISocket> {
    return this.socketModel.findOne({ socketId })
  }

  async getGPSFromSystem(systemType: SYSTEM_TYPE): Promise<IGPS> {
    return this.gpsModel.findOne({ systemType })
  }

  async addTemperatureData(
    temperaturePostDto: TemperaturePostDto,
  ): Promise<void> {
    await this.flameService.addTemperatureData(temperaturePostDto)
  }

  async addGPSData(socket: Socket, gpsPostDto: GPSPostDto): Promise<void> {
    const userSocket = await this.getSocketFromSocketId(socket.id)
    const systemType = userSocket.deviceType === DEVICE_TYPE.FLAME_DETECTOR_ANDROID
      ? SYSTEM_TYPE.FLAME_DETECTOR
      : SYSTEM_TYPE.DROWSINESS_DETECTOR
    const existedGPS = await this.gpsModel.findOne({
      type: systemType,
    })
    if (existedGPS) {
      await this.gpsModel.updateOne(
        {
          type: systemType,
        },
        {
          $set: {
            lat: gpsPostDto.lat,
            lng: gpsPostDto.lng,
          }
        }
      )
    }
  }

  async addCameraRawData(img: string): Promise<void> {
    this.centerService.newCameraRawSubject.next(img)
  }

  async addCameraFilterData(img: string): Promise<void> {
    this.centerService.newCameraFilterSubject.next(img)
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
