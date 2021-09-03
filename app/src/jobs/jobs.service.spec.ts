import { Test, TestingModule } from '@nestjs/testing';
import { JobsAnnotService } from './services/jobs.annot.service';

describe('JobsService', () => {
  let service: JobsAnnotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsAnnotService],
    }).compile();

    service = module.get<JobsAnnotService>(JobsAnnotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
