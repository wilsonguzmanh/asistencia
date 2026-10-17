import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AdminUser } from './entities/admin-user.entity';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { UserRole } from '../../common/enums';

describe('AuthService', () => {
  let service: AuthService;
  let adminRepo: any;
  let activityLogRepo: any;
  let jwtService: any;

  const mockAdminUser = {
    id: 'c1f7a8b2-4d2a-4f5e-9a1b-123456789abc',
    username: 'admin',
    email: 'admin@sistema.com',
    passwordHash: '$2b$10$hashedpassword',
    role: UserRole.ADMIN,
    isActive: true,
  };

  beforeEach(async () => {
    adminRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    activityLogRepo = {
      create: jest.fn().mockImplementation((val) => val),
      save: jest.fn().mockResolvedValue({}),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: adminRepo,
        },
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: activityLogRepo,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('loginAdmin', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas y retornar JWT', async () => {
      const qb: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAdminUser),
      };
      adminRepo.createQueryBuilder.mockReturnValue(qb);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.loginAdmin({
        identifier: 'admin@sistema.com',
        password: 'correctpassword',
      });

      expect(result).toHaveProperty('token', 'mocked-jwt-token');
      expect(result.user).toEqual({
        id: mockAdminUser.id,
        username: mockAdminUser.username,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockAdminUser.id,
        username: mockAdminUser.username,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });
    });

    it('debe lanzar InvalidCredentialsException si el usuario no existe', async () => {
      const qb: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      adminRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.loginAdmin({
          identifier: 'inexistente@sistema.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('debe lanzar InvalidCredentialsException si el usuario está inactivo', async () => {
      const qb: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockAdminUser, isActive: false }),
      };
      adminRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.loginAdmin({
          identifier: 'admin@sistema.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('debe lanzar InvalidCredentialsException si la contraseña no coincide', async () => {
      const qb: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAdminUser),
      };
      adminRepo.createQueryBuilder.mockReturnValue(qb);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.loginAdmin({
          identifier: 'admin@sistema.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('debe lanzar InvalidCredentialsException si el rol no es ADMIN', async () => {
      const qb: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          ...mockAdminUser,
          role: UserRole.STUDENT,
        }),
      };
      adminRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.loginAdmin({
          identifier: 'admin@sistema.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('getProfile', () => {
    it('debe retornar el perfil del admin activo', async () => {
      adminRepo.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.getProfile(mockAdminUser.id);
      expect(result).toEqual({
        id: mockAdminUser.id,
        username: mockAdminUser.username,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });
    });

    it('debe lanzar InvalidCredentialsException si no se encuentra el usuario', async () => {
      adminRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('logout', () => {
    it('debe registrar el evento inmutable de cierre de sesión en auditoría', async () => {
      const mockUser = {
        userId: 'uuid-1',
        username: 'admin',
        role: UserRole.ADMIN,
      };

      const result = await service.logout(mockUser, '192.168.1.100');

      expect(activityLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'uuid-1',
          userIdentifier: 'admin',
          userRole: UserRole.ADMIN,
          ipAddress: '192.168.1.100',
        }),
      );
      expect(activityLogRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
    });

    it('debe retornar mensaje de éxito incluso si no se provee usuario autenticado', async () => {
      const result = await service.logout(undefined);
      expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
    });
  });
});

