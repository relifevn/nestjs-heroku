import { SYSTEM_TYPE } from "../constants"
import { CustomDocument } from "./mongodb.interface";

export interface IGPS extends CustomDocument {
    lat: number
    lng: number
    type: SYSTEM_TYPE
}