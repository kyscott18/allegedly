# Allegedly

A [Solidity](https://soliditylang.org) compiler optimized for EVM simulations, written in TypeScript.

## Features

- Compile Solidity anywhere JavaScript runs
- Returns strictly typed ABIs
- Inject external contract ABIs

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

## [`solc-js`](https://github.com/ethereum/solc-js)

## Supported Language Features

- [x] none
- [ ] all
