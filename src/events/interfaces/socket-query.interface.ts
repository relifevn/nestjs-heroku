import { ParsedQuery } from "query-string"

export interface ISocketQuery extends ParsedQuery {
  placeId: string
  EIO: string
  t: string
  transport: string
}