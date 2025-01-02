import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Projet, ProjetSchema } from './entities/projet.entity';
import { UserModule } from 'src/user/user.module';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Projet.name, schema: ProjetSchema }]),
   UserModule
  ],
  controllers: [ProjetController],
  providers: [ProjetService,
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
  exports: [ProjetService,ProjetModule], // Uncomment this line to make the CvService available for other modules

})
export class ProjetModule {}
