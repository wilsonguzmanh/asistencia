import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir solicitudes desde el frontend (Next.js / Vercel)
  const allowedOrigin = process.env.FRONTEND_URL;
  app.enableCors({
    origin: allowedOrigin
      ? [allowedOrigin, /\.vercel\.app$/, /^http:\/\/localhost:\d+$/]
      : true,
    credentials: true,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Filtros e Interceptores Globales
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Validación estricta de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Configuración de OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sistema Web de Registro y Control de Asistencia API')
    .setDescription(
      'Documentación interactiva de la API RESTful para el registro de asistencias, autenticación, importación masiva vía Excel, gestión de módulos académicos y auditoría inmutable.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT administrativo',
        in: 'header',
      },
      'jwt-auth',
    )
    .addTag('Auth', 'Autenticación de Administradores y Acceso de Estudiantes')
    .addTag('Modules', 'Ciclo de vida, activación e importación de módulos')
    .addTag('Attendances', 'Marcación de asistencia en día de clase y matriz de control')
    .addTag('Students', 'Consulta y búsqueda de estudiantes del módulo activo')
    .addTag('Audit', 'Consulta de bitácora inmutable de actividades y trazabilidad')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
    customSiteTitle: 'Documentación API - Sistema de Asistencia',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`📑 Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();