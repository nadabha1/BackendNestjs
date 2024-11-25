import { Test, TestingModule } from '@nestjs/testing';
import { CvAnalysisService } from './cv-analysis.service';

describe('CvAnalysisService', () => {
  let service: CvAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvAnalysisService],
    }).compile();

    service = module.get<CvAnalysisService>(CvAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
