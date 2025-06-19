import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  default?: {
    limit: number;
    ttl: number;
  };
  short?: {
    limit: number;
    ttl: number;
  };
  long?: {
    limit: number;
    ttl: number;
  };
}

export const Throttle = (options: ThrottleOptions) => SetMetadata(THROTTLE_KEY, options);

// Predefined throttle configurations
export const ThrottleConfig = {
  // Strict throttling for auth endpoints
  AUTH: {
    default: { limit: 5, ttl: 60000 }, // 5 requests per minute
    short: { limit: 3, ttl: 60000 },   // 3 requests per minute for sensitive operations
  },
  
  // Standard throttling for general API
  STANDARD: {
    default: { limit: 100, ttl: 60000 }, // 100 requests per minute
    short: { limit: 20, ttl: 60000 },    // 20 requests per minute for heavy operations
  },
  
  // Relaxed throttling for public endpoints
  PUBLIC: {
    default: { limit: 200, ttl: 60000 }, // 200 requests per minute
  },
};