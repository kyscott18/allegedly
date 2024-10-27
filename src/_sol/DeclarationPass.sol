contract C {
  function run() external {
    I i;
    identity(10);
  }

    function identity(uint256 x) internal returns (uint256) {
    return x;
  }
}

interface I { }