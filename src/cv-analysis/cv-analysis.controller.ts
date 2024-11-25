import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { CreateCvAnalysisDto } from './dto/create-cv-analysis.dto';
import { UpdateCvAnalysisDto } from './dto/update-cv-analysis.dto';

@Controller('cv-analysis')
export class CvAnalysisController {
  constructor(private readonly cvAnalysisService: CvAnalysisService) {}

  @Post()
  create(@Body() createCvAnalysisDto: CreateCvAnalysisDto) {
    return this.cvAnalysisService.create(createCvAnalysisDto);
  }

  @Get()
  findAll() {
    return this.cvAnalysisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvAnalysisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvAnalysisDto: UpdateCvAnalysisDto) {
    return this.cvAnalysisService.update(+id, updateCvAnalysisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvAnalysisService.remove(+id);
  }
}
