import { Controller, Post, Body, Query } from '@nestjs/common';
import { ProjectFilterService } from './project-filter.service';

@Controller('project-filter')
export class ProjectFilterController {
  constructor(private readonly projectFilterService: ProjectFilterService) {}

  @Post('filter')
  async filterProjects(@Body() body: { skills: string; projects: string[] }) {
    const { skills, projects } = body;
    return await this.projectFilterService.filterProjects(skills, projects);
  }
  @Post('filterPer')
  async filterProjects2(@Body('userId') id: string) {
    return await this.projectFilterService.filterProjectsPers(id);
  }

  @Post('filterPer2')
async filterProjects22(@Query('userId') userId: string) {
  console.log('filterProject', userId);
    return await this.projectFilterService.filterProjectsPers(userId);
}

}
