import { Test, TestingModule } from '@nestjs/testing';
import { JobsAnnotController } from './controllers/jobs.annot.controller';
import { JobsAnnotService } from './services/jobs.annot.service';

describe('JobsController', () => {
  let controller: JobsAnnotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsAnnotController],
      providers: [JobsAnnotService],
    }).compile();

    controller = module.get<JobsAnnotController>(JobsAnnotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
