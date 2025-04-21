import { Test, TestingModule } from '@nestjs/testing';
import { DrainerService } from './drainer.service';

describe('DrainerService', () => {
  let service: DrainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrainerService],
    }).compile();

    service = module.get<DrainerService>(DrainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
