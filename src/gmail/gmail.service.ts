import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SentMessageInfo, createTransport } from 'nodemailer'
import Mail = require('nodemailer/lib/mailer')
import { GPS_MODEL, SYSTEM_TYPE } from 'src/common/constants'
import { CustomModel, IGPS } from 'src/common/interfaces'
import { CenterService } from 'src/common/services'
import { ConfigService } from 'src/config/config.service'

@Injectable()
export class GmailService {

  transporter: Mail = createTransport(this.configService.gmailTransport)

  constructor(
    @InjectModel(GPS_MODEL)
    private readonly gpsModel: CustomModel<IGPS, {}>,

    private readonly configService: ConfigService,
    private readonly centerService: CenterService,
  ) {
    this.centerService.pushNotification$.subscribe(async date => {
      const gps = await this.gpsModel.findOne({ type: SYSTEM_TYPE.FLAME_DETECTOR })
      const gpsLink = gps
        ? `<a href="http://www.google.com/maps/place/${gps.lat},${gps.lng}">Bấm vào đây để xem vị trí</a>`
        : ''
      await this.sendMailVerify(
        this.configService.receivedFlameDetectorGmail,
        `Cảnh báo có lửa !!`,
        `<p> 
            Hệ thống phát hiện lửa vào lúc ${date.toLocaleString('vi')}
          </p>
          <p>
            ${gpsLink}
          </p>
          `
      )
    })
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
