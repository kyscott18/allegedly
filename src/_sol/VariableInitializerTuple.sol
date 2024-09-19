contract VariableIntializerTuple {
  function run() external returns (uint256) {
    (uint256 x, uint256 y) = (10, 12);
    return x;
  }
}