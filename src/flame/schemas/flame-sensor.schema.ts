import { Schema } from "mongoose"

export const FlameSensorSchema = new Schema({
    value: {
        required: true,
        type: Number,
    },
})  