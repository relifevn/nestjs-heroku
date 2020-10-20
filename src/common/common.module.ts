import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MONGOOSE_MODELS } from 'src/common/schemas'
import { CenterService } from './services'

@Module({
    imports: [
        MongooseModule.forFeature(MONGOOSE_MODELS),
    ],
    controllers: [
    ],
    providers: [
        CenterService,
    ],
    exports: [
        CenterService,
    ],
})
export class CommonModule { }
