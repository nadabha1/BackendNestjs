import { Module } from '@nestjs/common';
import { ProjectFilterService } from './project-filter.service';
import { ProjectFilterController } from './project-filter.controller';

@Module({
  controllers: [ProjectFilterController],
  providers: [ProjectFilterService],
})
export class ProjectFilterModule {}