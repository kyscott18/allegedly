contract ShiftLeftAssign {
  function run() external returns (uint256) {
    uint256 x = 12;
    x <<= uint256(2);
  }
}
