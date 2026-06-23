import { Test, TestingModule } from '@nestjs/testing';
import { LaboratoriosController } from './laboratorios.controller';
import { LaboratoriosService } from './laboratorios.service';

describe('LaboratoriosController', () => {
  let controller: LaboratoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaboratoriosController],
      providers: [LaboratoriosService],
    }).compile();

    controller = module.get<LaboratoriosController>(LaboratoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
