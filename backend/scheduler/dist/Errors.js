export class BaseError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
export class SqlError extends BaseError {
    constructor(message = "Unexpected error while querying SQL database", statusCode) {
        super(message, statusCode);
    }
}
