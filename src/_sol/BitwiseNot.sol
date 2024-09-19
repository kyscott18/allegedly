contract BitwiseNot {
  function run() external returns (uint256) {
    uint256 x = 10;
    return ~x;
  }
}