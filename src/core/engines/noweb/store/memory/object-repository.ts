export class ObjectRepository<T extends any> {
  readonly entityMap: Map<string, T>;

  constructor(entities: Record<string, T> = {}) {
    this.entityMap = new Map(Object.entries(entities));
  }

  findById(id: string) {
    return this.entityMap.get(id);
  }

  findAll() {
    return Array.from(this.entityMap.values());
  }

  upsertById(id: string, entity: T) {
    // @ts-ignore
    return this.entityMap.set(id, { ...entity });
  }

  deleteById(id: string) {
    return this.entityMap.delete(id);
  }

  count() {
    return this.entityMap.size;
  }

  toJSON() {
    return this.findAll();
  }
}
