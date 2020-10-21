import { Injectable } from '@nestjs/common'
import { SentMessageInfo, createTransport } from 'nodemailer'
import Mail = require('nodemailer/lib/mailer')
import { ConfigService } from 'src/config/config.service'

@Injectable()
export class GmailService {

  transporter: Mail = createTransport(this.configService.gmailTransport)

  constructor(
    private readonly configService: ConfigService,
  ) {
  }

  async sendMailVerify(
    email: string,
    subject: string,
    content: string,
  ): Promise<SentMessageInfo> {

    return this.transporter.sendMail({
      from: `IOTS <${this.configService.gmailAuthentication.user}>`,
      to: email,
      subject,
      html: content,
    })
  }

}
