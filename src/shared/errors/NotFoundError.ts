export class NotFoundError extends Error {
  constructor(message: string = "NotFound") {
    super(message);
    this.name = "NotFoundError";
  }
}
