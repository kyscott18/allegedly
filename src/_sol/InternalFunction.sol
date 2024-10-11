contract InternalFunction {
  function identity(uint256 x) internal returns (uint256) {
    return x;
  }

  function run() external {
    identity(10);
  }
}