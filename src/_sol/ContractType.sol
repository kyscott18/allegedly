contract Contract1 {
  function run() external returns (uint256) {
    return 10;
  }
}

contract Contract2 {
  function run() external returns (uint256) {
    Contract1 c1 = Contract1(0x0000000000000000000000000000000000000000);
    uint256 r = c1.run();
    return r;
  }
}