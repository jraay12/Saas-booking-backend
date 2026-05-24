export class UnAuthorized extends Error {
  constructor(message: string = "UnAuthorized") {
    super(message);
    this.name = "UnAuthorizedError";
  }
}
