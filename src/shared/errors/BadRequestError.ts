export class BadRequestError extends Error {
  constructor(message: string = "BadRequest") {
    super(message);
    this.name = "BadRequestError";
  }
}
