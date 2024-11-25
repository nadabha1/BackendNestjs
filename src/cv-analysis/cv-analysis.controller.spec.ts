import { Test, TestingModule } from '@nestjs/testing';
import { CvAnalysisController } from './cv-analysis.controller';
import { CvAnalysisService } from './cv-analysis.service';

describe('CvAnalysisController', () => {
  let controller: CvAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvAnalysisController],
      providers: [CvAnalysisService],
    }).compile();

    controller = module.get<CvAnalysisController>(CvAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
