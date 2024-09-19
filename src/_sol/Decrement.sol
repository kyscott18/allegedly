contract Increment {
  function run() external returns (uint256) {
    uint256 x = 1;
    x--;
    return x;
  }
}