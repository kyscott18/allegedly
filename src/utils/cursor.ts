export type Cursor = IterableIterator<string> & {
  string: string;
  position: number;
  line: number;
  offset: number;
  remaining: number;
  peek: () => string | undefined;
};

const staticCursor: Cursor = {
  string: "",
  position: 0,
  line: 0,
  offset: 0,
  get remaining() {
    return this.string.length - this.position;
  },
  peek() {
    if (this.remaining === 0) return undefined;
    return this.string.charAt(this.position);
  },
  next() {
    if (this.remaining === 0) return { value: undefined, done: true };

    const value = this.string.charAt(this.position++);

    if (value === "\r" || value === "\n") {
      this.line++;
      this.offset = 0;
    } else {
      this.offset++;
    }

    return { value, done: false };
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
