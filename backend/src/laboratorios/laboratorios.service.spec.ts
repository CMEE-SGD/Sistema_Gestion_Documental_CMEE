import { Test, TestingModule } from '@nestjs/testing';
import { LaboratoriosService } from './laboratorios.service';

describe('LaboratoriosService', () => {
  let service: LaboratoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaboratoriosService],
    }).compile();

    service = module.get<LaboratoriosService>(LaboratoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
