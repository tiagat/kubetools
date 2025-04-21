import { Test, TestingModule } from '@nestjs/testing';
import { DrainService } from './drain.service';

describe('DrainService', () => {
  let service: DrainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrainService],
    }).compile();

    service = module.get<DrainService>(DrainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
