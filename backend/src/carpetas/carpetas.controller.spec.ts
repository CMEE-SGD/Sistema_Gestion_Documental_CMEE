import { Test, TestingModule } from '@nestjs/testing';
import { CarpetasController } from './carpetas.controller';
import { CarpetasService } from './carpetas.service';

describe('CarpetasController', () => {
  let controller: CarpetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarpetasController],
      providers: [CarpetasService],
    }).compile();

    controller = module.get<CarpetasController>(CarpetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
