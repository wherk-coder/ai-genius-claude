import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from JWT payload', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      });
    });
  });
});