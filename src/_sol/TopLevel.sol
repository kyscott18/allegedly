error KyleError();

contract TopLevel {
  function run() external pure {
    revert KyleError();
  }
}