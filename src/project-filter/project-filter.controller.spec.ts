import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFilterController } from './project-filter.controller';

describe('ProjectFilterController', () => {
  let controller: ProjectFilterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectFilterController],
    }).compile();

    controller = module.get<ProjectFilterController>(ProjectFilterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
