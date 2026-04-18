import { Test, TestingModule } from '@nestjs/testing';
import { ChallanController } from './challan.controller';

describe('ChallanController', () => {
  let controller: ChallanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallanController],
    }).compile();

    controller = module.get<ChallanController>(ChallanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
