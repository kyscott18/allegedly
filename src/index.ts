import { parse } from "./ast/parse";

export const compile = (source: string) => {
	const ast = parse(source);
};
