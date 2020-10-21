import { Module } from '@nestjs/common'
import { GmailService } from './gmail.service'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from 'src/config/config.module'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { MailerModule } from '@nestjs-modules/mailer'
import { CommonModule } from 'src/common/common.module'

@Module({
  imports: [
    MailerModule,
    MongooseModule.forFeature(MONGOOSE_MODELS),
    ConfigModule,
    CommonModule,
  ],
  providers: [
    GmailService,
  ],
  exports: [
    GmailService,
  ]
})
export class GmailModule { }
