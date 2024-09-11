import { type Hex, concat, padHex } from "viem";

export enum Code {
  STOP = "0x00",
  ADD = "0x01",
  EQ = "0x14",
  NOT = "0x19",
  SHR = "0x1c",
  CALLDATALOAD = "0x35",
  CALLDATASIZE = "0x36",
  CALLDATACOPY = "0x37",
  POP = "0x50",
  MLOAD = "0x51",
  MSTORE = "0x52",
  JUMP = "0x56",
  JUMPI = "0x57",
  GAS = "0x5a",
  JUMPDEST = "0x5b",
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
  DUP1 = "0x80",
  SWAP5 = "0x94",
  CALL = "0xf1",
  RETURN = "0xf3",
  INVALID = "0xfe",
}

export const push = (x: Hex): Hex => {
  const hex = pad(x);

  switch (hex.length - 2) {
    case 2:
      return concat([Code.PUSH1, hex]);
    case 4:
      return concat([Code.PUSH2, hex]);
    case 6:
      return concat([Code.PUSH3, hex]);
    case 8:
      return concat([Code.PUSH4, hex]);
    case 10:
      return concat([Code.PUSH5, hex]);
    case 12:
      return concat([Code.PUSH6, hex]);
    case 14:
      return concat([Code.PUSH7, hex]);
    case 16:
      return concat([Code.PUSH8, hex]);
    case 18:
      return concat([Code.PUSH9, hex]);
    case 20:
      return concat([Code.PUSH10, hex]);
    case 22:
      return concat([Code.PUSH11, hex]);
    case 24:
      return concat([Code.PUSH12, hex]);
    case 26:
      return concat([Code.PUSH13, hex]);
    case 28:
      return concat([Code.PUSH14, hex]);
    case 30:
      return concat([Code.PUSH15, hex]);
    case 32:
      return concat([Code.PUSH16, hex]);
    case 34:
      return concat([Code.PUSH17, hex]);
    case 36:
      return concat([Code.PUSH18, hex]);
    case 38:
      return concat([Code.PUSH19, hex]);
    case 40:
      return concat([Code.PUSH20, hex]);
    case 42:
      return concat([Code.PUSH21, hex]);
    case 44:
      return concat([Code.PUSH22, hex]);
    case 46:
      return concat([Code.PUSH23, hex]);
    case 48:
      return concat([Code.PUSH24, hex]);
    case 50:
      return concat([Code.PUSH25, hex]);
    case 52:
      return concat([Code.PUSH26, hex]);
    case 54:
      return concat([Code.PUSH27, hex]);
    case 56:
      return concat([Code.PUSH28, hex]);
    case 58:
      return concat([Code.PUSH29, hex]);
    case 60:
      return concat([Code.PUSH30, hex]);
    case 62:
      return concat([Code.PUSH31, hex]);
    case 64:
      return concat([Code.PUSH32, hex]);

    default:
      throw Error(`Unexpected push: ${hex}`);
  }
};

export const pad = (x: Hex): Hex => {
  const bytes = Math.ceil((x.length - 2) / 2);
  return padHex(x, { size: bytes });
};

export const functionSelectorMask = "0xffffffff";
