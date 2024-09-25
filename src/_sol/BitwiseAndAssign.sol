contract BitwiseAndAssign {
  function run() external {
    uint256 x = 12;
    x &= uint256(5);
  }
}
