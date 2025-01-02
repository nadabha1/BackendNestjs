import { forwardRef, Module } from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { CvAnalysisController } from './cv-analysis.controller';
import { UserModule } from 'src/user/user.module';
import { ProjetModule } from 'src/projet/projet.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  controllers: [CvAnalysisController],
  providers: [CvAnalysisService],
  imports: [ProjetModule,UserModule,RolesModule,forwardRef(() => UserModule)], // Import the module providing ProjetService

})
export class CvAnalysisModule {}
