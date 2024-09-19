contract Negative {
  function run() external returns (int256) {
    int256 x = 1;
    return -x;
  }
}