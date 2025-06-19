import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';

describe('ThrottlerBehindProxyGuard', () => {
  let guard: ThrottlerBehindProxyGuard;

  const mockReflector = {};
  const mockStorage = {};
  const mockOptions = {
    throttlers: [{ ttl: 60000, limit: 100 }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ThrottlerBehindProxyGuard,
          useFactory: () => new ThrottlerBehindProxyGuard(mockOptions, mockStorage as ThrottlerStorage, mockReflector as Reflector)
        },
      ],
    }).compile();

    guard = module.get<ThrottlerBehindProxyGuard>(ThrottlerBehindProxyGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should return first IP from ips array when available', async () => {
      const req = {
        ips: ['192.168.1.1', '10.0.0.1'],
        ip: '127.0.0.1'
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('192.168.1.1');
    });

    it('should return req.ip when ips array is empty', async () => {
      const req = {
        ips: [],
        ip: '127.0.0.1'
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('127.0.0.1');
    });

    it('should return req.ip when ips is not available', async () => {
      const req = {
        ip: '127.0.0.1'
      };

      const result = await guard['getTracker'](req);
      expect(result).toBe('127.0.0.1');
    });
  });
});