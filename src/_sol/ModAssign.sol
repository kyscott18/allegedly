contract ModAssign {
  function run() external {
    uint256 x = 52;
    x %= uint256(10);
  }
}