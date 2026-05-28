// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET || 'clave_secreta_desarrollo', // Usa variables de entorno en prod
        });
    }

    async validate(payload: any) {
        // Al usar la Opción 2, el token solo tiene la identidad.
        // Lo que retornemos aquí se inyectará automáticamente en request.user
        return { id: payload.sub }; 
    }
}