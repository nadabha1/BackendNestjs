import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFilterService } from './project-filter.service';

describe('ProjectFilterService', () => {
  let service: ProjectFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectFilterService],
    }).compile();

    service = module.get<ProjectFilterService>(ProjectFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
