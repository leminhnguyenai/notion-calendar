export class BaseError extends Error {
    statusCode: 400 | 404 | 502;
    constructor(message: string, statusCode: 400 | 404 | 502) {
        super(message);
        this.statusCode = statusCode;
    }
}
