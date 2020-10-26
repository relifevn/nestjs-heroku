import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FlameModule } from './flame/flame.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from './config/config.module'
import { ConfigService } from './config/config.service'
import { EventsModule } from './events/events.module'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.mongoURL,
        options: {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
          reconnectTries: 500,
          reconnectInterval: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    FlameModule,
    EventsModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
