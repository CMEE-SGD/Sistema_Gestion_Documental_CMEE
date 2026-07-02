export interface HydratedUser {
  id: number;
  isGod?: boolean;
  persona_id?: number;
  puesto?: string;
  laboratorio_id?: number;
}

export function isRestrictedToLab(puesto: string): boolean {
  return (
    puesto.includes('Observador Técnico') ||
    puesto.includes('RET') ||
    puesto.includes('PEC')
  );
}
