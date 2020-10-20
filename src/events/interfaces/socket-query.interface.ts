import { ParsedQuery } from "query-string"

export interface ISocketQuery extends ParsedQuery {
  deviceType: string
  EIO: string
  t: string
  transport: string
}