import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('US-01: Autenticación de Administrador (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/admin/login (BDD)', () => {
    it('Escenario: Login exitoso de administrador con correo sembrado (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: 'admin@sistema.com',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Sesión iniciada exitosamente');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        username: 'admin',
        email: 'admin@sistema.com',
        role: 'ADMIN',
      });
      expect(typeof response.body.data.token).toBe('string');
    });

    it('Escenario: Login exitoso con username (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: 'admin',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
    });

    it('Escenario: Rechazo por contraseña equivocada (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: 'admin@sistema.com',
          password: 'incorrecta',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(response.body).toHaveProperty('message', 'Credenciales de acceso incorrectas');
    });

    it('Escenario: Rechazo por identificador inexistente (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: 'noexiste@sistema.com',
          password: 'admin123',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('Escenario: Validación de campos obligatorios (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: '',
          password: '123',
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/auth/admin/me (Protección con JWT y Roles)', () => {
    let adminToken: string;

    beforeAll(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/login')
        .send({
          identifier: 'admin@sistema.com',
          password: 'admin123',
        });
      adminToken = loginRes.body.data.token;
    });

    it('debe retornar perfil del administrador con token JWT válido (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/admin/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        username: 'admin',
        email: 'admin@sistema.com',
        role: 'ADMIN',
      });
    });

    it('debe rechazar solicitud sin token Bearer (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/admin/me')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('debe rechazar solicitud con token inválido (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/admin/me')
        .set('Authorization', 'Bearer token_invalido_123')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });
});
