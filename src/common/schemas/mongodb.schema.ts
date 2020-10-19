import { SocketSchema } from "src/events/schemas"
import { FlameSensorSchema, TemperatureSchema } from "src/flame/schemas"
import { FLAME_SENSOR_MODEL, TEMPERATURE_MODEL, SOCKET_MODEL } from "../constants"

export const MONGOOSE_MODELS = [
    {
        name: TEMPERATURE_MODEL,
        schema: TemperatureSchema
    },
    {
        name: FLAME_SENSOR_MODEL,
        schema: FlameSensorSchema
    },
    {
        name: SOCKET_MODEL,
        schema: SocketSchema,
    }
]