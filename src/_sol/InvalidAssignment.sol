contract InvalidAssignment {
  function fn() external pure {
    uint256 x;
    x = "0";
  }
}