import { forwardRef, Module } from '@nestjs/common';
import { ProjectFilterService } from './project-filter.service';
import { ProjectFilterController } from './project-filter.controller';
import { UserService } from 'src/user/user.service';
import { ProjetModule } from 'src/projet/projet.module';
import { UserModule } from 'src/user/user.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [ProjetModule,UserModule,RolesModule,forwardRef(() => UserModule)], // Import the module providing ProjetService
  controllers: [ProjectFilterController],
  providers: [ProjectFilterService],
  exports: [ProjectFilterService],
})
export class ProjectFilterModule {}
