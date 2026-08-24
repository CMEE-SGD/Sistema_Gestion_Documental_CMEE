import { Test, TestingModule } from '@nestjs/testing';
import { CircuitosController } from './circuitos.controller';
import { CircuitosService } from './circuitos.service';

describe('CircuitosController', () => {
  let controller: CircuitosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CircuitosController],
      providers: [CircuitosService],
    }).compile();

    controller = module.get<CircuitosController>(CircuitosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
