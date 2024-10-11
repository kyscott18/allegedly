contract Contract1 {
  function run() external returns (uint256) {
    return 10;
  }

  function run(uint256 x) external returns (uint256) {
    return x;
  }
}

contract Contract2 {
  function run() external returns (uint256) {
    uint256 r = Contract1(0x0000000000000000000000000000000000000000).run();
    return r;
  }
}