import { Injectable } from '@nestjs/common';
import { CreateCvAnalysisDto } from './dto/create-cv-analysis.dto';
import { UpdateCvAnalysisDto } from './dto/update-cv-analysis.dto';

@Injectable()
export class CvAnalysisService {
  create(createCvAnalysisDto: CreateCvAnalysisDto) {
    return 'This action adds a new cvAnalysis';
  }

  findAll() {
    return `This action returns all cvAnalysis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cvAnalysis`;
  }

  update(id: number, updateCvAnalysisDto: UpdateCvAnalysisDto) {
    return `This action updates a #${id} cvAnalysis`;
  }

  remove(id: number) {
    return `This action removes a #${id} cvAnalysis`;
  }
}
