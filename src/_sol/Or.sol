contract Or {
  function run() external returns (bool) {
    return bool(true) || bool(false);
  }
}