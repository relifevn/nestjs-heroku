import { SocketSchema } from "src/events/schemas"
import { FlameSensorSchema, TemperatureSchema } from "src/flame/schemas"
import { FLAME_SENSOR_MODEL, TEMPERATURE_MODEL, SOCKET_MODEL, GPS_MODEL } from "../constants"
import { GPSSchema } from "./gps.schema"

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
    },
    {
        name: GPS_MODEL,
        schema: GPSSchema,
    },
]