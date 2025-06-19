import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('test@example.com', 'password');

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});