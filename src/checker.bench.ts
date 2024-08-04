import path from "node:path";
import { bench, run } from "mitata";
import { check } from "./checker";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text();
const ast = parse(tokenize(source));

bench("check", () => check(ast));

await run();
