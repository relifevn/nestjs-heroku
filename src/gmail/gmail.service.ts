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
	transporter: Mail = createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			type: 'OAuth2',
			user: 'thcshiepphuoc2020@gmail.com', // SENDER_EMAIL_ADDRESS,
			clientId:
				'806917942860-h08emp26re674449bhc6l350p05s21h1.apps.googleusercontent.com', // MAILING_SERVICE_CLIENT_ID
			clientSecret: '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', //'MAILING_SERVICE_CLIENT_SECRET'
			refreshToken:
				'1//04WZ51TCvy8XmCgYIARAAGAQSNwF-L9Ir_asvdfwYGzTuvcO_qPRNrdwDRNqicgAqi6twEnkSARNsvhydRKBajze9dmZhPwnGIco', //
			accessToken:
				'ya29.a0ARrdaM-pYh47Gb-UdmKQDH5rqLxfxTUkkW4a9zj4-ZTQfxAakxxNTai1TGkJgVjaYg3qM60ZpKPrapmVTbBZ4PRnEUw5A6O4bvJZJqcfw-1WUPRRDwsUQDvpAox2QExLXsau489BtsUCZ9BKNIc6-EpNL5Nr', // ACCESS_SERVICE_TOKEN
		},
	})

	constructor(
		@InjectModel(GPS_MODEL)
		private readonly gpsModel: CustomModel<IGPS, {}>,

		private readonly configService: ConfigService,
		private readonly centerService: CenterService,
	) {
		this.centerService.pushNotification$.subscribe(async date => {
			const gps = await this.gpsModel.findOne({
				type: SYSTEM_TYPE.FLAME_DETECTOR,
			})
			const gpsLink = gps
				? `<a href="http://www.google.com/maps/place/${gps.lat},${gps.lng}">Bấm vào đây để xem vị trí</a>`
				: ''
			await this.sendMail(
				this.configService.receivedFlameDetectorGmail,
				`Cảnh báo có lửa !!`,
				`<p> 
            Hệ thống phát hiện lửa vào lúc ${this.convertToVNDateTime(date)}
          </p>
          <p>
            ${gpsLink}
          </p>
          `,
			)
		})

		this.centerService.pushNotificationDrowsinessDetector$.subscribe(
			async date => {
				const gps = await this.gpsModel.findOne({
					type: SYSTEM_TYPE.DROWSINESS_DETECTOR,
				})
				const gpsLink = gps
					? `<a href="http://www.google.com/maps/place/${gps.lat},${gps.lng}">Bấm vào đây để xem vị trí</a>`
					: ''
				await this.sendMail(
					this.configService.receivedDrowsinessDetectorGmail,
					`Phát hiện tài xế đang buồn ngủ!!`,
					`<p> 
            Hệ thống phát hiện tài xế đang buồn ngủ vào lúc ${this.convertToVNDateTime(
							date,
						)}
          </p>
          <p>
            ${gpsLink}
          </p>
          `,
				)
			},
		)
	}

	convertToVNDateTime(date): string {
		return new Date(date.getTime() + 7 * 3600 * 1000).toISOString()
	}

	async sendMail(
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
