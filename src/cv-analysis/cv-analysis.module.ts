import { Module } from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { CvAnalysisController } from './cv-analysis.controller';

@Module({
  controllers: [CvAnalysisController],
  providers: [CvAnalysisService],
})
export class CvAnalysisModule {}
