contract Assignment {
  function run() external {
    uint256 x;
    uint256 y; 

    x = 10;

    // nested assign
    y = x = 5; 
    
    // tuple assign
    (x, y) = (10, 12);
  }
}