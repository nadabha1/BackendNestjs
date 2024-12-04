import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ProjectFilterModule } from 'src/project-filter/project-filter.module';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.createAvecVerification(createApplicationDto);
  }

  @Get()
  findAll() {
    return this.applicationService.findAll();
  }
  @Get('project/:projectId')
  async getUsersByProjectId(@Param('projectId') projectId: string) {
    return this.applicationService.getUsersByProjectId(projectId);
  }
  @Get('freelancer/:freelancerId')
  async getUsersByfreelancerId(@Param('freelancerId') freelancerId: string) {
    return this.applicationService.getProjectFromApplication(freelancerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationService.remove(id);
  }

  @Patch(':id/status')
  async updateApplicationStatus(
    @Param('projectId') projectId: string,
    @Body('status') status: string
  ) {
    // Vérifier si le statut est valide
    const validStatuses = ['Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    // Mettre à jour le statut via le service
    return this.applicationService.updateStatus(projectId, status);
  }
  @Post('status')
  async getApplicationStatus(
    @Body('freelancerId') freelancerId: string,
    @Body('projectId') projectId: string,
  ): Promise<{ status: string }> {
    console.log('Received freelancerId:', freelancerId);
    console.log('Received projectId:', projectId);
  
    if (!freelancerId || !projectId) {
      throw new Error('Both freelancerId and projectId are required');
    }
  
    const status = await this.applicationService.getApplicationStatus(freelancerId, projectId);
    return { status };
  }
  
  
  @Post('accept')
  async acceptApplication(
    @Query('freelancerId') freelancerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.applicationService.acceptApplication(freelancerId, projectId);
  }

  // Route pour rejeter une candidature
  @Post('reject')
  async rejectApplication(
    @Query('freelancerId') freelancerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.applicationService.rejectApplication(freelancerId, projectId);
  }
}
