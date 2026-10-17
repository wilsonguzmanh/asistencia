import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '../../common/enums';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuthResponseDataDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión como Administrador',
    description:
      'Permite la autenticación de administradores mediante nombre de usuario o correo electrónico y contraseña. Retorna un token JWT válido.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión iniciada exitosamente',
    schema: {
      example: {
        status: 'success',
        message: 'Sesión iniciada exitosamente',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'c1f7a8b2-4d2a-4f5e-9a1b-123456789abc',
            username: 'admin',
            email: 'admin@sistema.com',
            role: 'ADMIN',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error de validación en campos del formulario',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas (usuario o contraseña incorrectos)',
  })
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
  ): Promise<{ message: string; data: AuthResponseDataDto }> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    const data = await this.authService.loginAdmin(dto, ipAddress);

    return {
      message: 'Sesión iniciada exitosamente',
      data,
    };
  }

  @Get('admin/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Obtener perfil del Administrador en sesión',
    description:
      'Valida el token JWT enviado en el header Authorization y retorna los datos del administrador autenticado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil obtenido exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getProfile(@CurrentUser() user: { userId: string }) {
    const profile = await this.authService.getProfile(user.userId);
    return {
      message: 'Perfil de administrador obtenido exitosamente',
      data: profile,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión de Administrador / Usuario (RF-02, US-03)',
    description:
      'Invalida la sesión activa y registra el evento inmutable de cierre de sesión en la bitácora de auditoría.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión cerrada exitosamente',
  })
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    return this.authService.logout(user, ipAddress);
  }
}

