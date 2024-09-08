import path from "node:path";
import { bench, run } from "mitata";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "GetBalance.sol")).text();
const tokens = tokenize(source);

bench("parse", () => parse(source, tokens));

await run();
