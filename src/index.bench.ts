import path from "node:path";
import { bench, run } from "mitata";
import { sol } from ".";

const source = await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text();

bench("sol", () => sol(source));

await run();
