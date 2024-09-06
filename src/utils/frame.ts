import { createColors } from "picocolors";
import type { SourceLocation } from "../types/utils";

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * Create a code-frame, with markers pointing to `loc`.
 */
export const frame = (source: string, loc: SourceLocation, message?: string) => {
  const lines = source.split(NEWLINE);

  const start = Math.max(loc.start.line - (2 + 1), 0);
  const end = Math.min(loc.end.line + 3, lines.length);

  const numberMaxWidth = String(end).length;

  const colors = createColors(true);

  let frame = source
    .split(NEWLINE, end)
    .slice(start, end)
    .flatMap((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} |`;

      if (number === loc.start.line) {
        const markerOffset = loc.start.offset - 1;
        const markerLength =
          loc.start.line === loc.end.line
            ? loc.end.offset - loc.start.offset
            : line.length - loc.start.offset;

        return [
          `${colors.bold(">")}${colors.bold(gutter)}${line.length > 0 ? ` ${line}` : ""}`,
          `  ${" ".repeat(numberMaxWidth)} ${colors.bold("|")} ${" ".repeat(markerOffset)}${colors.bold(colors.red("^")).repeat(markerLength)}`,
        ];
      }

      return ` ${colors.bold(gutter)}${line.length > 0 ? ` ${line}` : ""}`;
    })
    .join("\n");

  if (message) {
    frame = `${frame}\n\n${colors.bold(colors.red(message))}`;
  }

  return frame;
};

export const recoverSource = (source: string, loc: SourceLocation) => {
  return source.split(NEWLINE)[loc.start.line - 1]!.slice(loc.start.offset - 1, loc.end.offset - 1);
};
