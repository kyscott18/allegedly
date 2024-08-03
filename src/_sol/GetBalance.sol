contract GetBalance {
  function run(address addr) external view returns (uint256) {
    return addr.balance;  
  }
}