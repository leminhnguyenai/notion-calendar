export class BaseError extends Error {
    statusCode: 400 | 403 | 404 | 502;
    constructor(message: string, statusCode: 400 | 403 | 404 | 502) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class SqlError extends BaseError {
    constructor(
        message: string = "Unexpected error while querying SQL database",
        statusCode: 400 | 403 | 404 | 502
    ) {
        super(message, statusCode);
    }
}
