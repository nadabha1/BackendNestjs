import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { MongooseModule } from '@nestjs/mongoose';  // Assurez-vous d'importer MongooseModule
import { Application, ApplicationSchema } from './entities/application.entity';  // Importer le modèle Application
import { Projet, ProjetSchema } from 'src/projet/entities/projet.entity';  // Importer le modèle Project
import { User, UserSchema } from 'src/user/entities/user.entity';;  // Importer le modèle User
import { NotificationModule } from 'src/notification/notification.module'; // Import the NotificationModule
import { UserModule } from 'src/user/user.module';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Module({
  imports: [
        UserModule,
    // Enregistrement des modèles dans MongooseModule
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: User.name, schema: UserSchema },
      { name: Projet.name, schema: ProjetSchema },
    ]),
    NotificationModule, // Add the NotificationModule here
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService,
    {
          provide: SibApiV3Sdk.TransactionalEmailsApi,
          useFactory: () => {
            const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
            apiKey.apiKey = process.env.SENDINBLUE_API_KEY; // Définir votre clé API SendinBlue
            return apiInstance;
          },
        }
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}