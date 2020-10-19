import { Schema } from 'mongoose'

export const SocketSchema = new Schema({
  placeId: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
})
