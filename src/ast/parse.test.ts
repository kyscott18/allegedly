import { test } from "bun:test";
import { parse } from "./parse";

test("parse contract", () => {
  const ast = parse(`
contract Test {
  uint256 hi;      
}`);

  console.log(ast);
});
