import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';

@Controller('projet')
export class ProjetController {
  constructor(private readonly projetService: ProjetService) {}

  @Post('add')
  create(@Body() createProjetDto: CreateProjetDto) {
    console.log(createProjetDto);
    return this.projetService.create(createProjetDto);
  }

  @Get('get')
  findAll() {
    return this.projetService.findAll();
  }
  @Post('user') // Route to fetch projects by userId
  async getByUserId(@Body('userId') userId: string) {
    console.log("dkhall ll back"+userId);
    return this.projetService.findByUserId(userId);
    
  }
  @Post('user2') // Route to fetch projects by userId
  async getByUserId2(@Query('userId') userId: string) {
    console.log("dkhall ll back"+userId);
    return this.projetService.findByUserId(userId);
    
  }


  @Get('getAll')
  GetByIDUser(@Body('id') id: string) {
    return this.projetService.findAllByUserId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projetService.findOne(id);
  }
 

  @Patch('update')
  update(@Body('id') id: string, @Body() updateProjetDto: UpdateProjetDto) {
    return this.projetService.update(id, updateProjetDto);
  }

  @Delete('delete')
  remove(@Body('id') id: string) {
    return this.projetService.remove(id);
  }
  
}
