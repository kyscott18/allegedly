contract Increment {
  function run() external returns (uint256) {
    uint256 x;
    x++;
    return x;
  }
}