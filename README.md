# Allegedly

A [Solidity](https://soliditylang.org) compiler optimized for EVM simulations, written in TypeScript.

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

## Benchmarks

|           | bundle size | compilation speed (weth9) |
|-----------|-------------|---------------------------|
| solc      |             |                           |
| allegedly |             |                           |

## Supported Language Features

- [x] none
- [ ] all
