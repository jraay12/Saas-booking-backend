export class ForbbidenError extends Error {
  constructor(message: string = "Forbbiden") {
    super(message);
    this.name = "ForbbidenError";
  }
}
