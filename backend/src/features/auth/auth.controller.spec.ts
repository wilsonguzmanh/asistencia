import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../../common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockAuthResponse = {
    token: 'jwt-token-xyz',
    user: {
      id: 'uuid-1',
      username: 'admin',
      email: 'admin@sistema.com',
      role: UserRole.ADMIN,
    },
  };

  beforeEach(async () => {
    authService = {
      loginAdmin: jest.fn().mockResolvedValue(mockAuthResponse),
      getProfile: jest.fn().mockResolvedValue(mockAuthResponse.user),
      logout: jest.fn().mockResolvedValue({ message: 'Sesión cerrada exitosamente' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('POST admin/login', () => {
    it('debe llamar a authService.loginAdmin y retornar mensaje y datos', async () => {
      const mockReq: any = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      };

      const result = await controller.loginAdmin(
        {
          identifier: 'admin@sistema.com',
          password: 'admin123',
        },
        mockReq,
      );

      expect(authService.loginAdmin).toHaveBeenCalledWith(
        {
          identifier: 'admin@sistema.com',
          password: 'admin123',
        },
        '127.0.0.1',
      );
      expect(result).toEqual({
        message: 'Sesión iniciada exitosamente',
        data: mockAuthResponse,
      });
    });
  });

  describe('GET admin/me', () => {
    it('debe retornar el perfil del usuario autenticado', async () => {
      const result = await controller.getProfile({ userId: 'uuid-1' });

      expect(authService.getProfile).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual({
        message: 'Perfil de administrador obtenido exitosamente',
        data: mockAuthResponse.user,
      });
    });
  });

  describe('POST auth/logout', () => {
    it('debe llamar a authService.logout y retornar mensaje de confirmación', async () => {
      const mockReq: any = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      };

      const result = await controller.logout({ userId: 'uuid-1' }, mockReq);

      expect(authService.logout).toHaveBeenCalledWith(
        { userId: 'uuid-1' },
        '127.0.0.1',
      );
      expect(result).toEqual({
        message: 'Sesión cerrada exitosamente',
      });
    });
  });
});

