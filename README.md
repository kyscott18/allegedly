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

### Functions

- [x] type conversions
- [ ] `keccak256()`
- [ ] `abi.encode()`
- [ ] `abi.encodePacked()`

### Variables

### Types

- [ ] `address`
- [ ] `uint{size}`
- [ ] `int{size}`
- [ ] `bytes{size}`
- [ ] `string`
- [ ] `bytes`
- [ ] `bool`
- [ ] tuple
- [ ] struct
- [ ] enum
- [ ] mapping
- [ ] array
- [ ] user-defined: `type UserType is uint256;`

### Statements

- [ ] `if (x) { }`
- [ ] `for (x; x < 10; x++) { }`
- [ ] `while (x) {}`
- [ ] `do { } while (x)`
- [ ] `break`
- [ ] `continue`
- [ ] `return`
- [ ] `unchecked { }`

### Expressions

- [ ] `x++` or `++x`
- [ ] `x--` or `--x`
- [ ] `-x`
- [ ] `delete x`
- [ ] `!x`
- [ ] `~x`
- [ ] `x + y`
- [ ] `x - y`
- [ ] `x * y`
- [ ] `x / y`
- [ ] `x % y`
- [ ] `x ** y`
- [ ] `x && y`
- [ ] `x || y`
- [ ] `x == y`
- [ ] `x != y`
- [ ] `x < y`
- [ ] `x <= y`
- [ ] `x > y`
- [ ] `x >= y`
- [ ] `x & y`
- [ ] `x | y`
- [ ] `x ^ y`
- [ ] `x >> y`
- [ ] `x << y`
- [ ] `x ? y : z`

### Errors

### Events

### Data locations

- [x] memory
- [x] calldata
- [x] returndata
- [ ] storage
- [ ] transient storage

### Directives

- [ ] `import "file.sol";`
- [ ] `pragma solidity 0.minor.patch;`
- [ ] `// SPDX-License-Identifier: ...`
- [ ] `using UserType for {type}`

### Yul

- [ ] `assembly { }`

### Inheritance

### Miscellaneous
