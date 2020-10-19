import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FlameModule } from './flame/flame.module'

@Module({
  imports: [
    FlameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
