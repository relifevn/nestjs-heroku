import { CustomDocument } from '../../common/interfaces'

export interface ISocket extends CustomDocument {
    placeId: string
    socketId: string
}