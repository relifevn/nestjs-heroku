import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as express from 'express'
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger'
import { join } from 'path'
import * as helmet from 'helmet'
import { ExpressAdapter } from '@nestjs/platform-express/adapters/express-adapter'
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface'

async function bootstrap() {

  const server = express()
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  )

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('hbs')

  const options = new DocumentBuilder()
    .setTitle('NestJS Heroku Server')
    .addBearerAuth()
    .setDescription('The Danceaway APIs documentation')
    .setVersion('⭐⚡☀✨ 1.0.0 ⭐⚡☀✨')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)

  app.enableCors() // protection
  app.use(helmet())

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`[INFO] Server is listening on port ${port}`)

}
bootstrap()
