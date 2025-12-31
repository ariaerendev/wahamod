import * as crypto from 'crypto';

export class Pool<Client> {
  private instances: Map<any, Client> = new Map();

  constructor(private factory: () => Client) {}

  protected key(name: string): any {
    return name;
  }

  get(name: string): Client {
    const key = this.key(name);
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }
    const client = this.factory();
    this.instances.set(key, client);
    return client;
  }
}

export class SizedPool<Client> extends Pool<Client> {
  constructor(
    protected size: number,
    factory: () => Client,
  ) {
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error('size must be a positive integer');
    }

    super(factory);
  }

  protected key(name: string): any {
    const hash = crypto.createHash('sha256').update(name).digest();
    const num = hash.readUInt32BE(0);
    const bucket = num % this.size;
    return Number(bucket);
  }
}
