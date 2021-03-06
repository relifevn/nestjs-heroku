import { Schema } from "mongoose"

export const TemperatureSchema = new Schema({
    value: {
        required: true,
        type: Number,
    },
    createdAt: {
        type: Date,
        required: true,
    },
})  