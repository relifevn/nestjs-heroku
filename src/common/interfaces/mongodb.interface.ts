import { ObjectId } from 'mongodb'
import { Model, Document } from 'mongoose'

export interface CustomDocument extends Document {
    _id: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface CustomModel<T extends Document, QueryHelpers = {}> extends Model<T, QueryHelpers> {
}