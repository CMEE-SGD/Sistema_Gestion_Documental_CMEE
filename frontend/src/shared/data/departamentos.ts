// En un archivo como src/data/departamentos.ts
import { Persona } from '../../modules/rrhh/interfaces/persona.interface';

export interface Departamento {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string;
    dependencia_id: number | null;
    activo: boolean;
    orden: number;
    nivel?: number; 
    
    // Aquí definimos la estructura exacta que trae tu Prisma
    puestos_asignados?: {
        // Usamos Pick para tomar solo los campos que viajan desde el backend
        persona: Pick<Persona, 'nombre' | 'apellidos'>; 
        puesto: {
            nombre: string;
        };
    }[]; 
}