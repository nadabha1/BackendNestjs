import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { UserModule } from 'src/user/user.module';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: SibApiV3Sdk.TransactionalEmailsApi,
      useFactory: () => {
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
        apiKey.apiKey = process.env.SENDINBLUE_API_KEY; // Définir votre clé API SendinBlue
        return apiInstance;
      },
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
