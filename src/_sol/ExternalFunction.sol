contract InternalFunction {
  function identity(uint256 x) external returns (uint256) {
    return x;
  }

  function run() external {
    this.identity(10);
  }
}