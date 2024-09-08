import path from "node:path";
import { bench, run } from "mitata";
import { check } from "./checker";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "GetBalance.sol")).text();
const ast = parse(source, tokenize(source));

bench("check", () => check(source, ast));

await run();
