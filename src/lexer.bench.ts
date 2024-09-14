import path from "node:path";
import { bench, run } from "mitata";
import { tokenize } from "./lexer";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text();

bench("tokenize", () => tokenize(source));

await run();
