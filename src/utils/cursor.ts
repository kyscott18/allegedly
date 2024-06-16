export type Cursor = {
  string: string;
  position: number;
  remaining: number;
  read(): string | undefined;
};

const staticCursor: Cursor = {
  string: "",
  position: 0,
  get remaining() {
    return this.string.length - this.position;
  },
  read() {
    const match = this.string.slice(this.position).match(/\w+/);

    if (match === null) return undefined;

    this.position += match[0]!.length;

    return match[0]!;
  },
};

export const createCursor = (source: string): Cursor => {
  const cursor: Cursor = Object.create(staticCursor);
  cursor.string = source;

  return cursor;
};
