import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Módulo controlador o servicio para gestionar la entidad JwtAuthGuard. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}