import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { StudentAuthService } from './student-auth.service';
import { StudentLoginDto } from './dto/student-login.dto';

@ApiTags('Auth')
@Controller('auth/student')
export class StudentAuthController {
  constructor(private readonly studentAuthService: StudentAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión de estudiante en el módulo activo',
    description:
      'Permite el acceso del estudiante utilizando únicamente su correo electrónico o su número de registro, sin contraseña (RF-01, US-02).',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada con éxito. Retorna token JWT y datos del estudiante.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no registrado en el módulo académico activo actual.',
  })
  async login(@Body() dto: StudentLoginDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress ?? '127.0.0.1';

    return this.studentAuthService.login(dto, ipAddress);
  }
}
