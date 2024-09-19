contract GetBalance {
  function run(address addr) external returns (uint256) {
    return addr.balance;
  }
}