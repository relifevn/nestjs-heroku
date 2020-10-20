import { Schema } from 'mongoose'

export const SocketSchema = new Schema({
  deviceType: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
})
