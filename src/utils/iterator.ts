export function* emptyIterator() {}

export function* mapIterator<T1, T2>(
  iterable: Iterable<T1>,
  callback: (t: T1) => T2,
): Iterable<T2> {
  for (const result of iterable) {
    yield callback(result);
  }
}

export function* concatIterator<T>(...iterators: Iterable<T>[]): Iterable<T> {
  for (const iterator of iterators) {
    for (const result of iterator) {
      yield result as T;
    }
  }
}
