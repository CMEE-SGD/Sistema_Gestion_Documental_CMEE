// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/** Módulo controlador o servicio para gestionar la entidad JwtStrategy. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET || 'clave_secreta_desarrollo', // Usa variables de entorno en prod
        });
    }

    /**
     * Ejecuta la operación de negocio validate.
     * @param payload - Datos o identificador requerido (any)
     * @returns Promise<{ id: any; isGod: any; }>
     */
    async validate(payload: any) {
        // Retornamos el ID y la bandera isGod (si existe en el payload del token)
        return { 
            id: payload.sub,
            isGod: payload.isGod || false // Pasamos la bandera al request.user
        }; 
    }
}