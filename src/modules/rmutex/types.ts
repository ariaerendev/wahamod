/**
 * Interface for a client that interacts with Redis for mutex operations
 */
export interface RMutexClient {
  /**
   * Attempts to acquire a lock on a key
   * @param key The key to lock
   * @param lockId The unique ID for this lock
   * @param ttl Time to live in milliseconds
   * @returns true if the lock was acquired, false otherwise
   */
  acquireLock(key: string, lockId: string, ttl: number): Promise<boolean>;

  /**
   * Releases a lock if the current value matches the lockId
   * @param key The key to unlock
   * @param lockId The unique ID for this lock
   * @returns true if the lock was released, false otherwise
   */
  releaseLock(key: string, lockId: string): Promise<boolean>;

  /**
   * Extends the TTL of a lock if the current value matches the lockId
   * @param key The key to extend
   * @param lockId The unique ID for this lock
   * @param ttl New TTL in milliseconds
   * @returns true if the TTL was extended, false otherwise
   */
  extendLock(key: string, lockId: string, ttl: number): Promise<boolean>;
}

/**
 * Interface for a locked distributed mutex
 */
export interface RMutexLocked {
  /**
   * Releases the mutex
   * @returns true if the mutex was released successfully
   */
  release(): Promise<boolean>;

  /**
   * Extends the TTL for the mutex
   * @param ttl New TTL in milliseconds (optional, uses the original TTL if not provided)
   * @returns true if TTL was extended successfully
   */
  extend(ttl?: number): Promise<boolean>;
}

/**
 * Interface for a distributed mutex builder
 */
export interface RMutex {
  /**
   * Add a key to the mutex
   * @param key The key to add
   * @returns this instance for chaining
   */
  withKey(key: string): RMutex;

  /**
   * Acquires a mutex for the combined key
   * @returns A RMutexLocked instance if the mutex was acquired, null otherwise
   */
  lock(): Promise<RMutexLocked | null>;
}
