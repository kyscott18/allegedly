export type EOFErrorType = EOFError & {
  name: "EOFError";
};
export class EOFError extends Error {
  override name = "EOFError";
  constructor() {
    super("Unexpected end of file.");
  }
}
