import { Test, TestingModule } from '@nestjs/testing';
import { CircuitosService } from './circuitos.service';

describe('CircuitosService', () => {
  let service: CircuitosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitosService],
    }).compile();

    service = module.get<CircuitosService>(CircuitosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
