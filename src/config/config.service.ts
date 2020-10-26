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
    }
  }

  get homeConfig() {
    return {
      description: 'NestJS Heroku Server',
      title: 'NestJS Heroku Server',
      imageUrl: 'https://khkt-thcs-hiep-phuoc-server.herokuapp.com/images/1.jpg',
      homeUrl: `https://khkt-thcs-hiep-phuoc-server.herokuapp.com/`,
      iconUrl: `https://khkt-thcs-hiep-phuoc-server.herokuapp.com/icons/logo.png`,
      backgroundUrl: `https://khkt-thcs-hiep-phuoc-server.herokuapp.com/images/1.jpg`,
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
