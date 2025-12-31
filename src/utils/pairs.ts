export function* pairs<T, U>(
  iter1: Iterable<T>,
  iter2: Iterable<U>,
): Generator<[T, U]> {
  for (const id1 of iter1) {
    for (const id2 of iter2) {
      yield [id1, id2];
    }
  }
}
