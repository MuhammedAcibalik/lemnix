export class RepositoryError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "RepositoryError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
