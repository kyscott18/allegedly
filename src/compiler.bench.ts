import path from "node:path";
import { bench, run } from "mitata";
import { check } from "./checker";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "GetBalance.sol")).text();
const ast = parse(source, tokenize(source));
const annotations = check(source, ast);

bench("compile", () => compile(source, ast, annotations));

await run();
