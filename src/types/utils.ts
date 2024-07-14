export type TODO = any;

export type Hex = `0x${string}`;
export type Address = `0x${string}`;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
