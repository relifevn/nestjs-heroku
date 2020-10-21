export interface EnvConfig {
  [key: string]: string
}

export class ConfigService {

  private readonly envConfig: EnvConfig

  constructor() {
    this.envConfig = {
      MONGODB_URL: 'mongodb+srv://re:Relife123@cluster0.at05x.mongodb.net/appdb?retryWrites=true&w=majority',
      PLACE_ID_FLAME_WEB: 'flameWeb',
      PLACE_ID_DROWSINESS_WEB: 'drowsinessWeb',
      PLACE_ID_PI: 'pi',
      PLACE_ID_JETSON_NANO: 'jet',
      GMAIL_USER: 'thcshiepphuoc2020@gmail.com',
      GMAIL_PASSWORD: 'khkt2020',
    }
  }

  get gmailTransport() {
    return {
      host: 'smtp.googlemail.com',
      port: 465,
      secure: true,
      auth: this.gmailAuthentication,
    }
  }

  get gmailAuthentication(): { user: string, pass: string } {
    return {
      user: this.envConfig.GMAIL_USER,
      pass: this.envConfig.GMAIL_PASSWORD,
    }
  }

  get publicKey(): string {
    return this.envConfig.PUBLIC_KEY 
  }

  get mongoURL(): string {
    return this.envConfig.MONGODB_URL
  }

  get placeIdWeb(): string {
    return this.envConfig.PLACE_ID_WEB
  }

  get placeIdPi(): string {
    return this.envConfig.PLACE_ID_PI
  }

  get placeIdJetsonNano(): string {
    return this.envConfig.PLACE_ID_JETSON_NANO
  }
  
}
