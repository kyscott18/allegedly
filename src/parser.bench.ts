import path from "node:path";
import { bench, run } from "mitata";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text();
const tokens = tokenize(source);

bench("erc20", () => parse(tokens));

await run();
