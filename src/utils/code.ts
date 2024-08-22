import { type Hex, concat, padHex } from "viem";

export enum Code {
  MLOAD = "0x51",
  MSTORE = "0x52",
  PUSH1 = "0x60",
  PUSH2 = "0x61",
  PUSH3 = "0x62",
  PUSH4 = "0x63",
  PUSH5 = "0x64",
  PUSH6 = "0x65",
  PUSH7 = "0x66",
  PUSH8 = "0x67",
  PUSH9 = "0x68",
  PUSH10 = "0x69",
  PUSH11 = "0x6a",
  PUSH12 = "0x6b",
  PUSH13 = "0x6c",
  PUSH14 = "0x6d",
  PUSH15 = "0x6e",
  PUSH16 = "0x6f",
  PUSH17 = "0x70",
  PUSH18 = "0x71",
  PUSH19 = "0x72",
  PUSH20 = "0x73",
  PUSH21 = "0x74",
  PUSH22 = "0x75",
  PUSH23 = "0x76",
  PUSH24 = "0x77",
  PUSH25 = "0x78",
  PUSH26 = "0x79",
  PUSH27 = "0x7a",
  PUSH28 = "0x7b",
  PUSH29 = "0x7c",
  PUSH30 = "0x7d",
  PUSH31 = "0x7e",
  PUSH32 = "0x7f",
  RETURN = "0xf3",
}

export const push = (x: Hex): Hex => {
  switch (x.length - 2) {
    case 2:
      return concat([Code.PUSH1, x]);
    case 4:
      return concat([Code.PUSH2, x]);
    case 6:
      return concat([Code.PUSH3, x]);
    case 8:
      return concat([Code.PUSH4, x]);
    case 10:
      return concat([Code.PUSH5, x]);
    case 12:
      return concat([Code.PUSH6, x]);
    case 14:
      return concat([Code.PUSH7, x]);
    case 16:
      return concat([Code.PUSH8, x]);
    case 18:
      return concat([Code.PUSH9, x]);
    case 20:
      return concat([Code.PUSH10, x]);
    case 22:
      return concat([Code.PUSH11, x]);
    case 24:
      return concat([Code.PUSH12, x]);
    case 26:
      return concat([Code.PUSH13, x]);
    case 28:
      return concat([Code.PUSH14, x]);
    case 30:
      return concat([Code.PUSH15, x]);
    case 32:
      return concat([Code.PUSH16, x]);
    case 34:
      return concat([Code.PUSH17, x]);
    case 36:
      return concat([Code.PUSH18, x]);
    case 38:
      return concat([Code.PUSH19, x]);
    case 40:
      return concat([Code.PUSH20, x]);
    case 42:
      return concat([Code.PUSH21, x]);
    case 44:
      return concat([Code.PUSH22, x]);
    case 46:
      return concat([Code.PUSH23, x]);
    case 48:
      return concat([Code.PUSH24, x]);
    case 50:
      return concat([Code.PUSH25, x]);
    case 52:
      return concat([Code.PUSH26, x]);
    case 54:
      return concat([Code.PUSH27, x]);
    case 56:
      return concat([Code.PUSH28, x]);
    case 58:
      return concat([Code.PUSH29, x]);
    case 60:
      return concat([Code.PUSH30, x]);
    case 62:
      return concat([Code.PUSH31, x]);
    case 64:
      return concat([Code.PUSH32, x]);

    default:
      throw Error(`Unexpected push: ${x}`);
  }
};

export const pad = (x: Hex): Hex => {
  const bytes = Math.ceil((x.length - 2) / 2);
  return padHex(x, { size: bytes });
};
