import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Projet, ProjetSchema } from './entities/projet.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Projet.name, schema: ProjetSchema }]),
   
  ],
  controllers: [ProjetController],
  providers: [ProjetService],
  exports: [ProjetService,ProjetModule], // Uncomment this line to make the CvService available for other modules

})
export class ProjetModule {}
