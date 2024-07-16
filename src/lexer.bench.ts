import path from "node:path";
import { bench, run } from "mitata";
import { tokenize } from "./lexer";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "Erc20.sol")).text();

bench("erc20", () => tokenize(source));

await run();