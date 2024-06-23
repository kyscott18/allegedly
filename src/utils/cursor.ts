export type Cursor = Iterable<string> & {
  string: string;
  position: number;
  remaining: number;
  peek: () => string | undefined;
  next: () => IteratorResult<string>;
};

const staticCursor: Cursor = {
  string: "",
  position: 0,
  get remaining() {
    return this.string.length - this.position;
  },
  peek() {
    if (this.remaining === 0) return undefined;
    return this.string.charAt(this.position);
  },
  next() {
    if (this.remaining === 0) return { value: undefined, done: true };
    return { value: this.string.charAt(this.position++), done: false };
  },
  [Symbol.iterator]() {
    return this;
  },
} satisfies Cursor;

export const createCursor = (source: string): Cursor => {
  const cursor: Cursor = Object.create(staticCursor);
  cursor.string = source;

  return cursor;
};
