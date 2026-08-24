import { Test, TestingModule } from '@nestjs/testing';
import { CarpetasService } from './carpetas.service';

describe('CarpetasService', () => {
  let service: CarpetasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarpetasService],
    }).compile();

    service = module.get<CarpetasService>(CarpetasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
