import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('debe estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debe retornar true si el endpoint está decorado con @Public()', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('debe retornar el usuario si no hay error y el usuario existe', () => {
      const mockUser = { userId: '123', role: 'ADMIN' };
      const result = guard.handleRequest(null, mockUser, null);
      expect(result).toBe(mockUser);
    });

    it('debe lanzar UnauthorizedException si no hay usuario', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('debe propagar el error si ocurre uno', () => {
      const error = new Error('JWT expired');
      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });
  });
});
