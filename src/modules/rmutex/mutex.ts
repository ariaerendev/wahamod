import * as crypto from 'crypto';

import { RMutex, RMutexClient, RMutexLocked } from './types';
/**
 * Implementation of a distributed mutex builder for multiple keys
 */
export class RMutexImpl implements RMutex {
  private keys: string[] = [];

  constructor(
    private readonly client: RMutexClient,
    key: string,
    private readonly ttl: number,
  ) {
    this.keys.push(key);
  }

  /**
   * Generates a combined key from all the individual keys
   * @private
   */
  private key(): string {
    return this.keys.join('-');
  }

  /**
   * Add a key to the mutex
   * @param key The key to add
   * @returns this instance for chaining
   */
  withKey(key: string): RMutex {
    this.keys.push(key);
    return this;
  }

  /**
   * Acquires a mutex for the combined key
   * @returns A RMutexLocked instance if the mutex was acquired, null otherwise
   */
  async lock(): Promise<RMutexLocked | null> {
    const key = this.key();

    // Generate a single lockId
    const lockId = crypto.randomUUID();

    // Try to lock the combined key
    const result = await this.client.acquireLock(key, lockId, this.ttl);

    if (!result) {
      return null;
    }

    return new RMutexLockedImpl(this.client, key, lockId, this.ttl);
  }
}

/**
 * Implementation of a locked distributed mutex
 */
export class RMutexLockedImpl implements RMutexLocked {
  constructor(
    private readonly client: RMutexClient,
    private readonly key: string,
    private readonly lockId: string,
    private readonly ttl: number,
  ) {}

  /**
   * Releases the mutex on the key
   * @returns true if the mutex was released successfully
   */
  async release(): Promise<boolean> {
    return this.client.releaseLock(this.key, this.lockId);
  }

  /**
   * Extends the TTL for the key
   * @param ttl New TTL in milliseconds (optional, uses the original TTL if not provided)
   * @returns true if TTL was extended successfully
   */
  async extend(ttl?: number): Promise<boolean> {
    const newTtl = ttl !== undefined ? ttl : this.ttl;
    return this.client.extendLock(this.key, this.lockId, newTtl);
  }
}
