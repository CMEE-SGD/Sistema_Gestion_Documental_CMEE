import { CustomDecorator, SetMetadata } from '@nestjs/common';

export interface AccessRequirement {
  app: string;
  level: number;
}

// Acepta tanto la forma simple RequireAccess('App', nivel) como una lista de
// alternativas RequireAccess([{ app: 'A', level: 1 }, { app: 'B', level: 2 }])
// para endpoints de solo-lectura que varios módulos comparten como catálogo
// (p. ej. la lista de laboratorios que usa Recepción de Equipos): basta con
// cumplir UNA de las alternativas, no todas. Puede usarse tanto sobre un
// método como sobre toda la clase del controlador (igual que @UseGuards).
export function RequireAccess(app: string, level: number): CustomDecorator;
export function RequireAccess(
  requirements: AccessRequirement[],
): CustomDecorator;
export function RequireAccess(
  appOrRequirements: string | AccessRequirement[],
  level?: number,
): CustomDecorator {
  const requirements: AccessRequirement[] =
    typeof appOrRequirements === 'string'
      ? [{ app: appOrRequirements, level: level as number }]
      : appOrRequirements;
  return SetMetadata('access', requirements);
}
