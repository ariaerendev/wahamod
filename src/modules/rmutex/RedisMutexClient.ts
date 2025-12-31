import Redis from 'ioredis';
import { Logger } from 'pino';

import { RMutexClient } from './types';

// Lua script to unlock a key if the current value matches the provided lockId
const LUA_UNLOCK_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
// Lua script to extend the TTL of a key if the current value matches the provided lockId
const LUA_EXTEND_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("pexpire", KEYS[1], ARGV[2]) else return 0 end`;

/**
 * Implementation of RMutexClient using Redis
 */
export class RedisMutexClient implements RMutexClient {
  constructor(
    private readonly redis: Redis,
    private readonly logger: Logger,
  ) {}

  /**
   * Attempts to acquire a lock on a key
   * @param key The key to lock
   * @param lockId The unique ID for this lock
   * @param ttl Time to live in milliseconds
   * @returns true if the lock was acquired, false otherwise
   */
  async acquireLock(
    key: string,
    lockId: string,
    ttl: number,
  ): Promise<boolean> {
    this.logger.trace({ key, lockId, ttl }, 'Attempting to acquire lock');
    const result = await this.redis.set(key, lockId, 'PX', ttl, 'NX');

    if (result !== 'OK') {
      this.logger.trace({ key }, 'Failed to acquire lock');
      return false;
    }

    this.logger.trace({ key, lockId }, 'Successfully acquired lock');
    return true;
  }

  /**
   * Releases a lock if the current value matches the lockId
   * @param key The key to unlock
   * @param lockId The unique ID for this lock
   * @returns true if the lock was released, false otherwise
   */
  async releaseLock(key: string, lockId: string): Promise<boolean> {
    this.logger.trace({ key, lockId }, 'Unlocking key');

    // Use Lua script to ensure atomicity and ownership verification
    const result = await this.redis.eval(LUA_UNLOCK_SCRIPT, 1, key, lockId);

    const success = result === 1;
    if (!success) {
      this.logger.trace({ key }, 'Failed to unlock key');
    } else {
      this.logger.trace({ key, lockId, success }, 'Unlock result');
    }

    return success;
  }

  /**
   * Extends the TTL of a lock if the current value matches the lockId
   * @param key The key to extend
   * @param lockId The unique ID for this lock
   * @param ttl New TTL in milliseconds
   * @returns true if the TTL was extended, false otherwise
   */
  async extendLock(key: string, lockId: string, ttl: number): Promise<boolean> {
    this.logger.trace({ key, lockId, ttl }, 'Extending TTL for key');

    // Use Lua script to ensure atomicity and ownership verification
    const result = await this.redis.eval(
      LUA_EXTEND_SCRIPT,
      1,
      key,
      lockId,
      ttl.toString(),
    );

    const success = result === 1;
    if (!success) {
      this.logger.trace({ key }, 'Failed to extend TTL for key');
    } else {
      this.logger.trace({ key, lockId, ttl, success }, 'TTL extension result');
    }

    return success;
  }
}
