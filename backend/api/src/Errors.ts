export class BaseError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class SqlError extends BaseError {
    constructor(
        message: string = "Unexpected error while querying SQL database",
        statusCode: number
    ) {
        super(message, statusCode);
    }
}
