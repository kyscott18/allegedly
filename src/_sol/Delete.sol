contract Delete {
  function run() external returns (uint256) {
    uint256 x = 10;
    delete x;
    return x;
  }
}