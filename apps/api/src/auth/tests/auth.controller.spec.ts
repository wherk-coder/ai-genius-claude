import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const expectedResult = {
        access_token: 'mock-token',
        user: { 
          id: '1', 
          email: 'test@example.com', 
          name: 'Test User', 
          role: 'USER' as const,
          createdAt: new Date(),
        },
      };

      authService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const expectedResult = {
        access_token: 'mock-token',
        user: { 
          id: '1', 
          email: 'test@example.com', 
          name: 'Test User', 
          role: 'USER' as const,
          createdAt: new Date(),
        },
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const mockRequest = {
        user: { id: '1', email: 'test@example.com', role: 'USER' },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });
});