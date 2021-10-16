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
			user: 'thcs.hiep.phuoc.khkt.2021@gmail.com', // SENDER_EMAIL_ADDRESS,
			clientId:
				'238640532605-37t7dfl4h9f7fsocbts37ji090sm1d2n.apps.googleusercontent.com', // MAILING_SERVICE_CLIENT_ID
			clientSecret: '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', //'MAILING_SERVICE_CLIENT_SECRET'
			refreshToken:
				'1//04SOjGbNIGeO0CgYIARAAGAQSNwF-L9IrkE8QV4eATsJazRN22ORlUDqWi-j2d2wdX5-gkAj27oR_SWkUgiZH_J_ot9SkiQS7IwA', //
			accessToken:
				'ya29.a0ARrdaM89OaYmr1brKVCVa2WngG8EqwEqYpKEPA4nm4DYIs3dq1-oDiGLSVus2uSela4oeI6uv2f39TglrEH88SHbWHKgyutwvI288wiG799g4ZiLCPnMZ--f74HANRBLAabM5BrZtJdtSVn8vX0lrItkq_H4', // ACCESS_SERVICE_TOKEN
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
