import { CustomDocument } from '../../common/interfaces'

export interface ISocket extends CustomDocument {
    deviceType: string
    socketId: string
}