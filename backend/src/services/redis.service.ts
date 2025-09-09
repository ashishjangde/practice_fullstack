import { redisClient } from '../db/redis.connection';
import type { SetOptions } from 'redis';

// Default TTL of 2 minutes (in seconds)
const DEFAULT_TTL = 120;

interface CacheOptions {
  ttl?: number;
  condition?: 'NX' | 'XX';
  keepTtl?: boolean;
}

export class RedisService {
  /**
   * Get data from cache
   * @param key - Cache key
   * @returns Parsed data or null if not found
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) as T : null;
    } catch (error) {
      console.error('Redis GET Error:', error);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in seconds (default: 2 minutes)
   */
  static async set(key: string, data: any, options: CacheOptions = {}): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      const { ttl = DEFAULT_TTL, condition, keepTtl } = options;

      const setOptions: SetOptions = {
        expiration: keepTtl ? 'KEEPTTL' : { type: 'EX', value: ttl }
      };

      if (condition) {
        setOptions.condition = condition;
      }

      await redisClient.set(key, serializedData, setOptions);
    } catch (error) {
      console.error('Redis SET Error:', error);
    }
  }

  /**
   * Get data from cache and reset TTL if found
   * @param key - Cache key
   * @returns Parsed data or null if not found
   */
  static async getAndRefresh<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const data = await this.get<T>(key);
      if (data) {
        // If data exists, reset its TTL but keep other options
        await this.set(key, data, {
          ...options,
          ttl: options.ttl || DEFAULT_TTL
        });
      }
      return data;
    } catch (error) {
      console.error('Redis GET and Refresh Error:', error);
      return null;
    }
  }

  /**
   * Delete data from cache
   * @param key - Cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DELETE Error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clearAll(): Promise<void> {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Redis Clear All Error:', error);
    }
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns boolean indicating if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      return await redisClient.exists(key) === 1;
    } catch (error) {
      console.error('Redis EXISTS Error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key - Cache key
   * @returns Remaining TTL in seconds or -1 if key doesn't exist
   */
  static async getTTL(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL Error:', error);
      return -1;
    }
  }
}
