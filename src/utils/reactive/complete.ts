import { Subject } from 'rxjs';

interface WithValues<T> {
  values(): IterableIterator<T>;
}

interface Completable {
  complete(): void;
}

/**
 * Go over collection and complete each item
 * @param collection
 */
export function complete(collection: WithValues<Completable>) {
  for (const item of collection.values()) {
    item.complete();
  }
}
