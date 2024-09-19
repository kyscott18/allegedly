contract AssignmentTuple {
  function run() external returns (uint256) {
    uint256 x;
    uint256 y;
    (x, y) = (10, 12);
    return x;
  }
}