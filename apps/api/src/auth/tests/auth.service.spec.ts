import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'USER' as const,
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null,
    subscription: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        emailVerified: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        profile: null,
        subscription: null,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should return access token and user data when credentials are valid', async () => {
      const userWithoutPassword = { 
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user-1',
        role: 'USER',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    it('should create user and return access token', async () => {
      const createdUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER' as const,
        createdAt: new Date(),
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      usersService.create.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: createdUser,
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user-1',
        role: 'USER',
      });
    });
  });
});