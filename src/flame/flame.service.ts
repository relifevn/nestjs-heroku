import { Injectable } from '@nestjs/common'

@Injectable()
export class FlameService {
  getHello(): string {
    return 'Hello World!'
  }
}
