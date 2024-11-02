export class BaseError extends Error {
    statusCode: number;
    errorCode: string;
    constructor(errorCode: string, message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}
