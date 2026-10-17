import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../services/jwt.service';
import { UserRole } from '../enums';

@Injectable()
export class StudentJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Encabezado de autorización ausente');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token Bearer requerido');
    }

    const payload = this.jwtService.verify(token);

    if (payload.role !== UserRole.STUDENT) {
      throw new UnauthorizedException('El recurso solicitado requiere rol de Estudiante');
    }

    request.user = payload;
    return true;
  }
}
