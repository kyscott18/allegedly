# Allegedly

A fast [Solidity](https://soliditylang.org) compiler for EVM simulations, written in TypeScript.

## Overview

```ts
import { sol } from "allegedly";

const depositContract = "0x...";

const { abi, code } = sol(`
contract GetBalance {
  function run() external returns (uint256) {
    return address(${depositContract}).balance;  
  }
}
`);
```

## [`solc`](https://github.com/ethereum/solidity)

This project is not meant to replace `solc`. Instead, it is smaller, faster, more modular alternative, that produces less efficient and less secure bytecode.

## Supported Language Features

- [x] none
- [ ] all
