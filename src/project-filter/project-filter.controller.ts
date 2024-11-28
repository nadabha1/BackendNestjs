import { Controller, Post, Body } from '@nestjs/common';
import { ProjectFilterService } from './project-filter.service';

@Controller('project-filter')
export class ProjectFilterController {
  constructor(private readonly projectFilterService: ProjectFilterService) {}

  @Post('filter')
  async filterProjects(@Body() body: { skills: string; projects: string[] }) {
    const { skills, projects } = body;
    return await this.projectFilterService.filterProjects(skills, projects);
  }
}