import { Test, TestingModule } from '@nestjs/testing';
import { ChallanService } from './challan.service';

describe('ChallanService', () => {
  let service: ChallanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChallanService],
    }).compile();

    service = module.get<ChallanService>(ChallanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
