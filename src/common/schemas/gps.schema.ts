import { Schema } from 'mongoose'

export const GPSSchema = new Schema({
    lat: {
        required: true,
        type: Number,
    },
    lng: {
        required: true,
        type: Number,
    },
    type: {
        required: true,
        type: String,
    },
})
