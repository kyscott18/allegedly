contract BitwiseXor {
  function run() external returns (uint256) {
    return uint256(12) ^ uint128(5);
  }
}
