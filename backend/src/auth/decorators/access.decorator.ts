import { SetMetadata } from '@nestjs/common';

export const RequireAccess = (app: string, level: number) =>
  SetMetadata('access', { app, level });
